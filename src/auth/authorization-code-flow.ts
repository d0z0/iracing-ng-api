import axios, { AxiosInstance } from 'axios';
import { TokenResponse, StoredToken, AuthorizationCodeFlowConfig, PKCEPair, AuthError } from '../types';
import { generatePKCEPair, maskSecret } from '../utils';
import { TokenManager } from './token-manager';

const AUTH_SERVER_URL = 'https://oauth.iracing.com';
const AUTHORIZE_ENDPOINT = `${AUTH_SERVER_URL}/oauth2/authorize`;
const TOKEN_ENDPOINT = `${AUTH_SERVER_URL}/oauth2/token`;

/**
 * AuthorizationCodeFlowAuth handles the OAuth2 authorization code flow.
 * This is the preferred flow for distributed applications and public clients.
 *
 * State management is handled by the application layer - the application is responsible
 * for creating the state parameter and verifying it before calling handleCallback.
 *
 * See: https://oauth.iracing.com/oauth2/book/authorization_code_flow.html
 */
export class AuthorizationCodeFlowAuth {
  private config: AuthorizationCodeFlowConfig;
  private tokenManager: TokenManager;
  private httpClient: AxiosInstance;
  private tokenKey = 'auth_code_token';

  constructor(config: AuthorizationCodeFlowConfig, tokenManager: TokenManager, httpClient?: AxiosInstance) {
    this.config = config;
    this.tokenManager = tokenManager;
    this.httpClient =
      httpClient ||
      axios.create({
        timeout: 10000,
      });
  }

  /**
   * Generate an authorization URL for redirecting the user to iRacing login
   * @param state - State parameter for CSRF protection (caller must generate and verify)
   * @returns Object containing authorizationUrl and codeVerifier (if PKCE enabled)
   */
  generateAuthorizationUrl(state: string): { authorizationUrl: string; codeVerifier?: string } {
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (this.config.usePKCE) {
      const pkce = generatePKCEPair();
      codeVerifier = pkce.codeVerifier;
      codeChallenge = pkce.codeChallenge;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
    });

    if (this.config.scope) {
      params.append('scope', this.config.scope);
    }

    if (codeChallenge) {
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    const authorizationUrl = `${AUTHORIZE_ENDPOINT}?${params.toString()}`;

    return {
      authorizationUrl,
      codeVerifier,
    };
  }

  /**
   * Handle the callback from the authorization server
   * @param code - Authorization code from redirect_uri
   * @param codeVerifier - PKCE code verifier (if PKCE was used)
   * @returns Access token string
   * @throws AuthError if exchange fails
   */
  async handleCallback(code: string, codeVerifier?: string): Promise<string> {
    try {
      return await this.exchangeCodeForToken(code, codeVerifier);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string, codeVerifier?: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: this.config.redirectUri,
    });

    // Add client_secret if available
    if (this.config.clientSecret) {
      const maskedSecret = maskSecret(this.config.clientSecret, this.config.clientId);
      params.append('client_secret', maskedSecret);
    }

    // Add code_verifier if using PKCE
    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    const response = await this.httpClient.post<TokenResponse>(TOKEN_ENDPOINT, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.handleTokenResponse(response.data);
    return response.data.access_token;
  }

  /**
   * Get a valid access token
   * @returns Access token string or null if not available
   */
  async getAccessToken(): Promise<string | null> {
    const validToken = this.tokenManager.getValidAccessToken(this.tokenKey);
    if (validToken) {
      return validToken;
    }

    // Try to refresh if we have a refresh token
    const refreshToken = this.tokenManager.getRefreshToken(this.tokenKey);
    if (refreshToken) {
      try {
        return await this.refreshToken(refreshToken);
      } catch (error) {
        console.warn('Token refresh failed');
        return null;
      }
    }

    return null;
  }

  /**
   * Refresh an access token using a refresh token
   * @param refreshToken - The refresh token to use
   * @returns New access token string
   * @throws AuthError if refresh fails
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        refresh_token: refreshToken,
      });

      if (this.config.clientSecret) {
        const maskedSecret = maskSecret(this.config.clientSecret, this.config.clientId);
        params.append('client_secret', maskedSecret);
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

      return authError;
    }

    return {
      error: 'network_error',
      error_description: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
