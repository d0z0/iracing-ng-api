# Project Setup & Quick Start Guide

## Project Structure

```
iracing-ng-api/
├── src/
│   ├── auth/
│   │   ├── index.ts                    # Auth module exports
│   │   ├── token-manager.ts            # Token storage and management
│   │   ├── password-limited-grant.ts   # Password limited OAuth2 flow
│   │   └── authorization-code-flow.ts  # Authorization code OAuth2 flow with PKCE
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   ├── utils/
│   │   └── index.ts                    # Utilities (masking, PKCE, token helpers)
│   └── index.ts                        # Main client export
├── examples/
│   ├── password-limited-grant.ts       # Password grant example
│   └── authorization-code-flow.ts      # Authorization code flow example
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
└── .gitignore
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/schubertcardozo/Code/iracing-ng-api
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your iRacing OAuth2 credentials:

- For Password Limited Grant: Add `IRACING_CLIENT_ID`, `IRACING_CLIENT_SECRET`, `IRACING_USERNAME`, `IRACING_PASSWORD`
- For Authorization Code Flow: Add `IRACING_CLIENT_ID`, optionally `IRACING_CLIENT_SECRET`, and `IRACING_REDIRECT_URI`

### 3. Build the Project

```bash
npm run build
```

This will compile TypeScript to JavaScript in the `dist/` directory.

### 4. Development Mode

For development with auto-recompilation:

```bash
npm run dev
```

## Running Examples

### Password Limited Grant Example

```bash
npm run example:password-grant
```

This example demonstrates:

- Authenticating with username/password
- Making API requests with auto-token management
- Handling token refresh
- Exporting tokens for persistence

### Authorization Code Flow Example

```bash
npm run example:auth-code
```

This example demonstrates:

- Generating authorization URL with PKCE
- Starting a local callback server
- Handling OAuth redirect
- Exchanging authorization code for tokens
- Making API requests

## Key Components

### 1. PasswordLimitedGrantAuth

- Located in: `src/auth/password-limited-grant.ts`
- Handles password_limited OAuth2 grant
- Rate-limited and takes 2+ seconds per auth
- Suitable for server-side applications
- Includes automatic token refresh

### 2. AuthorizationCodeFlowAuth

- Located in: `src/auth/authorization-code-flow.ts`
- Handles authorization_code OAuth2 grant
- Supports PKCE for enhanced security
- Suitable for distributed/web applications
- Includes state verification for CSRF protection

### 3. TokenManager

- Located in: `src/auth/token-manager.ts`
- In-memory token storage
- Expiry tracking and validation
- Support for custom persistence
- Refresh token management

### 4. Utility Functions

- Located in: `src/utils/index.ts`
- `maskSecret()` - SHA-256 credential masking
- `generatePKCEPair()` - PKCE code challenge/verifier
- `generateState()` - Random state for CSRF protection
- `isTokenExpired()` - Token expiry checking

### 5. IRacingAPIClient

- Located in: `src/index.ts`
- Main API client class
- Auto-selects auth flow based on config
- Provides HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Automatic request authentication

## Usage Examples

### Basic Usage - Password Limited Grant

```typescript
import { IRacingAPIClient } from './src/index.js';

const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    username: 'user@example.com',
    password: 'password',
    scope: 'iracing.auth',
  },
});

// Automatically authenticates and makes request
const profile = await client.get('/data/user/profile');
console.log(profile);

// Token is cached, subsequent requests use it
const stats = await client.get('/data/user/statistics');
```

### Authorization Code Flow

```typescript
import { IRacingAPIClient } from './src/index.js';

const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    redirectUri: 'http://localhost:3000/callback',
    usePKCE: true,
  },
});

// Generate authorization URL
const { authorizationUrl } = client.generateAuthorizationUrl();
console.log('Redirect user to:', authorizationUrl);

// Handle callback (in your route handler)
// app.get('/callback', async (req, res) => {
//   const token = await client.handleAuthorizationCallback(req.query.code, req.query.state);
//   console.log('Authenticated!');
// });
```

## Security Features

1. **Credential Masking** - SHA-256 hashing of credentials before transmission
2. **PKCE Support** - For authorization code flow public clients
3. **State Verification** - CSRF protection in auth code flow
4. **Token Expiry Tracking** - Automatic token refresh before expiry
5. **SSL/TLS** - All requests use HTTPS by default
6. **Rate Limit Awareness** - Exposes rate limit headers and retry information

## Environment Variables Reference

```
# Password Limited Grant
IRACING_CLIENT_ID          - Your OAuth2 client ID (required)
IRACING_CLIENT_SECRET      - Your OAuth2 client secret (required for password grant)
IRACING_USERNAME           - Email of authorized user (required for password grant)
IRACING_PASSWORD           - User password (required for password grant)

# Authorization Code Flow
IRACING_REDIRECT_URI       - Registered redirect URI (required for auth code flow)

# Optional Configuration
IRACING_API_BASE_URL       - Override default API base URL
IRACING_API_TIMEOUT        - Request timeout in milliseconds
```

## TypeScript Support

The project includes full TypeScript support with:

- Strict type checking enabled
- Source maps for debugging
- Type declarations included in build
- Comprehensive type definitions for all APIs

## Next Steps

1. Register your application with iRacing OAuth2: https://oauth.iracing.com/oauth2/book/client_registration.html
2. Get your Client ID and Client Secret
3. For Password Limited Grant: Get your username and password
4. For Authorization Code Flow: Register your redirect URI
5. Update `.env` with your credentials
6. Run `npm install` and `npm run build`
7. Run the example: `npm run example:password-grant` or `npm run example:auth-code`

## Troubleshooting

### Authentication Fails

- Check credentials in `.env`
- Verify client is registered with iRacing
- For password grant: ensure user has active subscription
- Check rate limits if using password grant

### Token Refresh Issues

- Refresh tokens may expire, re-authenticate when needed
- Check token expiry times: `client.getTokenManager().getToken(key)`

### PKCE Issues

- Ensure `usePKCE: true` is set in config for public clients
- Code verifier is automatically generated and stored

## Resources

- [iRacing OAuth2 Documentation](https://oauth.iracing.com/oauth2/book)
- [OAuth2 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [iRacing Data API](https://www.iracing.com/data-api)

## Support

For issues or questions:

1. Check the README.md for detailed documentation
2. Review the examples in `examples/` folder
3. Check iRacing OAuth2 docs: https://oauth.iracing.com/oauth2/book
