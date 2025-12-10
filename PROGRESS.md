# Development Progress Tracker

**Last Updated**: 2025-12-09
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
- **Scraping**: SSRF protection, private IP blocking, protocol restriction, 45s timeout + 3 retries, 5MB limit
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

### ✅ Layercode SDK Upgrade to 2.8.2 (2025-11-27)
- **Upgraded**: `@layercode/react-sdk` from 2.1.3 → 2.8.2
- **Breaking change**: SDK no longer auto-connects; requires explicit `connect()` call
- **New flow**: User taps "Start" → `connect()` → on `connected` status → `setAudioInput(true)`
- **Key config**: `audioInput: false` defers mic permission until after connection
- **Hook**: `useSimpleLayercodeVoice.ts` with `startVoiceSession()` / `endSession()` actions
- **Mobile note**: Greeting may be missed if permission dialog is slow (minor UX issue)

---

## ✅ Signup Prevention (2025-12-01)

Blocked unauthorized account creation while allowing existing users to log in.

### Files Modified (all code commented out for easy re-enable)
1. `/src/app/login/actions.ts` - Blocked signup function, disabled magic link user creation
2. `/src/app/login/page.tsx` - Removed signup UI elements
3. `/src/app/auth/callback/route.ts` - Reject new OAuth users

### Existing Users Still Work
- Email/password login via `login()` action - unchanged
- Google OAuth for users WITH organization record - unchanged
- Magic link for existing users - works (just won't create new)

### Future: Re-enable Signups
When ready to accept new users again:
1. Uncomment `signup()` function logic in actions.ts
2. Uncomment signup UI toggle in login page
3. Restore onboarding redirect in OAuth callback
4. Change `shouldCreateUser` back to `true`

---

## ✅ iOS Audio Permission Fix (2025-12-02)

Fixed race condition where iOS Safari blocks greeting TTS if mic permission isn't granted fast enough.

### Root Cause
Layercode backend sends `stream.tts(greeting)` immediately on `session.start`, but iOS gates audio output behind mic permission. If user is slow to tap "Allow", greeting displays but doesn't speak, and subsequent interactions hang.

### Solution: Permission-First Flow + Proactive Recovery
1. **Permission-first**: Request mic via `getUserMedia()` BEFORE calling Layercode `connect()`. iOS audio system is initialized when greeting arrives.
2. **Recovery handler**: `handleRecovery()` disconnects broken connection and reconnects fresh
3. **Proactive retry**: "Didn't hear me? Tap to retry" link appears 2s after greeting (no 10s timeout wait)
4. **Safety net**: 10-second thinking timeout still exists as final fallback

### Files Modified
- `src/components/widget/SimplifiedVoiceInterface.tsx` - All changes in this single file

### Limitations
Cannot fully fix root cause without Layercode backend changes (greeting TTS timing). This is a graceful workaround.

---

## ✅ Landing Page Redesign (2025-12-02)

Complete redesign with new copy, hero, differentiator sections, use cases, and FAQ accordion.

**Files**: `/src/app/page.tsx`, `/src/app/landing.css`, `/src/components/FAQAccordion.tsx`

---

## ✅ Publishable API Key Security (2025-12-02)

Added API key authorization to prevent unauthorized widget usage. Previously, anyone could embed the widget on any domain without permission.

### Business Logic
- Each organization gets a unique **publishable API key** (format: `pk_live_` + 48 hex chars)
- Customers must include `data-key="pk_live_..."` in their embed snippet
- Widget silently fails (doesn't appear) if key is missing or invalid
- All API calls validate key and scope data to that organization only

### Customer Embed Code (New Format)
```html
<script src="https://easyask.io/widget.js" data-key="pk_live_..."></script>
```

### Security Model
- **Defense in depth**: Key validated at 3 points (widget-pages API, layercode authorize, webhook)
- **Silent failure**: Invalid keys return empty data, no error messages exposed
- **Organization scoping**: Page queries filtered by org ID from key lookup

### Admin Experience
- Embed code in admin dashboard now auto-populates with customer's key
- API key displayed in Organization Details with copy button

### Files Modified
- `src/lib/api-keys.ts` (NEW) - Key generation, validation, masking utilities
- `public/widget.js` - Reads `data-key` attribute, passes to iframe
- `src/app/api/widget-pages/route.ts` - Validates key, scopes queries to org
- `src/app/api/layercode/authorize/route.ts` - Validates key before Layercode session
- `src/app/api/layercode/webhook/route.ts` - Uses key for org lookup
- `src/app/admin/pages/page.tsx` - Shows personalized embed code + API key display

### Migration
- Existing orgs (EasyAsk, Precision Nutrition) have keys auto-generated
- EasyAsk landing page and demo page updated with key
- Precision Nutrition needs to update their embed code

### ⚠️ GTM (Google Tag Manager) Limitation
**Problem**: GTM strips `data-*` attributes from external `<script src="...">` tags in Custom HTML. The script loads but without the `data-key` attribute, causing widget to silently fail.

**Why**: GTM processes external scripts and creates them programmatically (not raw HTML injection). This is visible in the DOM as scripts with empty `id=""`, `text=""`, `charset=""` attributes.

**Solution**: Use inline script that explicitly sets attributes:
```html
<script>
(function() {
  var s = document.createElement('script');
  s.src = 'https://www.easyask.io/widget.js';
  s.setAttribute('data-key', 'pk_live_CUSTOMER_KEY_HERE');
  s.setAttribute('data-position', 'bottom-left');
  document.body.appendChild(s);
})();
</script>
```

**When to share**: If customer reports widget.js loads but widget doesn't appear, check if they're using GTM.

---

## ✅ Experimental Widget Mode (2025-12-09)

Page-specific experimental features for testing widget changes without affecting other pages.

### What It Does
- **Larger widget**: `max-w-[800px]` responsive (vs `max-w-md`), scales down on mobile
- **Taller response area**: `350px` max-height (vs `200px`), `text-base` (vs `text-sm`)
- **Detailed AI responses**: `maxOutputTokens: 2500` (vs `1500`), `temperature: 0.4` (vs `0.3`)
- **Voice summary only**: LLM generates brief contextual intro (via `gemini-2.0-flash-lite`) while full response displays as text

### Active Experimental Pages
- `https://www.precisionnutrition.com/become-a-nutrition-coach`

### Files
- `src/lib/experimental.ts` - Config file with page URLs and settings
- `src/app/api/widget-pages/route.ts` - Returns `is_experimental` flag
- `src/components/widget/VoiceWidget.tsx` - Threads flag to child components
- `src/components/widget/WidgetModal.tsx` - Conditional modal sizing
- `src/components/widget/SimplifiedVoiceInterface.tsx` - Conditional response area
- `src/lib/gemini-file-search.ts` - Experimental AI settings
- `src/app/api/layercode/webhook/route.ts` - Experimental prompt + voice summary

### To Add a Page
Edit `src/lib/experimental.ts` and add URL to `EXPERIMENTAL_PAGES` array.

### To Remove Experiment
1. Delete `src/lib/experimental.ts`
2. Run `grep -r "isExperimental\|EXPERIMENTAL" src/` to find all usages
3. Remove conditional logic, keep non-experimental defaults

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
