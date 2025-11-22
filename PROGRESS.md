# Development Progress Tracker

**Last Updated**: 2025-11-21
**Current Phase**: Production Ready - Multi-User Organizations + Security + Analytics
**Supabase Project**: `fwimhxkkszdaogugslar`

---

## ⚠️ CRITICAL: Streaming Architecture, AI Prompting & Widget UI

**DO NOT modify streaming architecture, AI prompting, or widget UI without explicit permission. NO EXCEPTIONS.**

This includes:
- **LLM streaming** (Gemini responses, model configurations)
- **Layercode streaming** (WebSocket STT/TTS, voice processing)
- **File Search queries** (metadata filters, query structure)
- **System prompts** (instructions passed to Gemini)
- **Conversation history** (context passing to Gemini)
- **Any changes to data flow** in the voice query pipeline
- **Widget UI/UX** (SimplifiedVoiceInterface, VoiceWidget, animations, layouts, user interactions)

**Reason:** These systems are highly sensitive to latency and reliability. Changes can introduce subtle issues that only appear in production under load.

---

## 🎯 Current Architecture

### Core Tech Stack
- **Framework**: Next.js 14 App Router + TypeScript
- **Database**: Supabase (Postgres + Storage + Auth)
- **AI**: Gemini File Search (semantic RAG), Gemini 2.5 Flash (voice responses)
- **Voice**: Layercode (WebSocket STT/TTS)
- **Scraping**: Jina AI Reader (r.jina.ai) - FREE, fast markdown conversion
- **Analytics**: PostHog (privacy-first, session replay)
- **Deployment**: Vercel (https://easyask.io)

### Data Flow
1. **Scraping**: URL → Jina AI Reader → Markdown → Supabase Storage
2. **Upload**: Local files → Supabase Storage
3. **Indexing**: Storage → Google File Search (embeddings)
4. **Voice Query**: User → Layercode STT → Gemini + File Search → Layercode TTS

### Demo Page Architecture
**Location**: `/src/app/demo/`

**Structure**:
- **URL**: `/demo?url=https://example.com/[page]`
- **Architecture**: Target page loads in iframe with widget overlay
- **Validation**: Whitelist of allowed domains (precisionnutrition.com, layercode.com)
- **Note**: Some sites block iframe embedding with X-Frame-Options or CSP headers
- **Widget positioning**: Bottom-left (CSS override)
- **Customizations**:
  - No backdrop blur (allows page scrolling/interaction)
  - Voice button 50% smaller (`p-4` instead of `p-8`)
  - Demo badge in top-left corner

**Files**:
- `/src/app/demo/page.tsx` - Main demo page with iframe + widget
- `/src/app/demo/layout.tsx` - Layout wrapper with Suspense

### Proxy Demo Endpoint (For Iframe-Restricted Sites)
**Location**: `/src/app/api/proxy-demo/route.ts`

**Purpose**: Fetches external pages server-side and strips iframe-blocking headers to enable iframe embedding in the demo page.

**⚠️ IMPORTANT**: Only use with **explicit permission** from the target site owner. This endpoint bypasses security headers intentionally.

**How it works**:
1. Accepts `?url=` parameter with target page URL
2. Validates domain against whitelist (hubermanlab.com, ai.hubermanlab.com, dexa.ai)
3. Fetches page server-side
4. Rewrites URLs to route through proxy
5. Strips `X-Frame-Options` and `Content-Security-Policy` headers
6. Returns modified HTML that can be iframed

**Usage**:
```
/demo?url=https://easyask.io/api/proxy-demo?url=https://hubermanlab.com/episode/example
```

**Whitelist** (edit in route.ts):
- `hubermanlab.com`
- `ai.hubermanlab.com`
- `dexa.ai`

**Limitations**:
- Dynamic JavaScript features may break (cookies, CORS)
- Adds latency (server-side fetch)
- Cached for 5 minutes
- Requires permission from site owner

**Files**:
- `/src/app/api/proxy-demo/route.ts` - Standalone proxy endpoint

---

## 📚 Google File Search - CRITICAL Patterns

### API Reference
- **Stores API**: https://ai.google.dev/api/file-search/file-search-stores
- **Documents API**: https://ai.google.dev/api/file-search/documents

### ⚠️ SDK Bug: Listing Documents
The `@google/genai` SDK pagination is broken. **Always use REST API**:

```typescript
import https from 'https'

async function listAllDocuments() {
  const allDocuments = []
  let pageToken = null

  do {
    const url = `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}/documents?pageSize=20${pageToken ? `&pageToken=${pageToken}` : ''}&key=${process.env.GEMINI_API_KEY}`
    const data = await httpsGet(url)
    allDocuments.push(...(data.documents || []))
    pageToken = data.nextPageToken
  } while (pageToken)

  return allDocuments
}
```

