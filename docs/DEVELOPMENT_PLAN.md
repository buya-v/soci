# SOCI Development Plan
## Reality-Checked Roadmap

**Updated:** 2026-02-28
**Current Version:** 2.0.0 ("Resilient Aurora")
**Branch:** `develop`

---

## Status Audit — What's Done vs What's Not

### DONE (no action needed)
- [x] App runs, builds, deploys (Phase 0 complete)
- [x] TypeScript compiles cleanly, ESLint passes (0 warnings)
- [x] React 18 SPA with 13 lazy-loaded views and React Router v7
- [x] Zustand v5 state management with persisted slices
- [x] TanStack Query v5 for server state
- [x] Midnight Aurora glassmorphism design system with Tailwind
- [x] AI content generation via server-side proxy (Claude + Gemini + DALL-E 3)
- [x] Video generation via Google Veo 2
- [x] Twitter/X OAuth (both 1.0a and 2.0) — real posting works
- [x] Facebook Pages OAuth — real posting works
- [x] Trend monitoring from Reddit + Hacker News
- [x] Docker + nginx + certbot deployment stack
- [x] Vercel serverless deployment (dual-mode with Express)
- [x] GitHub Actions CI/CD (ci.yml + deploy.yml)
- [x] Security hardening (bcrypt auth, server-side API keys, CSP headers)
- [x] Command palette, keyboard shortcuts, undo/redo
- [x] Error boundaries

### NOT DONE (the real work)
- [ ] No database — all state in localStorage (data loss on browser clear)
- [ ] Old insecure AI client (`dangerouslyAllowBrowser: true`) still exists alongside secure proxy
- [ ] Most platform publishing is simulated (`Math.random()` 90% success rate)
- [ ] Only 1 test file (auth utils) — effectively 0% meaningful coverage
- [ ] No LinkedIn or Instagram integration
- [ ] No data export/backup mechanism
- [ ] No rate limiting on API endpoints (only login has it)
- [ ] OAuth tokens stored in localStorage (should be server-side)

---

## Phase 1: Security & Data Integrity (HIGH PRIORITY)

**Goal:** Stop losing data. Stop leaking API keys.

### 1.1 Remove Old Insecure AI Client
- Delete or gut `src/services/ai.ts` (the one with `dangerouslyAllowBrowser: true`)
- Ensure all AI calls route through `src/services/ai-client.ts` (server-side proxy)
- Audit all components for direct SDK imports

### 1.2 Add SQLite Backend for Persistence
The app is single-user. Don't over-engineer with PostgreSQL — use SQLite via `better-sqlite3` in the Express server:
- Posts (drafts, scheduled, published)
- Templates and hashtag collections
- Media library metadata
- OAuth tokens (encrypted at rest)
- Persona configuration
- Marketing plans

Keep localStorage as a fast cache, but SQLite is the source of truth. Sync on load.

### 1.3 Move OAuth Tokens Server-Side
- Twitter and Facebook tokens currently live in Zustand (localStorage)
- Move to SQLite with AES-256 encryption
- Frontend gets a session token, server handles platform API calls

### 1.4 Add API Rate Limiting
- Rate limit all `/api/*` endpoints (not just login)
- Use express-rate-limit or similar

### Deliverables
- [ ] Single AI client path (server-side only)
- [ ] SQLite database with migration system
- [ ] Encrypted OAuth token storage
- [ ] Rate limiting on all endpoints

---

## Phase 2: Real Publishing Pipeline (MEDIUM-HIGH)

**Goal:** Publishing actually works for all supported platforms.

### 2.1 Fix Simulated Publishing
`src/services/publishing.ts` has a `publishToplatform` function that fakes it:
```
success: Math.random() > 0.1
```
Replace with real API calls for Twitter and Facebook (already have working OAuth endpoints in `/api/twitter/tweet` and `/api/facebook/post`). Wire the ContentLab and DraftsQueue to use these real endpoints.

### 2.2 Add LinkedIn Integration
- OAuth 2.0 flow (similar pattern to Twitter/Facebook)
- Post creation via LinkedIn API v2
- New serverless handler in `api/linkedin/`

