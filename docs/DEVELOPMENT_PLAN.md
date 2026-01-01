# SOCI Development Plan
## From Prototype to Production

**Document Version:** 1.0
**Created:** 2026-01-01
**Current Version:** 1.6.0 ("Resilient Aurora")
**Target Version:** 2.0.0 ("Connected Aurora")

---

## Executive Summary

This development plan outlines the path from SOCI's current prototype state to a production-ready autonomous social media growth engine. The plan is organized into 6 phases, prioritizing critical fixes first, then building out backend infrastructure, AI integration, and finally scaling for production.

---

## Phase 0: Critical Fixes (Foundation Stabilization)

**Priority:** 🔴 BLOCKER
**Goal:** Make the application runnable

### 0.1 Install Missing Dependencies

```bash
npm install framer-motion zustand date-fns
```

### 0.2 Fix TypeScript Configuration

Add path aliases to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Update `vite.config.ts`:

```typescript
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 0.3 Fix Type Exports

Update `src/types/index.ts` to export all required types:

```typescript
export interface UserState {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  persona?: PersonaConfig;
}

export interface Trend {
  id: string;
  topic: string;
  volume: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  confidence?: number;
  category?: string;
  hashtags?: string[];
  timestamp: Date;
}

export interface Post {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'instagram';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  engagement?: PostEngagement;
  trendId?: string;
}

export interface PostEngagement {
  likes: number;
  shares: number;
  comments: number;
  reach: number;
}

export interface PersonaConfig {
  tone: 'professional' | 'casual' | 'witty' | 'urgent';
  topics: string[];
  maxDailyPosts: number;
  autoEngage: boolean;
}