### ⚠️ Document Deletion
Documents have chunks. **Must use `force: true`**:

```typescript
// ✅ CORRECT
await ai.fileSearchStores.documents.delete({
  name: documentId,
  config: { force: true }  // Required to delete chunks
})
```

### Key Learnings
1. REST API for listing (SDK pagination broken)
2. `force: true` for deletion (documents have chunks)
3. Store document IDs, not operation IDs
4. PageSize max is 20 (API enforced)
5. Custom metadata essential for filtering (`page_url`, `page_title`)

### Reference Scripts
- `scripts/list-all-docs-rest-api.mjs` - Proper pagination
- `scripts/force-delete-with-sdk.mjs` - Delete with force flag
- `scripts/inspect-file-search-store.mjs` - Diagnostic tool

---

## 📤 File Management Architecture

### Storage Strategy
**All files stored in Supabase Storage** - scraped pages AND uploaded files use identical architecture:
- **Bucket**: `uploaded-docs` (private, 10MB limit)
- **Path format**: `{userId}/{timestamp}-{filename}.md`
- **Database**: Metadata in `scraping_jobs` and `file_uploads` tables (no markdown in DB)

### Scraping (Jina AI Reader)
- **Endpoint**: `POST /api/admin/scrape`
- **Process**: URL → `https://r.jina.ai/{url}` → Markdown → Storage
- **Performance**: 500-800ms, FREE (20 req/min)

