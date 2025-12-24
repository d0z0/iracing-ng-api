import crypto from 'node:crypto';
import { PKCEPair } from '../types';

/**
 * Mask a secret (client_secret or password) using iRacing's masking algorithm.
 * This is required for the password_limited and authorization_code grants.
 *
 * The masking algorithm is: base64(sha256(secret + normalized_id))
 * where normalized_id is the id trimmed and lowercased.
 *
 * @param secret - The secret to mask (client_secret or password)
 * @param id - The identifier to mask with (client_id for client_secret, username for password)
 * @returns Base64 encoded SHA-256 hash
 */
export function maskSecret(secret: string, id: string): string {
  const normalizedId = id.trim().toLowerCase();
  const combined = `${secret}${normalizedId}`;

  const hasher = crypto.createHash('sha256');
  hasher.update(combined);

  return hasher.digest('base64');
}

/**
 * Generate a PKCE code pair for authorization code flow.
 * Creates a code_verifier and derives a code_challenge from it.
 *
 * @returns PKCEPair with codeChallenge and codeVerifier
 */
export function generatePKCEPair(): PKCEPair {
  // Generate a random code_verifier (43-128 characters of [A-Z] [a-z] [0-9] - . _ ~)
  const codeVerifier = crypto.randomBytes(32).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  // Create code_challenge from code_verifier using SHA-256
  const hasher = crypto.createHash('sha256');
  hasher.update(codeVerifier);
  const codeChallenge = hasher.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return { codeChallenge, codeVerifier };
}

/**
 * Generate a random state parameter for authorization code flow.
 * The state parameter is used to prevent CSRF attacks.
 *
 * @returns Random state string
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a token has expired based on the expiry time.
 *
 * @param expiresAt - The timestamp when the token expires (milliseconds)
 * @param bufferSeconds - Number of seconds to consider as buffer before actual expiry (default: 30)
 * @returns true if token has expired or will expire within buffer time
 */
export function isTokenExpired(expiresAt: number, bufferSeconds: number = 30): boolean {
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;
  return now >= expiresAt - bufferMs;
}
