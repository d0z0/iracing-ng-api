import 'dotenv/config';
import { IRacingAPIClient } from '../src';
import http from 'node:http';
import { URL } from 'node:url';

/**
 * Example: Using the iRacing Data API with OAuth2 Authorization Code Flow
 *
 * This flow is suitable for:
 * - Web applications
 * - Desktop/native applications
 * - Distributed client applications
 * - When users need to approve access
 *
 * The Authorization Code Flow with PKCE is the most secure flow for public clients.
 *
 * Requirements:
 * - Registered client application with iRacing
 * - Client ID (and Client Secret if not a public client)
 * - Registered redirect URI
 * - User's web browser for authentication
 *
 * This example demonstrates a basic flow by:
 * 1. Starting a local HTTP server to handle the redirect
 * 2. Opening the authorization URL (you'll need to handle this in a real app)
 * 3. Receiving the authorization code at the redirect URI
 * 4. Exchanging the code for access tokens
 */

async function main() {
  const clientId = process.env.IRACING_CLIENT_ID;
  const clientSecret = process.env.IRACING_CLIENT_SECRET; // Optional for public clients
  const redirectUri = process.env.IRACING_REDIRECT_URI || 'http://localhost:3000/callback';

  if (!clientId) {
    console.error('Missing required environment variables:');
    console.error('  IRACING_CLIENT_ID');
    console.error('  IRACING_REDIRECT_URI (optional, defaults to http://localhost:3000/callback)');
    console.error('  IRACING_CLIENT_SECRET (optional, only for confidential clients)');
    process.exit(1);
  }

  // Initialize the API client with authorization code flow
  const client = new IRacingAPIClient({
    auth: {
      clientId,
      clientSecret,
      redirectUri,
      scope: 'iracing.auth', // Optional: specify scope
      usePKCE: true, // Use PKCE for enhanced security (recommended)
    },
  });

  // Start a local HTTP server to handle the OAuth callback
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      if (error) {
        console.error('❌ Authorization error:', error, errorDescription);
        res.writeHead(400);
        res.end(`<html><body><h1>Error</h1><p>${error}: ${errorDescription}</p></body></html>`);
        server.close();
        return;
      }

      if (!code || !state) {
        res.writeHead(400);
        res.end('<html><body><h1>Missing parameters</h1></body></html>');
        return;
      }

      try {
        console.log('📝 Received authorization code, exchanging for tokens...');
        // Retrieve the stored code verifier (if PKCE was used)
        const storedCodeVerifier = sessionStorage?.getItem?.('oauth_code_verifier');
        const accessToken = await client.handleAuthorizationCallback(code, storedCodeVerifier || undefined);
        console.log('✅ Successfully authenticated!');
        console.log(`Access Token: ${accessToken.substring(0, 20)}...`);

        // Make a request with the new token
        console.log('\nFetching user profile...');
        const profile = await client.get('/data/member/info');
        console.log('User Profile:', JSON.stringify(profile, null, 2));

        // Display token info
        const authCodeAuth = client.getAuthCodeFlowAuth();
        const storedToken = authCodeAuth?.getStoredToken();
        if (storedToken) {
          console.log('\n📝 Token Information:');
          console.log(`  - Expires in: ${Math.round((storedToken.expiresAt - Date.now()) / 1000)} seconds`);
          console.log(`  - Has refresh token: ${!!storedToken.refreshToken}`);
        }

        res.writeHead(200);
        res.end('<html><body><h1>✅ Authentication successful!</h1><p>You can close this window.</p></body></html>');

        // Close the server after a brief delay
        setTimeout(() => server.close(), 1000);
      } catch (error) {
        console.error('❌ Error exchanging code:', error);
        res.writeHead(500);
        res.end('<html><body><h1>Error</h1><p>Failed to exchange authorization code</p></body></html>');
        server.close();
      }
    } else {
      res.writeHead(404);
      res.end('<html><body><h1>Not Found</h1></body></html>');
    }
  });

  try {
    // Start the callback server
    await new Promise<void>((resolve) => {
      server.listen(3000, '127.0.0.1', () => {
        console.log('🚀 Callback server listening on http://127.0.0.1:3000');
        resolve();
      });
    });

    // Generate authorization URL
    const { authorizationUrl, codeVerifier } = client.generateAuthorizationUrl(state);

    console.log('\n📲 Authorization URL:');
    console.log(authorizationUrl);

    if (codeVerifier) {
      console.log('\n🔐 PKCE Code Verifier (store this for the callback):');
      console.log(codeVerifier.substring(0, 20) + '...');
      // In a real app, store this securely (sessionStorage, state management, etc.)
    }

    console.log('\n⏳ Waiting for user to authorize...');
    console.log('   (In a real app, you would redirect the user to the authorizationUrl)');
    console.log('   State parameter:', state);

    // In a real application, you would:
    // 1. Redirect the user to authorizationUrl
    // 2. Wait for them to authenticate and approve
    // 3. Handle the callback here

    // For demo purposes, open the URL if possible (macOS example)
    if (process.platform === 'darwin') {
      console.log('\n💡 Attempting to open browser...');
      require('child_process').exec(`open "${authorizationUrl}"`);
    }

    // Wait for the server to close (callback handled)
    await new Promise<void>((resolve) => {
      server.on('close', () => {
        console.log('\n🎉 Authorization flow completed!');
        resolve();
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        console.log('\n⏱️ Timeout waiting for authorization');
        server.close();
        resolve();
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    server.close();
    process.exit(1);
  }
}

main().catch(console.error);
