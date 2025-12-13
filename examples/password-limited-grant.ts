import 'dotenv/config';
import { IRacingAPIClient } from '../src/index.js';

/**
 * Example: Using the iRacing Data API with Password Limited Grant
 *
 * This grant is suitable for:
 * - Server-side/headless clients
 * - Automated data collection scripts
 * - Background workers that need unattended authentication
 *
 * Note: This grant is rate-limited and typically takes 2+ seconds per authentication.
 * Always use refresh tokens to maintain your session after initial authentication.
 *
 * Requirements:
 * - Registered client application with iRacing
 * - Client ID and Client Secret
 * - Username and password of an authorized user
 * - Active iRacing subscription
 */
async function main() {
  const clientId = process.env.IRACING_CLIENT_ID;
  const clientSecret = process.env.IRACING_CLIENT_SECRET;
  const username = process.env.IRACING_USERNAME;
  const password = process.env.IRACING_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.error('Missing required environment variables:');
    console.error('  IRACING_CLIENT_ID');
    console.error('  IRACING_CLIENT_SECRET');
    console.error('  IRACING_USERNAME');
    console.error('  IRACING_PASSWORD');
    process.exit(1);
  }

  // Initialize the API client with password limited grant
  const client = new IRacingAPIClient({
    auth: {
      clientId,
      clientSecret,
      username,
      password,
      scope: 'iracing.auth', // Optional: specify scope
    },
  });

  try {
    console.log('Authenticating with iRacing using Password Limited Grant...');

    // First request will trigger authentication
    // Subsequent requests will use cached token until it expires
    const data = await client.get('/data/user/profile');
    console.log('✅ Successfully authenticated!');
    console.log('User Profile:', JSON.stringify(data, null, 2));

    // Access the token info
    const tokenManager = client.getTokenManager();
    const stored = tokenManager.getToken(username);
    if (stored) {
      console.log('\n📝 Token Information:');
      console.log(`  - Expires in: ${Math.round((stored.expiresAt - Date.now()) / 1000)} seconds`);
      console.log(`  - Has refresh token: ${!!stored.refreshToken}`);
      if (stored.refreshToken) {
        console.log(`  - Refresh token expires in: ${Math.round((stored.refreshTokenExpiresAt! - Date.now()) / 1000)} seconds`);
      }
    }

    // Make another request - this will use the cached token
    console.log('\nMaking another request (using cached token)...');
    const profile2 = await client.get('/data/user/profile');
    console.log('✅ Request successful!');

    // Export tokens for persistence (e.g., save to database or file)
    console.log('\n💾 Exported Tokens (for persistence):');
    const exported = tokenManager.exportTokens();
    console.log(JSON.stringify(exported, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