export interface PlatformCredentials {
  platform: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
```

### 0.4 Consolidate Duplicate Views

- Keep `src/views/` as the primary view directory
- Remove or repurpose `src/pages/` directory
- Update all imports to use consistent paths

### 0.5 Add Missing Dev Dependencies

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Deliverables
- [ ] Application runs without errors
- [ ] All TypeScript compilation passes
- [ ] No duplicate component implementations
- [ ] ESLint configured and passing

---

## Phase 1: Enhanced Frontend Architecture

**Priority:** 🟡 HIGH
**Goal:** Modernize frontend with proper patterns and validation

### 1.1 Add Runtime Validation with Zod

```bash
npm install zod
```

Create `src/schemas/index.ts`:

```typescript
import { z } from 'zod';

export const TrendSchema = z.object({
  id: z.string(),
  topic: z.string().min(1),
  volume: z.number().positive(),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  relevance: z.number().min(0).max(100),
  timestamp: z.coerce.date(),
});

export const PostSchema = z.object({
  id: z.string(),
  content: z.string().min(1).max(280),
  platform: z.enum(['twitter', 'linkedin', 'instagram']),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']),
  scheduledAt: z.coerce.date().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export type Trend = z.infer<typeof TrendSchema>;
export type Post = z.infer<typeof PostSchema>;
export type User = z.infer<typeof UserSchema>;
```

### 1.2 Add TanStack Query for Server State

```bash
npm install @tanstack/react-query
```

Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});
```

Create `src/hooks/useTrends.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { TrendSchema } from '@/schemas';

export function useTrends() {
  return useQuery({
    queryKey: ['trends'],
    queryFn: async () => {
      const response = await fetch('/api/trends');
      const data = await response.json();
      return TrendSchema.array().parse(data);
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}
```

### 1.3 Implement Component Variants with CVA

```bash
npm install class-variance-authority
```

Refactor `src/components/ui/Button.tsx`:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-neon text-deep hover:bg-neon/90 focus:ring-neon',
        secondary: 'bg-purpleAccent text-white hover:bg-purpleAccent/90 focus:ring-purpleAccent',
        ghost: 'bg-transparent hover:bg-glass-bg text-white',
        danger: 'bg-critical text-white hover:bg-critical/90 focus:ring-critical',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({ variant, size, isLoading, children, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} disabled={isLoading} {...props}>
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
```

### 1.4 Replace Framer Motion with Motion One (Optional)

```bash
npm uninstall framer-motion
npm install motion
```

Lighter-weight animations with same capabilities for simple use cases.

### 1.5 Add Comprehensive Error Handling

Create `src/components/ui/ErrorFallback.tsx`:

```typescript
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <GlassCard className="text-center p-8">
      <AlertTriangle className="w-12 h-12 text-critical mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-400 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </GlassCard>
  );
}
```

### Deliverables
- [ ] Zod schemas for all data types
- [ ] TanStack Query integration
- [ ] CVA-based component variants
- [ ] Improved error boundaries
- [ ] Type-safe API layer ready

---

## Phase 2: Backend Infrastructure

**Priority:** 🟡 HIGH
**Goal:** Build real API layer and database

### 2.1 Initialize Backend Project

```bash
# Create backend directory
mkdir -p backend/src

# Initialize
cd backend
npm init -y
npm install typescript @types/node ts-node nodemon -D
npm install express cors helmet zod drizzle-orm postgres dotenv
npm install @trpc/server @trpc/client
```

### 2.2 Database Schema Design

Create `backend/src/db/schema.ts` using Drizzle ORM:

```typescript
import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const platforms = pgTable('platforms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  platform: text('platform').notNull(), // twitter, linkedin, instagram
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  tone: text('tone').notNull(),
  topics: text('topics').array(),
  maxDailyPosts: integer('max_daily_posts').default(5),
  autoEngage: boolean('auto_engage').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trends = pgTable('trends', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  volume: integer('volume').notNull(),
  sentiment: text('sentiment').notNull(),
  relevance: integer('relevance').notNull(),
  source: text('source'), // twitter, google, etc.
  metadata: jsonb('metadata'),
  fetchedAt: timestamp('fetched_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  personaId: uuid('persona_id').references(() => personas.id),
  trendId: uuid('trend_id').references(() => trends.id),
  content: text('content').notNull(),
  platform: text('platform').notNull(),
  status: text('status').notNull().default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  externalId: text('external_id'), // ID from social platform
  engagement: jsonb('engagement'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2.3 tRPC API Router

Create `backend/src/trpc/router.ts`:

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  // Trends
  trends: t.router({
    list: t.procedure.query(async () => {
      return db.select().from(trends).orderBy(trends.relevance);
    }),

    refresh: t.procedure.mutation(async () => {
      // Trigger trend refresh job
      await queue.add('refresh-trends', {});
      return { success: true };
    }),
  }),

  // Posts
  posts: t.router({
    list: t.procedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return db.select().from(posts).where(eq(posts.status, input.status));
      }),

    create: t.procedure
      .input(z.object({
        content: z.string().min(1).max(280),
        platform: z.enum(['twitter', 'linkedin', 'instagram']),
        scheduledAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.insert(posts).values(input).returning();
      }),

    generate: t.procedure
      .input(z.object({
        trendId: z.string().uuid(),
        tone: z.enum(['professional', 'casual', 'witty', 'urgent']),
      }))
      .mutation(async ({ input }) => {
        // Call AI service
        const content = await generateContent(input);
        return { content };
      }),
  }),

  // User & Persona
  user: t.router({
    me: t.procedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    updatePersona: t.procedure
      .input(PersonaSchema)
      .mutation(async ({ input, ctx }) => {
        return db.update(personas)
          .set(input)
          .where(eq(personas.userId, ctx.user.id));
      }),
  }),

  // Platform Connections
  platforms: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      return db.select().from(platforms).where(eq(platforms.userId, ctx.user.id));
    }),

    connect: t.procedure
      .input(z.object({ platform: z.string() }))
      .mutation(async ({ input }) => {
        // Return OAuth URL
        return { authUrl: getOAuthUrl(input.platform) };
      }),

    disconnect: t.procedure
      .input(z.object({ platformId: z.string().uuid() }))
      .mutation(async ({ input }) => {
        return db.delete(platforms).where(eq(platforms.id, input.platformId));
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

### 2.4 Background Job Queue

```bash
npm install bullmq ioredis
```

Create `backend/src/jobs/index.ts`:

```typescript
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL);

// Queues
export const trendQueue = new Queue('trends', { connection });
export const postQueue = new Queue('posts', { connection });
export const engagementQueue = new Queue('engagement', { connection });

// Workers
new Worker('trends', async (job) => {
  switch (job.name) {
    case 'refresh-trends':
      await fetchAndStoreTrends();
      break;
    case 'analyze-trend':
      await analyzeTrendSentiment(job.data.trendId);
      break;
  }
}, { connection });

new Worker('posts', async (job) => {
  switch (job.name) {
    case 'publish-post':
      await publishToplatform(job.data.postId);
      break;
    case 'schedule-post':
      await schedulePost(job.data.postId, job.data.scheduledAt);
      break;
  }
}, { connection });

// Scheduled Jobs
trendQueue.add('refresh-trends', {}, {
  repeat: { every: 60000 * 5 }, // Every 5 minutes
});
```

### 2.5 Real-time Updates with SSE

Create `backend/src/routes/stream.ts`:

```typescript
import { Router } from 'express';

const router = Router();

router.get('/api/stream/trends', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendTrends = async () => {
    const trends = await db.select().from(trendsTable).limit(10);
    res.write(`data: ${JSON.stringify(trends)}\n\n`);
  };

  // Send initial data
  sendTrends();

  // Send updates every 30 seconds
  const interval = setInterval(sendTrends, 30000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
```

### Deliverables
- [ ] PostgreSQL database schema
- [ ] Drizzle ORM integration
- [ ] tRPC API router with all endpoints
- [ ] BullMQ job queues
- [ ] SSE real-time updates
- [ ] Redis caching layer

---

## Phase 3: AI Integration

**Priority:** 🟡 HIGH
**Goal:** Implement real AI-powered content generation

### 3.1 AI Service Setup

```bash
npm install @anthropic-ai/sdk ai @ai-sdk/anthropic
```

Create `backend/src/services/ai.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GenerateContentParams {
  trend: {
    topic: string;
    sentiment: string;
    context?: string;
  };
  persona: {
    tone: string;
    topics: string[];
  };
  platform: 'twitter' | 'linkedin' | 'instagram';
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  const { trend, persona, platform } = params;

  const platformLimits = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
  };

  const systemPrompt = `You are a social media content creator with a ${persona.tone} tone.
You specialize in topics: ${persona.topics.join(', ')}.
Generate engaging content for ${platform} (max ${platformLimits[platform]} characters).
The content should be authentic, engaging, and encourage interaction.`;

  const userPrompt = `Create a ${platform} post about the trending topic: "${trend.topic}"
Sentiment of the trend: ${trend.sentiment}
${trend.context ? `Additional context: ${trend.context}` : ''}

Requirements:
- Match the ${persona.tone} tone
- Include relevant hashtags if appropriate
- Encourage engagement (questions, calls to action)
- Stay within ${platformLimits[platform]} characters`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected response type');
}
```

### 3.2 Content Variations

Create `backend/src/services/contentVariations.ts`:

```typescript
export async function generateContentVariations(
  params: GenerateContentParams,
  count: number = 3
): Promise<string[]> {
  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const content = await generateContent({
      ...params,
      persona: {
        ...params.persona,
        tone: i === 0 ? params.persona.tone : getAlternativeTone(params.persona.tone),
      },
    });
    variations.push(content);
  }

  return variations;
}

function getAlternativeTone(primary: string): string {
  const tones = ['professional', 'casual', 'witty', 'urgent'];
  const filtered = tones.filter(t => t !== primary);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
```

### 3.3 AI-Powered Trend Analysis

Create `backend/src/services/trendAnalysis.ts`:

```typescript
export async function analyzeTrendRelevance(
  trend: Trend,
  userTopics: string[]
): Promise<number> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Rate the relevance of this trend to the given topics on a scale of 0-100.

Trend: "${trend.topic}"
User's topics of interest: ${userTopics.join(', ')}

Respond with only a number between 0 and 100.`,
    }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return parseInt(content.text.trim(), 10);
  }
  return 50; // Default middle relevance
}
```

### 3.4 Smart Reply Generation

Create `backend/src/services/autoEngage.ts`:

```typescript
export async function generateReply(
  originalPost: string,
  persona: PersonaConfig
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 280,
    system: `You are engaging with social media posts in a ${persona.tone} manner.
Generate authentic, helpful replies that add value to the conversation.
Never be promotional or spammy. Be genuinely helpful.`,
    messages: [{
      role: 'user',
      content: `Generate a thoughtful reply to this post:
"${originalPost}"

Keep it under 280 characters, natural, and engaging.`,
    }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected response type');
}
```

### Deliverables
- [ ] Anthropic Claude integration
- [ ] Content generation with persona support
- [ ] Multiple content variations
- [ ] Trend relevance analysis
- [ ] Auto-reply generation
- [ ] Content moderation/safety checks

---

## Phase 4: Social Platform Integration

**Priority:** 🟡 MEDIUM
**Goal:** Connect real social media platforms

### 4.1 OAuth Implementation

```bash
npm install passport passport-twitter-oauth2 passport-linkedin-oauth2
npm install @types/passport -D
```

Create `backend/src/auth/oauth.ts`:

```typescript
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter-oauth2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';

// Twitter/X OAuth 2.0
passport.use(new TwitterStrategy({
  clientID: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
  callbackURL: '/auth/twitter/callback',
  scope: ['tweet.read', 'tweet.write', 'users.read'],
}, async (accessToken, refreshToken, profile, done) => {
  // Store tokens in database
  await db.insert(platforms).values({
    userId: getCurrentUserId(),
    platform: 'twitter',
    accessToken,
    refreshToken,
    metadata: profile,
  });
  done(null, profile);
}));

// LinkedIn OAuth 2.0
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: '/auth/linkedin/callback',
  scope: ['r_liteprofile', 'w_member_social'],
}, async (accessToken, refreshToken, profile, done) => {
  await db.insert(platforms).values({
    userId: getCurrentUserId(),
    platform: 'linkedin',
    accessToken,
    refreshToken,
    metadata: profile,
  });
  done(null, profile);
}));
```

### 4.2 Platform API Clients

Create `backend/src/services/platforms/twitter.ts`:

```typescript
import { TwitterApi } from 'twitter-api-v2';

