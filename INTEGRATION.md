# Integration Guide

## Adding iRacing Data API to Your Project

This guide shows how to integrate the iRacing Data API client into your existing Node.js project.

## Method 1: Local npm Package

### Copy Files to Your Project

```bash
# Copy source files to your project
cp -r src/ your-project/src/iracing-api/

# Copy package.json dependencies to your project
```

### Install Dependencies

```bash
npm install axios dotenv
npm install --save-dev typescript @types/node
```

### Import and Use

```typescript
import { IRacingAPIClient } from './src/iracing-api/index.js';

const client = new IRacingAPIClient({
  auth: {
    clientId: process.env.IRACING_CLIENT_ID!,
    clientSecret: process.env.IRACING_CLIENT_SECRET!,
    username: process.env.IRACING_USERNAME!,
    password: process.env.IRACING_PASSWORD!,
  },
});

const profile = await client.get('/data/user/profile');
```

## Method 2: As an npm Module (After Publishing)

```bash
npm install iracing-data-api
```

```typescript
import { IRacingAPIClient } from 'iracing-data-api';

const client = new IRacingAPIClient(config);
```

## Method 3: Monorepo Setup

### Using npm workspaces:

```json
{
  "workspaces": ["packages/iracing-api", "packages/my-app"]
}
```

```bash
# Install once
npm install

# Access from my-app
import { IRacingAPIClient } from '@mycompany/iracing-api';
```

## Common Integration Patterns

### Express.js Web Application

```typescript
import express from 'express';
import { IRacingAPIClient } from 'iracing-data-api';

const app = express();
let client: IRacingAPIClient;

// Middleware to ensure authenticated
const requireAuth = async (req, res, next) => {
  try {
    // Client auto-authenticates on first request
    next();
  } catch (error) {
    res.status(401).send('Not authenticated');
  }
};

app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const profile = await client.get('/data/user/profile');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  client = new IRacingAPIClient({
    auth: {
      clientId: process.env.IRACING_CLIENT_ID!,
      redirectUri: 'http://localhost:3000/auth/callback',
      usePKCE: true,
    },
  });
  console.log('Server running');
});
```

### Next.js API Route

```typescript
// pages/api/iracing/profile.ts
import { IRacingAPIClient } from 'iracing-data-api';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize client once (or use factory pattern)
const client = new IRacingAPIClient({
  auth: {
    clientId: process.env.IRACING_CLIENT_ID!,
    clientSecret: process.env.IRACING_CLIENT_SECRET!,
    username: process.env.IRACING_USERNAME!,
    password: process.env.IRACING_PASSWORD!,
  },
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const profile = await client.get('/data/user/profile');
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### NestJS Service

```typescript
// iracing.service.ts
import { Injectable } from '@nestjs/common';
import { IRacingAPIClient } from 'iracing-data-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IRacingService {
  private client: IRacingAPIClient;

  constructor(private configService: ConfigService) {
    this.client = new IRacingAPIClient({
      auth: {
        clientId: this.configService.get('IRACING_CLIENT_ID'),
        clientSecret: this.configService.get('IRACING_CLIENT_SECRET'),
        username: this.configService.get('IRACING_USERNAME'),
        password: this.configService.get('IRACING_PASSWORD'),
      },
    });
  }

  async getUserProfile() {
    return await this.client.get('/data/user/profile');
  }

  async getUserStatistics() {
    return await this.client.get('/data/user/statistics');
  }
}

// iracing.controller.ts
import { Controller, Get } from '@nestjs/common';
import { IRacingService } from './iracing.service';

@Controller('iracing')
export class IRacingController {
  constructor(private iracing: IRacingService) {}

  @Get('profile')
  getProfile() {
    return this.iracing.getUserProfile();
  }
}
```

### Scheduled Background Job (Node-Cron)

```typescript
import cron from 'node-cron';
import { IRacingAPIClient } from 'iracing-data-api';

const client = new IRacingAPIClient({
  auth: {
    clientId: process.env.IRACING_CLIENT_ID!,
    clientSecret: process.env.IRACING_CLIENT_SECRET!,
    username: process.env.IRACING_USERNAME!,
    password: process.env.IRACING_PASSWORD!,
  },
});

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Fetching iRacing data...');
    const profile = await client.get('/data/user/profile');
    const stats = await client.get('/data/user/statistics');

    // Store in database
    await saveToDatabase({
      profile,
      stats,
      timestamp: new Date(),
    });

    console.log('✅ Data synced successfully');
  } catch (error) {
    console.error('❌ Error syncing data:', error);
  }
});
```

### Client Singleton Pattern

```typescript
// iracing-client.ts
import { IRacingAPIClient } from 'iracing-data-api';

let client: IRacingAPIClient | null = null;

export function getIRacingClient(): IRacingAPIClient {
  if (!client) {
    client = new IRacingAPIClient({
      auth: {
        clientId: process.env.IRACING_CLIENT_ID!,
        clientSecret: process.env.IRACING_CLIENT_SECRET!,
        username: process.env.IRACING_USERNAME!,
        password: process.env.IRACING_PASSWORD!,
      },
    });
  }
  return client;
}

// Usage in multiple files
import { getIRacingClient } from './iracing-client';

const client = getIRacingClient();
const profile = await client.get('/data/user/profile');
```

### Dependency Injection (Factory Pattern)

```typescript
// iracing.module.ts
import { Module } from '@nestjs/common';
import { IRacingAPIClient } from 'iracing-data-api';

