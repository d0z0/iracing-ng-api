# iRacing Members-NG Data API Node.js Client

A comprehensive Node.js client library for the iRacing members-ng Data API with built-in OAuth2 authentication support. Supports both the **Password Limited Grant** (for headless/server-side clients) and **Authorization Code Flow** (for distributed applications).

## Features

- ✅ **Password Limited Grant** - Server-side authentication with username/password
- ✅ **Authorization Code Flow** - Browser-based OAuth2 authentication with PKCE support
- ✅ **Automatic Token Management** - Handles token refresh and expiry automatically
- ✅ **Rate Limit Tracking** - Captures and exposes rate limit information
- ✅ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ✅ **Credential Masking** - Implements iRacing's SHA-256 masking algorithm for security
- ✅ **Flexible Token Storage** - Support for custom token persistence

## Installation

```bash
npm install iracing-ng-api
```

## Quick Start

### Password Limited Grant (Server-side)

```typescript
import { IRacingAPIClient } from 'iracing-ng-api';

const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    username: 'user@example.com',
    password: 'your-password',
    scope: 'iracing.auth',
  },
});

// First request triggers authentication
const userProfile = await client.get('/data/member/info');
console.log(userProfile);

// Subsequent requests use cached token automatically
const moreData = await client.get('/data/user/statistics');
```

### Authorization Code Flow (Browser/Desktop)

```typescript
import { IRacingAPIClient } from 'iracing-ng-api';

const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret', // Optional for public clients
    redirectUri: 'http://localhost:3000/callback',
    scope: 'iracing.auth',
    usePKCE: true, // Recommended for security
  },
});

// Step 1: Generate authorization URL and redirect user
const { authorizationUrl, state } = client.generateAuthorizationUrl();
// Redirect user to authorizationUrl

// Step 2: Handle callback (in your callback route handler)
const code = req.query.code;
const returnedState = req.query.state;
const accessToken = await client.handleAuthorizationCallback(code, returnedState);

// Step 3: Make API requests (token is used automatically)
const userProfile = await client.get('/data/member/info');
```

## Authentication Flows

### 1. Password Limited Grant

**When to use:**

- Server-side/headless applications
- Automated data collection scripts
- Background workers
- Services that run unattended

**Requirements:**

- Registered client application with iRacing
- Client ID and Client Secret
- Username and password (of registered user)
- Active iRacing subscription

**Important Notes:**

- This grant is rate-limited (strict enforcement on violations)
- Expect 2+ seconds per authentication call
- Use refresh tokens to maintain session after initial auth
- Only registered users can authenticate with this grant
- 2FA will NOT be enforced for this grant

```typescript
const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    username: 'user@example.com',
    password: 'password',
    scope: 'iracing.auth', // Optional
  },
});

try {
  const token = await client.getPasswordGrantAuth()?.getAccessToken();
  console.log('Authenticated!');
} catch (error) {
  if (error.retryAfter) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  }
}
```

### 2. Authorization Code Flow

**When to use:**

- Web applications
- Desktop/native applications
- Distributed client applications
- Any client distributed to end-users
- When users need to approve access

**Key Features:**

- Browser-based authentication (user sees iRacing login page)
- Optional PKCE support for enhanced security
- State parameter for CSRF protection
- Refresh token support
- Pluggable state storage for distributed systems

```typescript
const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret', // Optional for public clients
    redirectUri: 'https://yourapp.com/callback',
    scope: 'iracing.auth',
    usePKCE: true, // Use PKCE for public clients
  },
});

// Step 1: Generate URL
const { authorizationUrl, state, codeVerifier } = await client.generateAuthorizationUrl();
// state and codeVerifier are stored locally for verification

// Step 2: Redirect user to authorizationUrl
// User sees iRacing login and approval screen

// Step 3: Handle callback
const token = await client.handleAuthorizationCallback(code, state);
// Client will validate state and exchange code for tokens
```

#### Authorization State Management

The library leaves state management to the application. This allows flexibility for different deployment scenarios:

- **Single instance apps**: Store state in memory or sessionStorage
- **Load-balanced servers**: Store state in a database or cache
- **SPAs**: Store state in sessionStorage or localStorage

**Implementation pattern:**

```typescript
import { generateState } from 'iracing-ng-api/utils';

// Step 1: Generate state and get authorization URL
const state = generateState();
const { authorizationUrl, codeVerifier } = client.generateAuthorizationUrl(state);

// Store state and codeVerifier in your chosen storage
sessionStorage.setItem('oauth_state', state);
if (codeVerifier) {
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
}

// Step 2: Redirect user to authorization URL
window.location.href = authorizationUrl;

// Step 3: Handle callback
const code = req.query.code as string;
const returnedState = req.query.state as string;

// Verify state matches what you stored
const storedState = sessionStorage.getItem('oauth_state');
if (returnedState !== storedState) {
  throw new Error('Invalid state parameter');
}

// Get stored code verifier (if PKCE was used)
const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier');

// Exchange code for token
const accessToken = await client.handleAuthorizationCallback(code, storedCodeVerifier || undefined);
```