export class TwitterService {
  private client: TwitterApi;

  constructor(accessToken: string) {
    this.client = new TwitterApi(accessToken);
  }

  async postTweet(content: string): Promise<{ id: string; url: string }> {
    const result = await this.client.v2.tweet(content);
    return {
      id: result.data.id,
      url: `https://twitter.com/i/status/${result.data.id}`,
    };
  }

  async getTrends(woeid: number = 1): Promise<Trend[]> {
    const trends = await this.client.v1.trendsByPlace(woeid);
    return trends[0].trends.map(t => ({
      topic: t.name,
      volume: t.tweet_volume || 0,
      url: t.url,
    }));
  }

  async getEngagement(tweetId: string): Promise<PostEngagement> {
    const tweet = await this.client.v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics'],
    });
    const metrics = tweet.data.public_metrics;
    return {
      likes: metrics?.like_count || 0,
      shares: metrics?.retweet_count || 0,
      comments: metrics?.reply_count || 0,
      reach: metrics?.impression_count || 0,
    };
  }
}
```

Create `backend/src/services/platforms/linkedin.ts`:

```typescript
export class LinkedInService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createPost(content: string, userId: string): Promise<{ id: string }> {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: `urn:li:person:${userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const data = await response.json();
    return { id: data.id };
  }
}
```

### 4.3 Unified Platform Service

Create `backend/src/services/platforms/index.ts`:

```typescript
export class PlatformService {
  async publish(post: Post, credentials: PlatformCredentials): Promise<PublishResult> {
    switch (post.platform) {
      case 'twitter':
        const twitter = new TwitterService(credentials.accessToken);
        return twitter.postTweet(post.content);

      case 'linkedin':
        const linkedin = new LinkedInService(credentials.accessToken);
        return linkedin.createPost(post.content, credentials.userId);

      default:
        throw new Error(`Unsupported platform: ${post.platform}`);
    }
  }

  async refreshEngagement(post: Post, credentials: PlatformCredentials): Promise<PostEngagement> {
    switch (post.platform) {
      case 'twitter':
        const twitter = new TwitterService(credentials.accessToken);
        return twitter.getEngagement(post.externalId);

      // Add other platforms...
    }
  }
}
```

### Deliverables
- [ ] Twitter/X OAuth integration
- [ ] LinkedIn OAuth integration
- [ ] Instagram Graph API integration
- [ ] Unified platform service
- [ ] Token refresh handling
- [ ] Rate limiting compliance

---

## Phase 5: Testing & Quality Assurance

**Priority:** 🟡 MEDIUM
**Goal:** Comprehensive test coverage

### 5.1 Testing Infrastructure

```bash
# Frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Backend
npm install -D vitest supertest @types/supertest

# E2E
npm install -D playwright @playwright/test
```

### 5.2 Frontend Unit Tests

Create `src/components/ui/__tests__/Button.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-critical');
  });
});
```

### 5.3 API Mock with MSW

```bash
npm install -D msw
```

Create `src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/trends', () => {
    return HttpResponse.json([
      { id: '1', topic: 'AI Revolution', volume: 50000, sentiment: 'positive', relevance: 85 },
      { id: '2', topic: 'Climate Action', volume: 35000, sentiment: 'neutral', relevance: 72 },
    ]);
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-post-id',
      ...body,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
  }),

  http.post('/api/posts/generate', async ({ request }) => {
    const { trendId, tone } = await request.json();
    return HttpResponse.json({
      content: `Generated ${tone} content for trend ${trendId}`,
    });
  }),
];
```

### 5.4 E2E Tests with Playwright

Create `e2e/dashboard.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays trend cards', async ({ page }) => {
    await expect(page.getByText('Viral Vectors')).toBeVisible();
    await expect(page.locator('[data-testid="trend-card"]')).toHaveCount.greaterThan(0);
  });

  test('navigates to content engine', async ({ page }) => {
    await page.click('[data-testid="nav-generator"]');
    await expect(page.getByText('Content Engine')).toBeVisible();
  });

  test('generates content from trend', async ({ page }) => {
    await page.click('[data-testid="nav-generator"]');
    await page.fill('[data-testid="topic-input"]', 'AI Technology');
    await page.click('[data-testid="generate-btn"]');
    await expect(page.getByText('Generated content')).toBeVisible({ timeout: 10000 });
  });
});
```

### 5.5 Test Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### Deliverables
- [ ] 80%+ unit test coverage
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] MSW for API mocking
- [ ] CI/CD test pipeline