@Module({
  providers: [
    {
      provide: 'IRACING_CLIENT',
      inject: ['CONFIG_SERVICE'],
      useFactory: (config) => {
        return new IRacingAPIClient({
          auth: {
            clientId: config.get('IRACING_CLIENT_ID'),
            clientSecret: config.get('IRACING_CLIENT_SECRET'),
            username: config.get('IRACING_USERNAME'),
            password: config.get('IRACING_PASSWORD'),
          },
        });
      },
    },
  ],
  exports: ['IRACING_CLIENT'],
})
export class IRacingModule {}
```

## Error Handling

### Global Error Handler

```typescript
import { IRacingAPIClient } from 'iracing-data-api';
import type { AuthError } from 'iracing-data-api';

async function makeRequest(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const authError = error as AuthError;

      // Handle rate limiting
      if (authError.error === 'unauthorized_client' && authError.retryAfter) {
        console.log(`Rate limited. Waiting ${authError.retryAfter} seconds...`);
        await new Promise((r) => setTimeout(r, authError.retryAfter! * 1000));
        continue;
      }

      // Handle credential errors
      if (authError.error === 'invalid_client') {
        console.error('Invalid credentials');
        process.exit(1);
      }

      // Retry on other errors
      if (i < retries - 1) {
        console.log(`Attempt ${i + 1} failed, retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }

      throw error;
    }
  }
}

// Usage
const profile = await makeRequest(() => client.get('/data/user/profile'));
```

## Token Persistence

### Save to File

```typescript
import fs from 'fs';

function saveTokens(client: IRacingAPIClient) {
  const tokens = client.getTokenManager().exportTokens();
  fs.writeFileSync('.iracing-tokens.json', JSON.stringify(tokens, null, 2));
}

function loadTokens(client: IRacingAPIClient) {
  if (fs.existsSync('.iracing-tokens.json')) {
    const tokens = JSON.parse(fs.readFileSync('.iracing-tokens.json', 'utf-8'));
    const tokenManager = client.getTokenManager();
    Object.entries(tokens).forEach(([key, token]) => {
      tokenManager.setToken(key, token as any);
    });
  }
}
```

### Save to Database

```typescript
import { IRacingAPIClient } from 'iracing-data-api';
import { db } from './database';

class TokenStorage {
  constructor(private client: IRacingAPIClient) {}

  async save() {
    const tokens = this.client.getTokenManager().exportTokens();
    await db.tokens.upsert({
      where: { userId: 'default' },
      update: { data: tokens },
      create: { userId: 'default', data: tokens },
    });
  }

  async load() {
    const record = await db.tokens.findFirst({
      where: { userId: 'default' },
    });

    if (record) {
      const tokenManager = this.client.getTokenManager();
      Object.entries(record.data).forEach(([key, token]) => {
        tokenManager.setToken(key, token as any);
      });
    }
  }
}
```

### Redis Cache

```typescript
import redis from 'redis';
import { IRacingAPIClient } from 'iracing-data-api';

const redisClient = redis.createClient();

async function saveTokensToRedis(client: IRacingAPIClient) {
  const tokens = client.getTokenManager().exportTokens();
  await redisClient.set('iracing:tokens', JSON.stringify(tokens));
}

async function loadTokensFromRedis(client: IRacingAPIClient) {
  const data = await redisClient.get('iracing:tokens');
  if (data) {
    const tokens = JSON.parse(data);
    const tokenManager = client.getTokenManager();
    Object.entries(tokens).forEach(([key, token]) => {
      tokenManager.setToken(key, token as any);
    });
  }
}
```

## Environment Configuration

### Multi-Environment Setup

```bash
# .env.development
IRACING_CLIENT_ID=dev-client-id
IRACING_CLIENT_SECRET=dev-secret
IRACING_USERNAME=dev-user@example.com
IRACING_PASSWORD=dev-password

# .env.production
IRACING_CLIENT_ID=prod-client-id
IRACING_CLIENT_SECRET=prod-secret
IRACING_USERNAME=prod-user@example.com
IRACING_PASSWORD=prod-password
```

```typescript
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
```

## Testing

### Mock Client

```typescript
import { IRacingAPIClient } from 'iracing-data-api';

class MockIRacingClient extends IRacingAPIClient {
  async get(url: string) {
    // Return mock data
    return { userId: 123, name: 'Test User' };
  }
}

// Use in tests
const client = new MockIRacingClient(config);
```

### Mocking with Jest

```typescript
jest.mock('iracing-data-api', () => ({
  IRacingAPIClient: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue({ userId: 123 }),
  })),
}));
```

## Performance Optimization

### Request Batching

```typescript
async function batchRequests(urls: string[]): Promise<any[]> {
  const client = getIRacingClient();
  return Promise.all(urls.map((url) => client.get(url)));
}

// Usage
const [profile, stats, series] = await batchRequests(['/data/user/profile', '/data/user/statistics', '/data/series']);
```

### Response Caching

```typescript
const cache = new Map<string, { data: any; expires: number }>();

async function cachedRequest(url: string, ttl = 60000) {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const client = getIRacingClient();
  const data = await client.get(url);
  cache.set(url, { data, expires: Date.now() + ttl });
  return data;
}
```

## Troubleshooting Integration

### Issue: Module not found

```
Error: Cannot find module 'iracing-data-api'
```

**Solution:** Ensure correct import path:

```typescript
// If local
import { IRacingAPIClient } from './src/iracing-api/index.js';

// If npm package
import { IRacingAPIClient } from 'iracing-data-api';
```

### Issue: Types not found

```
Error: Cannot find name 'StoredToken'
```

**Solution:** Import types separately:

```typescript
import { IRacingAPIClient, type StoredToken } from 'iracing-data-api';
```

### Issue: Environment variables undefined

```
Error: Cannot read properties of undefined (reading 'IRACING_CLIENT_ID')
```

**Solution:** Load .env before importing:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { IRacingAPIClient } from 'iracing-data-api';
```

---

Choose the integration pattern that best fits your application architecture and requirements!
