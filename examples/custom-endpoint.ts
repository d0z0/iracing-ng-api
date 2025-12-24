/**
 * Comprehensive iRacing Data API Client Example
 * Demonstrates all 52 endpoint methods with proper typing
 */

import 'dotenv/config';
import { IRacingAPIClient } from '../src';

async function main() {
  // Initialize the client with Password Limited Grant authentication
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
    const memberProfile = await client.getMemberProfile();
    console.log('✅ Member Profile:', JSON.stringify(memberProfile, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