---

## Phase 6: Production Deployment

**Priority:** 🟢 MEDIUM
**Goal:** Deploy to production infrastructure

### 6.1 Environment Configuration

Create `.env.example`:

```env
# Application
NODE_ENV=production
APP_URL=https://soci.app

# Database
DATABASE_URL=postgresql://user:pass@host:5432/soci

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Social Platforms
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=

# Monitoring
SENTRY_DSN=
POSTHOG_KEY=
```

### 6.2 Docker Configuration

Create `Dockerfile`:

```dockerfile
# Frontend build
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend build
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/dist ./public

# Copy backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/soci
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=soci
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 6.3 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Deploy frontend to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      # Deploy backend to Railway
      - uses: railwayapp/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

### 6.4 Monitoring Setup

Create `backend/src/monitoring.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { PostHog } from 'posthog-node';

// Error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Analytics
const posthog = new PostHog(process.env.POSTHOG_KEY, {
  host: 'https://app.posthog.com',
});

export function trackEvent(userId: string, event: string, properties?: Record<string, any>) {
  posthog.capture({
    distinctId: userId,
    event,
    properties,
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}
```

### Deliverables
- [ ] Docker containerization
- [ ] Docker Compose for local development
- [ ] GitHub Actions CI/CD pipeline
- [ ] Vercel frontend deployment
- [ ] Railway backend deployment
- [ ] Sentry error tracking
- [ ] PostHog analytics
- [ ] Health check endpoints

---

## Implementation Timeline Summary

| Phase | Description | Dependencies |
|-------|-------------|--------------|
| **Phase 0** | Critical Fixes | None (BLOCKER) |
| **Phase 1** | Enhanced Frontend | Phase 0 |
| **Phase 2** | Backend Infrastructure | Phase 0 |
| **Phase 3** | AI Integration | Phase 2 |
| **Phase 4** | Social Platform Integration | Phase 2 |
| **Phase 5** | Testing & QA | Phases 1-4 |
| **Phase 6** | Production Deployment | Phase 5 |

---

## Success Metrics

### Technical Metrics
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] 80%+ test coverage
- [ ] < 3s initial page load
- [ ] < 100ms API response times
- [ ] 99.9% uptime

### Product Metrics
- [ ] Real-time trend updates (< 5 min delay)
- [ ] AI content generation (< 5s response)
- [ ] Multi-platform publishing
- [ ] Automated engagement tracking
- [ ] User persona customization

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API rate limits | Implement request queuing and caching |
| Platform API changes | Abstract platform logic behind interfaces |
| AI content quality | Human review queue for sensitive content |
| Data security | Encrypt tokens, regular security audits |
| Scaling issues | Horizontal scaling with load balancers |

---

## Next Steps

1. **Immediate**: Execute Phase 0 to make application runnable
2. **This Week**: Begin Phase 1 frontend enhancements
3. **Parallel**: Start Phase 2 backend scaffolding
4. **Review**: Weekly progress reviews and plan adjustments

---

*Document maintained by the SOCI development team*
*Last updated: 2026-01-01*
