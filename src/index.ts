import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PasswordLimitedGrantConfig, AuthorizationCodeFlowConfig, IRacingAPIClientConfig } from './types/index.js';
import { TokenManager } from './auth/token-manager.js';
import { PasswordLimitedGrantAuth } from './auth/password-limited-grant.js';
import { AuthorizationCodeFlowAuth } from './auth/authorization-code-flow.js';

const DATA_API_BASE_URL = 'https://members-ng.iracing.com';

/**
 * Main iRacing Data API client
 * Supports both Password Limited Grant and Authorization Code Flow authentication
 */
export class IRacingAPIClient {
  private httpClient: AxiosInstance;
  private authHttpClient: AxiosInstance;
  private tokenManager: TokenManager;
  private passwordGrantAuth?: PasswordLimitedGrantAuth;
  private authCodeFlowAuth?: AuthorizationCodeFlowAuth;
  private authType: 'password_limited' | 'authorization_code';

  constructor(config: IRacingAPIClientConfig) {
    const baseURL = config.baseUrl || DATA_API_BASE_URL;
    this.httpClient = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'iracing-ng-api/1.0.0',
      },
    });

    // Separate HTTP client for auth requests (without interceptors to avoid infinite loops)
    this.authHttpClient = axios.create({
      timeout: config.timeout || 30000,
    });

    this.tokenManager = new TokenManager();

    // Determine which auth flow to use
    const authConfig = config.auth;
    if ('username' in authConfig && 'password' in authConfig) {
      // Password Limited Grant
      this.authType = 'password_limited';
      this.passwordGrantAuth = new PasswordLimitedGrantAuth(
        authConfig as PasswordLimitedGrantConfig,
        this.tokenManager,
        this.authHttpClient
      );
    } else {
      // Authorization Code Flow
      this.authType = 'authorization_code';
      this.authCodeFlowAuth = new AuthorizationCodeFlowAuth(
        authConfig as AuthorizationCodeFlowConfig,
        this.tokenManager,
        this.authHttpClient
      );
    }

    // Add request interceptor to inject authentication token
    this.httpClient.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get access token based on auth type
   */
  private async getAccessToken(): Promise<string | null> {
    if (this.authType === 'password_limited' && this.passwordGrantAuth) {
      return await this.passwordGrantAuth.getAccessToken();
    } else if (this.authType === 'authorization_code' && this.authCodeFlowAuth) {
      return await this.authCodeFlowAuth.getAccessToken();
    }
    return null;
  }

  /**
   * For Authorization Code Flow: Generate authorization URL
   */
  generateAuthorizationUrl(): { authorizationUrl: string; state: string; codeVerifier?: string } {
    if (!this.authCodeFlowAuth) {
      throw new Error('Authorization Code Flow not configured');
    }
    return this.authCodeFlowAuth.generateAuthorizationUrl();
  }

  /**
   * For Authorization Code Flow: Handle OAuth callback
   */
  async handleAuthorizationCallback(code: string, state: string): Promise<string> {
    if (!this.authCodeFlowAuth) {
      throw new Error('Authorization Code Flow not configured');
    }
    return await this.authCodeFlowAuth.handleCallback(code, state);
  }

  /**
   * Generic GET request
   * iRacing API returns signed S3 URLs in the response that need to be fetched
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.httpClient.get<any>(url, config);

    // Check if response has the iRacing S3 link format
    if (response.data?.link) {
      const s3Url = response.data.link;
      // Fetch the actual data from the S3 link (without auth, it's a signed URL)
      const s3Response = await axios.get<T>(s3Url);
      return s3Response.data;
    }

    // If no link format, return data as-is
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.httpClient.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    this.tokenManager.clear();
  }

  /**
   * Get token manager for custom token handling
   */
  getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  /**
   * Get password limited grant auth (if using that flow)
   */
  getPasswordGrantAuth(): PasswordLimitedGrantAuth | undefined {
    return this.passwordGrantAuth;
  }

  /**
   * Get authorization code flow auth (if using that flow)
   */
  getAuthCodeFlowAuth(): AuthorizationCodeFlowAuth | undefined {
    return this.authCodeFlowAuth;
  }
}

export * from './types/index.js';
export * from './auth/index.js';