```typescript
// Simple GET request - no API key needed
const response = await fetch(`https://r.jina.ai/${url}`)
const markdown = await response.text()
```

### Upload to File Search
- **Endpoint**: `POST /api/admin/upload-to-file-search`
- **Input**: `{ jobIds: [], uploadIds: [] }` - handles both scraped + uploaded
- **Process**: Download from Storage → Upload to Gemini → Update `indexed_pages`

---

## 🔐 Authentication (Supabase Auth + SSR)

- **Package**: `@supabase/ssr` for Next.js App Router
- **Methods**: Email/password + Magic link (OTP)
- **Protected**: `/admin/*`, `/test`
- **Public**: `/`, `/widget`, `/login`

### Middleware
- Auto-refreshes tokens on every request
- Redirects unauthenticated → `/login`
- Excludes: static assets, Layercode webhook

---

## 🔧 Database Schema

### Core Tables
- **organizations** - Companies using widget (file_search_store_name, website_url)
- **users** - Team members (organization_id, role: owner/admin/editor/analyst)
- **widget_pages** - Pages where widget appears (page_url, page_title, page_goal)
- **indexed_pages** - Documents in File Search (page_urls array for filtering)
- **scraping_jobs** / **file_uploads** - Content management with dual status tracking
- **conversation_sessions** / **conversation_messages** - Analytics + escalations

### Key Patterns
- **Organization-centric**: All data scoped by `organization_id` (not user_id)
- **Page-based filtering**: Documents tagged with `page_urls` array
- **Dual status tracking**: `scraping_status` + `indexing_status` (allows retry)
- **RLS**: All tables filter by organization_id

---

## 🎯 Production Deployment

**Live**: https://easyask.io

### Vercel Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
LAYERCODE_API_KEY
NEXT_PUBLIC_LAYERCODE_PIPELINE_ID
LAYERCODE_WEBHOOK_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_APP_URL=https://easyask.io
```

---

## 📋 Completed Features

### ✅ Phase 1-6: Core Platform (2025-11-10 to 11-12)
- Gemini File Search integration for semantic RAG
- Supabase SSR authentication (email/password + magic link)
- Drag & drop file upload with unified Storage architecture
- Jina AI Reader scraping (2-4x faster than Firecrawl, FREE)
- Page-based architecture: 1 Organization = 1 Website = 1 File Search Store
- Cascade deletion with confirmation modals

### ✅ Conversation Tracking Simplification (2025-11-14)
- Raw transcript storage from Layercode session.end events
- Removed complex metadata matching (~100 lines of code)
- Added "Avg Session Duration" metric (removed "Content Match Rate")
- `conversation_messages`: role, message, timestamp, needs_followup, followup_reason
- `conversation_sessions`: total_questions, started_at, ended_at, user_email, escalation fields

### ✅ Gemini Context & Prompting Fix (2025-11-15)
**Critical improvement - now part of protected system**
- Pass full conversation history to Gemini (not just current question)
- System instructions properly sent via `systemInstruction` config
- Strong sales-focused prompts with CRITICAL RULES:
  - ❌ NEVER ask users to clarify ("What's the price?" → direct answer)
  - ✅ Use conversation context for pronouns ("that", "it")
- Files: `src/lib/gemini-file-search.ts`, `src/app/api/layercode/webhook/route.ts`

### ✅ Performance Optimization (2025-11-15)
- In-memory cache (5min TTL) for widget page/user lookups
- Gemini config: temperature: 0.3, maxOutputTokens: 1500
- DB query optimization (select only needed columns)
- Conversation context caching in memory
- Result: Cache hit = ~0ms vs ~50-100ms DB query

### ✅ Widget UI/UX (2025-11-16)
- Text response display with markdown formatting, sparkle icon, copy button
- Sparkle burst animation (8 sparkles) when AI answer arrives
- Collapsible conversation history with copy function
- Animated orb button with sound waves, blue-purple gradient
- Mobile two-tap flow (expand pill → open modal)
- Files: `SimplifiedVoiceInterface.tsx`, `WidgetButton.tsx`

### ✅ Security Validation (2025-11-16)
- **File Upload**: MIME type validation (magic numbers), UTF-8 validation, 10MB/50MB limits
- **Scraping**: SSRF protection, private IP blocking, protocol restriction, 30s timeout, 5MB limit
- Package: `file-type` for magic number detection

### ✅ Email Escalation & AI Analysis (2025-11-16)
- Email capture UI appears after first AI response
- Gemini 2.5-flash-lite analyzes conversations (~$0.000075 per analysis)
- Conservative flagging: incomplete responses, unhelpful answers
- Fire-and-forget analysis trigger in webhook (non-blocking)
- Admin dashboard: filters, expandable transcripts, flagged message badges
- Files: `conversation-analysis.ts`, `/api/conversations/escalate`, `/admin/escalations`

### ✅ Abuse Prevention & Rate Limiting (2025-11-17)
- **IP-based limits** (Upstash Redis): 5 sessions/hr, 100 webhooks/hr, 3 emails/day
- **Session limits**: 50 messages max, 5-min idle timeout
- **Webhook verification**: HMAC-SHA256 signatures, replay attack prevention
- Result: Cost reduced from $500-2000/day → ~$20-50/day (95% reduction)
- Files: `src/lib/ratelimit.ts`, `src/lib/webhook-verification.ts`

### ✅ Multi-User Organization Migration (2025-11-18)
- **Architecture change**: user-centric → organization-centric data model
- Multiple users can now collaborate within same organization
- Updated 16 admin API endpoints to filter by organization_id
- Fixed cross-org data leakage (critical security fix in escalations)
- See: `docs/MULTI_USER_ORG_MIGRATION.md`

### ✅ PostHog Analytics (2025-11-20)
- **Widget events**: opened, started, response_copied, feedback_submitted, escalation_submitted
- **Admin events**: dashboard_viewed, page_filtered, conversation_expanded
- Privacy-first: no conversation content, inputs masked in session replay
- Anonymous visitor tracking, identified admin tracking
- Files: `PostHogProvider.tsx`, widget/admin components

---

## 🔮 Upcoming Priorities

### Performance: Smart Caching Strategy (When Needed)
**Current**: No caching - always fresh data (works great for 1-10 users)

**When to revisit:**
- Supabase bill >$50/month for queries
- Admin pages >1 second load time
- 50+ organizations using platform

**Phased approach:**
- Phase 2 (10-50 users): 30s cache on aggregate stats
- Phase 3 (50-200): SWR with 10-15s refresh, materialized views
- Phase 4 (200+): Redis edge caching, read replicas

---

## 📖 Reference

### Useful Scripts
- `scripts/inspect-file-search-store.mjs` - View store contents, limits, usage
- `scripts/list-all-docs-rest-api.mjs` - Proper document listing with pagination
- `scripts/force-delete-with-sdk.mjs` - Delete documents with force flag

### Key Files
- `src/app/api/admin/scrape/route.ts` - Jina AI scraping
- `src/app/api/admin/upload-to-file-search/route.ts` - Unified upload handler
- `src/app/api/layercode/webhook/route.ts` - Voice conversation handler
- `src/lib/gemini-file-search.ts` - File Search queries with conversation history
- `src/components/widget/SimplifiedVoiceInterface.tsx` - Widget UI
- `src/lib/conversation-analysis.ts` - AI-powered escalation analysis

### Documentation
- `MINDSET.md` - Architecture principles (SLC: Simple, Lovable, Complete)
- `CLAUDE.md` - Project context for AI assistance
- `docs/MULTI_USER_ORG_MIGRATION.md` - Schema migration details
