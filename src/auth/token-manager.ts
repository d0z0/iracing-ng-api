import { StoredToken } from '../types';
import { isTokenExpired } from '../utils';

/**
 * TokenManager handles storing, retrieving, and refreshing tokens.
 * Supports both in-memory storage and custom storage implementations.
 */
export class TokenManager {
  private tokens: Map<string, StoredToken> = new Map();
  private storageKey = 'iracing_tokens';

  /**
   * Initialize TokenManager with optional persisted tokens
   * @param persistedTokens - Previously stored tokens to restore
   */
  constructor(persistedTokens?: Record<string, StoredToken>) {
    if (persistedTokens) {
      Object.entries(persistedTokens).forEach(([key, token]) => {
        this.tokens.set(key, token);
      });
    }
  }

  /**
   * Store a token
   * @param key - Identifier for the token (e.g., username or 'default')
   * @param token - Token data to store
   */
  setToken(key: string, token: StoredToken): void {
    this.tokens.set(key, token);
  }

  /**
   * Retrieve a stored token
   * @param key - Identifier for the token
   * @returns Stored token or undefined if not found
   */
  getToken(key: string): StoredToken | undefined {
    return this.tokens.get(key);
  }

  /**
   * Get a valid access token, returns null if expired or not found
   * @param key - Identifier for the token
   * @returns Access token string or null if not valid
   */
  getValidAccessToken(key: string): string | null {
    const token = this.getToken(key);
    if (!token) return null;

    // Check if token is expired (with 30 second buffer)
    if (isTokenExpired(token.expiresAt, 30)) {
      return null;
    }

    return token.accessToken;
  }

  /**
   * Check if a refresh token is available and valid
   * @param key - Identifier for the token
   * @returns true if refresh token exists and is not expired
   */
  hasValidRefreshToken(key: string): boolean {
    const token = this.getToken(key);
    if (!token || !token.refreshToken) return false;

    // Check if refresh token is expired
    if (token.refreshTokenExpiresAt && isTokenExpired(token.refreshTokenExpiresAt, 30)) {
      return false;
    }

    return true;
  }

  /**
   * Get refresh token
   * @param key - Identifier for the token
   * @returns Refresh token string or null if not available
   */
  getRefreshToken(key: string): string | null {
    const token = this.getToken(key);
    if (!token || !token.refreshToken) return null;

    // Check if refresh token is expired
    if (token.refreshTokenExpiresAt && isTokenExpired(token.refreshTokenExpiresAt, 30)) {
      return null;
    }

    return token.refreshToken;
  }

  /**
   * Clear all stored tokens
   */
  clear(): void {
    this.tokens.clear();
  }

  /**
   * Clear a specific token
   * @param key - Identifier for the token
   */
  clearToken(key: string): void {
    this.tokens.delete(key);
  }

  /**
   * Get all stored tokens for export/persistence
   * @returns Object with all stored tokens
   */
  exportTokens(): Record<string, StoredToken> {
    const exported: Record<string, StoredToken> = {};
    this.tokens.forEach((token, key) => {
      exported[key] = token;
    });
    return exported;
  }
}
