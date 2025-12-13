/**
 * OAuth2 Token Response from iRacing Auth Service
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
}

/**
 * Token data stored locally with expiry information
 */
export interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  refreshTokenExpiresAt?: number;
  scope?: string;
}

/**
 * Configuration for Password Limited Grant flow
 */
export interface PasswordLimitedGrantConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  scope?: string;
}

/**
 * Configuration for Authorization Code Flow
 */
export interface AuthorizationCodeFlowConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope?: string;
  usePKCE?: boolean;
}

/**
 * PKCE code pair for authorization code flow
 */
export interface PKCEPair {
  codeChallenge: string;
  codeVerifier: string;
}

/**
 * Error response from iRacing Auth Service
 */
export interface AuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
  status?: number;
  retryAfter?: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * API Client configuration
 */
export interface IRacingAPIClientConfig {
  auth: PasswordLimitedGrantConfig | AuthorizationCodeFlowConfig;
  baseUrl?: string;
  timeout?: number;
}

/**
 * Export all API request and response types
 */
export * from './api-request-params';
export * from './api-response-types';