**Next.js example with sessionStorage:**

```typescript
'use client';

import { generateState } from 'iracing-ng-api/utils';
import { useRouter } from 'next/navigation';

export function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    // Generate state and get authorization URL
    const state = generateState();
    const { authorizationUrl, codeVerifier } = client.generateAuthorizationUrl(state);

    // Store state and code verifier
    sessionStorage.setItem('oauth_state', state);
    if (codeVerifier) {
      sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    }

    // Redirect to iRacing login
    window.location.href = authorizationUrl;
  };

  return <button onClick={handleLogin}>Login with iRacing</button>;
}

// In your callback route handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Verify state from URL matches stored state
  const storedState = sessionStorage.getItem('oauth_state');
  if (state !== storedState) {
    return new Response('Invalid state', { status: 400 });
  }

  // Get stored code verifier (if PKCE was enabled)
  const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier');

  // Exchange code for token
  const accessToken = await client.handleAuthorizationCallback(code!, storedCodeVerifier || undefined);

  // Clear stored values
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  // Redirect to authenticated page
  return Response.redirect('/dashboard');
}
```

## Token Management

### Automatic Token Handling

Tokens are automatically managed - the client handles:

- Caching tokens until expiry
- Refreshing tokens when they expire
- Using refresh tokens to get new access tokens
- Clearing invalid tokens

### Manual Token Access

```typescript
const tokenManager = client.getTokenManager();

// Get current token info
const stored = tokenManager.getToken('user@example.com');
console.log(`Token expires in: ${stored.expiresAt - Date.now()}ms`);

// Export tokens for persistence
const exported = tokenManager.exportTokens();
localStorage.setItem('iracing_tokens', JSON.stringify(exported));

// Import previously saved tokens
const client = new IRacingAPIClient(config);
const tokenManager = client.getTokenManager();
const saved = JSON.parse(localStorage.getItem('iracing_tokens'));
Object.entries(saved).forEach(([key, token]) => {
  tokenManager.setToken(key, token);
});

// Clear tokens
client.clearTokens();
```

## API Requests

### Basic HTTP Methods

```typescript
// GET request
const data = await client.get('/data/member/info');

// POST request
const result = await client.post('/data/series', { data: 'value' });

// PUT request
const updated = await client.put('/data/item/1', { field: 'new-value' });

// PATCH request
const patched = await client.patch('/data/item/1', { field: 'updated' });

// DELETE request
await client.delete('/data/item/1');
```

### Typed Responses

```typescript
interface UserProfile {
  customerId: number;
  email: string;
  displayName: string;
}

const profile = await client.get<UserProfile>('/data/member/info');
console.log(profile.customerId);
```

## Configuration

### IRacingAPIClientConfig

```typescript
interface IRacingAPIClientConfig {
  // Authentication configuration (required)
  auth: PasswordLimitedGrantConfig | AuthorizationCodeFlowConfig;

  // Base URL for API requests (default: https://members-ng.iracing.com)
  baseUrl?: string;

  // Request timeout in milliseconds (default: 30000)
  timeout?: number;
}
```

### PasswordLimitedGrantConfig

```typescript
interface PasswordLimitedGrantConfig {
  clientId: string; // Required: Client ID from iRacing
  clientSecret: string; // Required: Client secret from iRacing
  username: string; // Required: Email address of authorized user
  password: string; // Required: Password of user
  scope?: string; // Optional: Requested scopes (default: 'iracing.auth')
}
```

### AuthorizationCodeFlowConfig

```typescript
interface AuthorizationCodeFlowConfig {
  clientId: string; // Required: Client ID from iRacing
  clientSecret?: string; // Optional: Only required for confidential clients
  redirectUri: string; // Required: Pre-registered redirect URI
  scope?: string; // Optional: Requested scopes
  usePKCE?: boolean; // Optional: Use PKCE for security (recommended)
}
```

## Error Handling

### Auth Errors

The client throws structured `AuthError` objects with detailed information:

```typescript
interface AuthError {
  error: string; // Error code
  error_description?: string; // Error description
  status?: number; // HTTP status code
  retryAfter?: number; // Seconds to wait before retry (for rate limits)
  rateLimit?: {
    // Rate limit information
    limit: number;
    remaining: number;
    reset: number;
  };
}
```

### Error Handling Example

```typescript
try {
  const token = await client.getPasswordGrantAuth()?.getAccessToken();
} catch (error) {
  if (error.error === 'invalid_client') {
    console.error('Invalid credentials');
  } else if (error.error === 'unauthorized_client') {
    // Rate limited
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  }
}
```

## Credential Masking

The client automatically masks credentials using iRacing's SHA-256 algorithm before transmission:

```typescript
// These are masked automatically by the client
// You don't need to do this manually

// Implementation details:
// masked = base64(sha256(secret + normalized_id))
// where normalized_id = id.trim().toLowerCase()
```

