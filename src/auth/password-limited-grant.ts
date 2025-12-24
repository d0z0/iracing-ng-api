import axios, { AxiosInstance } from 'axios';
import { TokenResponse, StoredToken, PasswordLimitedGrantConfig, AuthError } from '../types';
import { maskSecret } from '../utils';
import { TokenManager } from './token-manager';

const AUTH_SERVER_URL = 'https://oauth.iracing.com';
const TOKEN_ENDPOINT = `${AUTH_SERVER_URL}/oauth2/token`;

/**
 * PasswordLimitedGrantAuth handles authentication using the password_limited grant.
 * This grant is suitable for headless/server-side clients with registered users.
 *
 * See: https://oauth.iracing.com/oauth2/book/token_endpoint.html#password-limited-grant
 */
export class PasswordLimitedGrantAuth {
  private config: PasswordLimitedGrantConfig;
  private tokenManager: TokenManager;
  private httpClient: AxiosInstance;
  private tokenKey: string;

  constructor(config: PasswordLimitedGrantConfig, tokenManager: TokenManager, httpClient?: AxiosInstance) {
    this.config = config;
    this.tokenManager = tokenManager;
    this.tokenKey = config.username;
    this.httpClient =
      httpClient ||
      axios.create({
        timeout: 10000,
      });
  }

  /**
   * Get a valid access token, authenticating if necessary
   * @returns Access token string
   * @throws AuthError if authentication fails
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    const validToken = this.tokenManager.getValidAccessToken(this.tokenKey);
    if (validToken) {
      return validToken;
    }

    // Check if we can refresh
    const refreshToken = this.tokenManager.getRefreshToken(this.tokenKey);
    if (refreshToken) {
      try {
        return await this.refreshToken(refreshToken);
      } catch (error) {
        // If refresh fails, fall through to re-authenticate
        console.warn('Token refresh failed, re-authenticating');
      }
    }

    // Perform full authentication
    return await this.authenticate();
  }

  /**
   * Authenticate using username and password
   * @returns Access token string
   * @throws AuthError if authentication fails
   */
  async authenticate(): Promise<string> {
    try {
      const maskedSecret = maskSecret(this.config.clientSecret, this.config.clientId);
      const maskedPassword = maskSecret(this.config.password, this.config.username);

      const params = new URLSearchParams({
        grant_type: 'password_limited',
        client_id: this.config.clientId,
        client_secret: maskedSecret,
        username: this.config.username,
        password: maskedPassword,
      });

      if (this.config.scope) {
        params.append('scope', this.config.scope);
      }

      const response = await this.httpClient.post<TokenResponse>(TOKEN_ENDPOINT, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.handleTokenResponse(response.data);
      return response.data.access_token;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh an access token using a refresh token
   * @param refreshToken - The refresh token to use
   * @returns New access token string
   * @throws AuthError if refresh fails
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const maskedSecret = maskSecret(this.config.clientSecret, this.config.clientId);

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: maskedSecret,
        refresh_token: refreshToken,
      });

      const response = await this.httpClient.post<TokenResponse>(TOKEN_ENDPOINT, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.handleTokenResponse(response.data);
      return response.data.access_token;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get the current stored token
   * @returns StoredToken or undefined
   */
  getStoredToken(): StoredToken | undefined {
    return this.tokenManager.getToken(this.tokenKey);
  }

  /**
   * Manually clear the stored token
   */
  clearToken(): void {
    this.tokenManager.clearToken(this.tokenKey);
  }

  /**
   * Handle token response and store it
   */
  private handleTokenResponse(response: TokenResponse): void {
    const now = Date.now();
    const expiresAt = now + response.expires_in * 1000;
    const refreshTokenExpiresAt = response.refresh_token_expires_in ? now + response.refresh_token_expires_in * 1000 : undefined;

    const storedToken: StoredToken = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt,
      refreshTokenExpiresAt,
      scope: response.scope,
    };

    this.tokenManager.setToken(this.tokenKey, storedToken);
  }

  /**
   * Handle errors from authentication requests
   */
  private handleError(error: unknown): AuthError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as Record<string, unknown>;

      const authError: AuthError = {
        error: (data?.error as string) || 'unknown_error',
        error_description: (data?.error_description as string) || error.message,
        status,
      };

      // Extract rate limit information if present
      const headers = error.response?.headers || {};
      if (headers['ratelimit-limit']) {
        authError.rateLimit = {
          limit: parseInt(headers['ratelimit-limit'] as string, 10),
          remaining: parseInt(headers['ratelimit-remaining'] as string, 10),
          reset: parseInt(headers['ratelimit-reset'] as string, 10),
        };
      }

      if (headers['retry-after']) {
        authError.retryAfter = parseInt(headers['retry-after'] as string, 10);
      }

      return authError;
    }

    return {
      error: 'network_error',
      error_description: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
