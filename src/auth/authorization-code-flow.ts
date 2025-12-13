import axios, { AxiosInstance } from 'axios';
import { TokenResponse, StoredToken, AuthorizationCodeFlowConfig, PKCEPair, AuthError } from '../types/index.js';
import { generatePKCEPair, generateState, maskSecret } from '../utils/index.js';
import { TokenManager } from './token-manager.js';

const AUTH_SERVER_URL = 'https://oauth.iracing.com';
const AUTHORIZE_ENDPOINT = `${AUTH_SERVER_URL}/oauth2/authorize`;
const TOKEN_ENDPOINT = `${AUTH_SERVER_URL}/oauth2/token`;

/**
 * State stored during authorization code flow
 */
interface AuthorizationState {
  state: string;
  codeVerifier?: string;
  timestamp: number;
}

/**
 * AuthorizationCodeFlowAuth handles the OAuth2 authorization code flow.
 * This is the preferred flow for distributed applications and public clients.
 *
 * See: https://oauth.iracing.com/oauth2/book/authorization_code_flow.html
 */
export class AuthorizationCodeFlowAuth {
  private config: AuthorizationCodeFlowConfig;
  private tokenManager: TokenManager;
  private httpClient: AxiosInstance;
  private tokenKey = 'auth_code_token';

  // State management for authorization flow
  private pendingAuthorizationState: Map<string, AuthorizationState> = new Map();
  private stateTimeout = 10 * 60 * 1000; // 10 minutes

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
   * @returns Object containing authorizationUrl and state for verification
   */
  generateAuthorizationUrl(): { authorizationUrl: string; state: string; codeVerifier?: string } {
    const state = generateState();
    const pkce = this.config.usePKCE ? generatePKCEPair() : undefined;

    // Store authorization state for later verification
    this.pendingAuthorizationState.set(state, {
      state,
      codeVerifier: pkce?.codeVerifier,
      timestamp: Date.now(),
    });

    // Clean up old states
    this.cleanupOldStates();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
    });

    if (this.config.scope) {
      params.append('scope', this.config.scope);
    }

    if (pkce) {
      params.append('code_challenge', pkce.codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    const authorizationUrl = `${AUTHORIZE_ENDPOINT}?${params.toString()}`;

    return {
      authorizationUrl,
      state,
      codeVerifier: pkce?.codeVerifier,
    };
  }

  /**
   * Handle the callback from the authorization server
   * @param code - Authorization code from redirect_uri
   * @param state - State parameter from redirect_uri
   * @returns Access token string
   * @throws AuthError if exchange fails or state is invalid
   */
  async handleCallback(code: string, state: string): Promise<string> {
    // Verify state
    const authState = this.pendingAuthorizationState.get(state);
    if (!authState) {
      throw {
        error: 'invalid_state',
        error_description: 'State parameter does not match or has expired',
      } as AuthError;
    }

    // Remove the used state
    this.pendingAuthorizationState.delete(state);

    try {
      return await this.exchangeCodeForToken(code, state, authState.codeVerifier);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string, state: string, codeVerifier?: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: this.config.redirectUri,
      state,
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

  /**
   * Clean up authorization states older than stateTimeout
   */
  private cleanupOldStates(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.pendingAuthorizationState.forEach((state, key) => {
      if (now - state.timestamp > this.stateTimeout) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => {
      this.pendingAuthorizationState.delete(key);
    });
  }
}