### 2.3 Scheduled Publishing
Currently "scheduled" posts just sit in localStorage with a timestamp. Need:
- Server-side scheduler (cron or setInterval in Express)
- Check for posts past their `scheduledAt` time
- Auto-publish via the real publishing pipeline
- Update status and notify frontend

### Deliverables
- [ ] Real Twitter publishing wired end-to-end
- [ ] Real Facebook publishing wired end-to-end
- [ ] LinkedIn OAuth + publishing
- [ ] Server-side post scheduler
- [ ] Publishing status tracking (success/failure with error details)

---

## Phase 3: Testing (MEDIUM)

**Goal:** Enough coverage to refactor with confidence.

### 3.1 API Endpoint Tests
Priority: test the handlers that touch external services
- `api/ai/generate-content.ts` — mock Anthropic/Gemini, test error handling
- `api/twitter/tweet.ts` — mock Twitter API, test OAuth flow
- `api/facebook/post.ts` — mock Facebook API
- `api/auth/login.ts` — already partially tested

### 3.2 Store/Slice Tests
Test the Zustand slices — they hold all business logic:
- `contentSlice` — post CRUD, status transitions
- `automationSlice` — platform connection state
- `mediaSlice` — upload, folder management

### 3.3 Critical Path E2E
One Playwright test that covers the happy path:
1. Login
2. Generate content from a trend
3. Edit in ContentLab
4. Schedule or publish
5. Verify in PublishedPosts view

### Deliverables
- [ ] API handler tests with mocked externals
- [ ] Zustand slice unit tests
- [ ] 1 critical path E2E test
- [ ] CI runs tests on every push (already in ci.yml, just needs tests)

---

## Phase 4: UX Polish & Missing Features (LOWER)

**Goal:** Fill gaps that make the app feel incomplete.

### 4.1 Data Export/Import
- Export all data as JSON (posts, templates, config)
- Import from JSON backup
- Already have a `DataManager.tsx` component — wire it to real export

### 4.2 Publishing Analytics
- After publishing, fetch real engagement metrics from Twitter/Facebook APIs
- Display in Dashboard and PublishedPosts views
- Replace the current simulated engagement data

### 4.3 Clean Up Mockup Directory
- `mockup/` is an old Gemini-only prototype — not wired into anything
- Either archive it or delete it

### Deliverables
- [ ] JSON export/import working
- [ ] Real engagement metrics from platform APIs
- [ ] mockup/ directory cleaned up

---

## What We're NOT Doing (Scope Control)

The old plan proposed things that don't match the app's reality as a single-user tool:

- **tRPC** — Overkill. The Vercel serverless handlers work fine.
- **BullMQ / Redis job queues** — Not needed for one user. A simple `setInterval` scheduler in Express is sufficient.
- **Drizzle ORM + PostgreSQL** — Too heavy. SQLite covers single-user persistence perfectly.
- **SSE real-time updates** — Polling with TanStack Query refetch is already in place and adequate.
- **Sentry + PostHog** — Nice to have but not a priority. Console logging + the existing error boundaries are enough for now.
- **Instagram Graph API** — Complex approval process (Meta app review). Defer unless specifically needed.

---

## Priority Order

| # | Phase | Impact | Effort |
|---|-------|--------|--------|
| 1 | Remove insecure AI client | High (security) | Low |
| 2 | Add SQLite persistence | High (data loss) | Medium |
| 3 | Move OAuth tokens server-side | High (security) | Medium |
| 4 | Wire real publishing pipeline | High (core feature) | Medium |
| 5 | Add LinkedIn integration | Medium (platform coverage) | Medium |
| 6 | API + slice tests | Medium (confidence) | Medium |
| 7 | Server-side post scheduler | Medium (automation) | Low |
| 8 | Data export/import | Low (safety net) | Low |
| 9 | Real engagement metrics | Low (analytics) | Medium |

---

*Updated 2026-02-28 — Openclaw*