The masking is applied to:

- `client_secret` (masked with `client_id`)
- `password` (masked with `username`)

## Environment Configuration

### .env Example

```env
# Password Limited Grant
IRACING_CLIENT_ID=your-client-id
IRACING_CLIENT_SECRET=your-client-secret
IRACING_USERNAME=your-email@example.com
IRACING_PASSWORD=your-password

# Authorization Code Flow
IRACING_REDIRECT_URI=http://localhost:3000/callback
```

## Examples

### Example 1: Server-side Data Collection

```typescript
import { IRacingAPIClient } from 'iracing-ng-api';

const client = new IRacingAPIClient({
  auth: {
    clientId: process.env.IRACING_CLIENT_ID!,
    clientSecret: process.env.IRACING_CLIENT_SECRET!,
    username: process.env.IRACING_USERNAME!,
    password: process.env.IRACING_PASSWORD!,
  },
});

async function collectData() {
  // First request triggers authentication
  const profile = await client.get('/data/member/info');
  console.log('User:', profile.displayName);

  // Token is automatically cached and refreshed
  const stats = await client.get('/data/user/statistics');
  console.log('Stats:', stats);
}

collectData();
```

### Example 2: Web Application with OAuth

```typescript
import { IRacingAPIClient } from 'iracing-ng-api';
import express from 'express';

const app = express();

// Initialize client
const client = new IRacingAPIClient({
  auth: {
    clientId: process.env.IRACING_CLIENT_ID!,
    redirectUri: 'http://localhost:3000/auth/callback',
    usePKCE: true,
  },
});

// Login route - redirect to iRacing
app.get('/auth/login', (req, res) => {
  const { authorizationUrl } = client.generateAuthorizationUrl();
  res.redirect(authorizationUrl);
});

// Callback route - handle OAuth response
app.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    await client.handleAuthorizationCallback(code, state);

    // User is now authenticated
    req.session.authenticated = true;
    res.redirect('/dashboard');
  } catch (error) {
    res.status(401).send('Authentication failed');
  }
});

// Protected route
app.get('/api/profile', async (req, res) => {
  if (!req.session.authenticated) {
    return res.status(401).send('Not authenticated');
  }

  const profile = await client.get('/data/member/info');
  res.json(profile);
});

app.listen(3000);
```

### Example 3: Token Persistence

```typescript
import { IRacingAPIClient } from 'iracing-ng-api';
import fs from 'fs';

const client = new IRacingAPIClient(config);

// After authentication, save tokens
function saveTokens() {
  const tokens = client.getTokenManager().exportTokens();
  fs.writeFileSync('.tokens.json', JSON.stringify(tokens));
}

// On next startup, restore tokens
function restoreTokens() {
  if (fs.existsSync('.tokens.json')) {
    const tokens = JSON.parse(fs.readFileSync('.tokens.json', 'utf-8'));
    const tokenManager = client.getTokenManager();
    Object.entries(tokens).forEach(([key, token]) => {
      tokenManager.setToken(key, token);
    });
  }
}
```

## Security Considerations

1. **Never commit credentials** - Use environment variables or secure vaults
2. **Use HTTPS** - Always use HTTPS for redirect URIs in production
3. **Use PKCE** - Enable PKCE for public clients (recommended)
4. **Rotate credentials** - Regularly rotate client secrets
5. **Handle refresh tokens securely** - Store them securely (never in localStorage on public sites)
6. **Check SSL certificates** - The library validates SSL certificates by default

## Scopes

Available scopes from iRacing API:

- `iracing.auth` - Basic authentication (default)

Check iRacing documentation for additional scopes: https://oauth.iracing.com/oauth2/book/scopes.html

## Rate Limiting

The Password Limited Grant has strict rate limiting:

```typescript
try {
  const token = await client.getPasswordGrantAuth()?.getAccessToken();
} catch (error) {
  if (error.rateLimit) {
    console.log(`Rate limit: ${error.rateLimit.remaining}/${error.rateLimit.limit}`);
    console.log(`Resets in: ${error.rateLimit.reset} seconds`);
  }
  if (error.retryAfter) {
    console.log(`Retry after: ${error.retryAfter} seconds`);
  }
}
```

Headers exposed:

- `RateLimit-Limit`: Total requests allowed in time window
- `RateLimit-Remaining`: Requests remaining in window
- `RateLimit-Reset`: Seconds until window reset
- `Retry-After`: Seconds to wait before retry (on 400 error)

## References

- [iRacing OAuth2 Documentation](https://oauth.iracing.com/oauth2/book)
- [Password Limited Grant](https://oauth.iracing.com/oauth2/book/token_endpoint.html#password-limited-grant)
- [Authorization Code Flow](https://oauth.iracing.com/oauth2/book/authorization_code_flow.html)
- [PKCE (RFC 7636)](https://tools.ietf.org/html/rfc7636)
- [OAuth2 (RFC 6749)](https://tools.ietf.org/html/rfc6749)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
