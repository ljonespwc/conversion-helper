# Development Progress Tracker

**Last Updated**: 2026-02-03
**Current Phase**: Production Ready - Text Chat Interface
**Supabase Project**: `fwimhxkkszdaogugslar`

---

## ⚠️ CRITICAL: AI Prompting & Widget UI

**DO NOT modify AI prompting or widget UI without explicit permission. NO EXCEPTIONS.**

This includes:
- **LLM configuration** (Gemini responses, model settings, temperature)
- **File Search queries** (metadata filters, query structure)
- **System prompts** (instructions passed to Gemini)
- **Conversation history** (context passing to Gemini)
- **Any changes to data flow** in the chat query pipeline
- **Widget UI/UX** (ChatInterface, WidgetModal, WidgetButton, animations, layouts)

**Reason:** These systems are sensitive to user experience. Changes can introduce subtle issues that only appear in production.

---

## 🎯 Current Architecture

### Core Tech Stack
- **Framework**: Next.js 14 App Router + TypeScript
- **Database**: Supabase (Postgres + Storage + Auth)
- **AI**: Gemini 2.5 Flash + File Search (semantic RAG)
- **Scraping**: Jina AI Reader (r.jina.ai) - FREE, fast markdown conversion
- **Analytics**: PostHog (privacy-first, session replay)
- **Deployment**: Vercel (https://easyask.io)

### Data Flow
1. **Scraping**: URL → Jina AI Reader → Markdown → Supabase Storage
2. **Upload**: Local files → Supabase Storage
3. **Indexing**: Storage → Google File Search (embeddings)
4. **Chat Query**: User types question → `/api/chat` → Gemini + File Search → Text response

### Demo Page Architecture
**Location**: `/src/app/demo/`

**Structure**:
- **URL**: `/demo?url=https://example.com/[page]`
- **Architecture**: Target page loads in iframe with widget overlay
- **Validation**: Whitelist of allowed domains (precisionnutrition.com)
- **Note**: Some sites block iframe embedding with X-Frame-Options or CSP headers
- **Widget positioning**: Bottom-left (CSS override)
- **Customizations**:
  - No backdrop blur (allows page scrolling/interaction)
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
- **Path format**: `{userId}/{timestamp}-{filename}`
- **Allowed types**: `.txt`, `.md`, `.pdf` (bucket allows `text/plain`, `text/markdown`, `application/pdf`)
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
- Excludes: static assets, public API routes

---

## 🔧 Database Schema

### Core Tables (9 total, all RLS-enabled)

| Table | Rows | Purpose |
|-------|------|---------|
| **organizations** | 2 | Companies using widget (publishable_key, file_search_store_name, show_branding) |
| **users** | 2 | Team members (organization_id, role: owner/admin/editor/analyst) |
| **widget_pages** | 3 | Pages where widget appears (page_url, page_title, page_goal, widget_line1/2) |
| **indexed_pages** | 25 | Documents in File Search (page_urls array, document_id, source_type) |
| **scraping_jobs** | 4 | URL scraping jobs (scraping_status + indexing_status for retry) |
| **file_uploads** | 22 | Uploaded files (file_path in Supabase Storage) |
| **conversation_sessions** | 62 | Chat sessions (user_rating, user_email, is_bookmarked, last_viewed_at) |
| **conversation_messages** | 306 | Messages (role, message, timestamp, needs_followup) |
| **early_access_signups** | 2 | Landing page email signups |

### Key Patterns
- **Organization-centric**: All data scoped by `organization_id` (not user_id)
- **Page-based filtering**: Documents tagged with `page_urls` array for File Search filtering
- **Dual status tracking**: `scraping_status` + `indexing_status` (allows retry on failure)
- **Admin tracking**: `is_bookmarked`, `last_viewed_at` for conversation management

---

## 🎯 Production Deployment

**Live**: https://easyask.io

### Vercel Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_APP_URL=https://easyask.io
```

---

## 📋 Completed Features

### ✅ Core Platform (2025-11-10 to 11-18)
- Gemini File Search integration for semantic RAG
- Supabase SSR authentication (email/password + magic link)
- Drag & drop file upload with unified Storage architecture
- Jina AI Reader scraping (FREE, 500-800ms)
- Page-based architecture: 1 Organization = 1 Website = 1 File Search Store
- Multi-user organizations with role-based access (owner/admin/editor/analyst)
- See: `docs/MULTI_USER_ORG_MIGRATION.md`

### ✅ AI & Conversation (2025-11-14 to 11-16)
- Full conversation history passed to Gemini (not just current question)
- Sales-focused prompts: never ask for clarification, use context for pronouns
- In-memory caching for widget page lookups (~0ms vs ~50-100ms)
- Email escalation with AI analysis of incomplete responses

### ✅ Security & Rate Limiting (2025-11-16 to 11-17)
- **File Upload**: MIME type validation (magic numbers), UTF-8 validation, 10MB limit, PDF support (magic number verified)
- **Scraping**: SSRF protection, private IP blocking, 45s timeout, 5MB limit
- **Rate limits** (Upstash Redis): 50 messages/session, 5 sessions/hr per IP, 3 emails/day
- Package: `file-type` for magic number detection

### ✅ PostHog Analytics (2025-11-20)
- Widget events: opened, response_copied, feedback_submitted, escalation_submitted
- Admin events: dashboard_viewed, page_filtered, conversation_expanded
- Privacy-first: no conversation content, inputs masked in session replay

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
- **Defense in depth**: Key validated at widget-pages API and chat API
- **Silent failure**: Invalid keys return empty data, no error messages exposed
- **Organization scoping**: All queries filtered by org ID from key lookup

### Admin Experience
- Embed code in admin dashboard now auto-populates with customer's key
- API key displayed in Organization Details with copy button

### Files Modified
- `src/lib/api-keys.ts` - Key generation, validation, masking utilities
- `public/widget.js` - Reads `data-key` attribute, passes to iframe
- `src/app/api/widget-pages/route.ts` - Validates key, scopes queries to org
- `src/app/api/chat/route.ts` - Validates key for chat requests
- `src/app/admin/pages/page.tsx` - Shows personalized embed code + API key display

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

## ✅ Conversation Persistence (2026-01-15)

Users can now close and reopen the widget without losing their conversation. Messages persist per-domain and auto-restore on widget open.

### Features
- **Auto-restore**: Previous messages load automatically when widget reopens
- **Per-domain sessions**: One conversation per API key (across all pages on same domain)
- **"Start new conversation" link**: Appears for restored sessions, lets users begin fresh
- **Server-side history rebuild**: LLM context restored from DB even after server restart

### Files Added/Modified
- `src/app/api/conversations/messages/route.ts` (NEW) - Fetch messages for session restoration
- `src/app/api/chat/route.ts` - Rebuild conversationHistory from DB on restored sessions
- `src/hooks/useChat.ts` - localStorage session tracking, `startFreshConversation()` function
- `src/components/widget/ChatInterface.tsx` - "Start new conversation" link UI

### ⚠️ Supabase JS Client Caching Bug
**Problem**: The Supabase JS client (`@supabase/supabase-js`) caches query results internally, even with `cache: 'no-store'` and `{ count: 'exact' }`. New messages saved to DB weren't returned by subsequent queries.

**Symptoms**: First restore worked, but messages added after restoration weren't visible on next reopen.

**Root cause**: PostgREST query plan caching in the Supabase JS client. Adding `Cache-Control` headers and `.limit()` helped partially but didn't fully resolve it.

**Solution**: Bypass the Supabase JS client entirely for the messages query. Use direct `fetch()` to the REST API:

```typescript
const messagesUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/conversation_messages?session_id=eq.${sessionId}&order=timestamp.asc&select=role,message,timestamp`
const response = await fetch(messagesUrl, {
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache'
  },
  cache: 'no-store'
})
```

**Lesson**: When Supabase JS client returns stale data despite cache headers, use direct REST API calls with `fetch()`.

---

## ✅ Experimental Widget Mode (2025-12-09)

Page-specific experimental features for testing widget changes without affecting other pages.

### What It Does
- **Larger widget**: `max-w-[800px]` responsive (vs `max-w-md`), scales down on mobile
- **Taller response area**: `350px` max-height (vs `200px`), `text-base` (vs `text-sm`)
- **Detailed AI responses**: `maxOutputTokens: 2500` (vs `1500`), `temperature: 0.4` (vs `0.3`)
- **Conversation history**: Expandable history panel in experimental mode only

### Active Experimental Pages
- `https://www.precisionnutrition.com/become-a-nutrition-coach`

### Files
- `src/lib/experimental.ts` - Config file with page URLs and settings
- `src/app/api/widget-pages/route.ts` - Returns `is_experimental` flag
- `src/components/widget/VoiceWidget.tsx` - Threads flag to child components
- `src/components/widget/WidgetModal.tsx` - Conditional modal sizing
- `src/components/widget/ChatInterface.tsx` - Conditional response area + history panel
- `src/lib/gemini-file-search.ts` - Experimental AI settings

### To Add a Page
Edit `src/lib/experimental.ts` and add URL to `EXPERIMENTAL_PAGES` array.

### To Remove Experiment
1. Delete `src/lib/experimental.ts`
2. Run `grep -r "isExperimental\|EXPERIMENTAL" src/` to find all usages
3. Remove conditional logic, keep non-experimental defaults

---

## ✅ Group ID Widget Targeting (2026-01-20)

Alternative to URL-based page matching. Use when the visitor's URL can't reliably identify the content context (e.g., SPAs, dynamic pages).

### Embed Code
```html
<script src="https://easyask.io/widget.js"
        data-key="pk_live_..."
        data-group-id="coaching-program">
</script>
```

### How It Works
- `data-group-id` bypasses URL pattern matching entirely
- Directly matches `widget_pages.page_url` against the group ID value
- Content assigned to `page_url = "coaching-program"` is used for File Search filtering
- Experimental mode works with group IDs (add to `EXPERIMENTAL_PAGES` array)

### Setup
1. Create widget_page in admin with `page_url` = your group ID (e.g., `"coaching-program"`)
2. Assign content to that page
3. Add `data-group-id="coaching-program"` to embed code

### Notes
- Group ID can be any string (including numeric values like `"123"`)
- Backwards compatible: omit `data-group-id` for standard URL-based matching

---

## ✅ Consultative Selling for Sell Pages (2026-01-23)

AI-powered stage-aware conversation behavior for pages with `page_goal = 'sell'`. Uses two-call LLM architecture to classify visitor intent and adapt response style.

### Architecture
```
User Message
     ↓
┌─────────────────────────────────────┐
│  1. CLASSIFICATION CALL             │
│  Gemini 2.5 Flash REST API          │
│  - responseJsonSchema for structure │
│  - thinkingBudget: 0 (save tokens)  │
│  Output: stage, intent, signal      │
└─────────────────────────────────────┘
     ↓
  Store in DB
     ↓
┌─────────────────────────────────────┐
│  2. RESPONSE CALL                   │
│  Gemini 2.5 Flash + File Search     │
│  Stage-aware prompts guide response │
└─────────────────────────────────────┘
```

### Classification API Details
Uses direct REST API (not SDK) for reliable JSON output:
- `responseMimeType: 'application/json'` - enforces JSON output
- `responseJsonSchema` - defines exact structure with enums
- `thinkingBudget: 0` - disables Gemini 2.5's thinking feature (otherwise consumes output tokens)
- Prompt provides semantic context, not format instructions (per Google's recommendation)

### Conversation Stages
| Stage | Behavior |
|-------|----------|
| `discovering` | Focus on understanding visitor. Ask about situation/goals. Don't push purchase. |
| `evaluating` | Go deeper on concerns. Ask what matters most. |
| `ready_to_buy` | Be direct about next steps. Offer to help them get started. |
| `handoff_needed` | Helpful without sales pressure. Reassure human will follow up. |

### Intent Categories
`pricing`, `fit`, `trust`, `features`, `comparison`, `objection`, `logistics`, `general`

Each intent gets specific guidance (e.g., pricing → include specific numbers, objection → acknowledge directly).

### Database Schema Changes
```sql
-- conversation_sessions
conversation_stage text DEFAULT 'discovering'
  CHECK (stage IN ('discovering', 'evaluating', 'ready_to_buy', 'handoff_needed'))

-- conversation_messages (user messages only)
intent_category text
buying_signal boolean
```

### Files Added/Modified
- `src/lib/consultative-selling.ts` (NEW) - Classification, prompt builder, types
- `src/app/api/chat/route.ts` - Sell-page branch with classification flow

### Notes
- Only activates for `page_goal === 'sell'` - zero impact on lead/support pages
- Classification adds ~200-400ms to response time
- Follow-up questions come from actual content, not templates
- `buying_signal: true` triggers more direct response style

---

## ✅ SPA Navigation Pill Flicker Fix (2026-01-26)

Widget pill no longer disappears/reappears during SPA navigation (e.g., PN online course pages using wildcards or group_id). Previously, `widget.js` hid the iframe and reloaded `iframe.src` on every URL change, causing a ~500-1000ms gap. Now it sends a `postMessage('easyask:urlchange')` to the existing iframe — React stays mounted, pill stays visible, config re-checks in the background.

**Files modified**: `public/widget.js`, `src/app/widget/page.tsx`, `src/components/widget/VoiceWidget.tsx`

**Still needed for full-page navigation (non-SPA)**: The iframe still loads fresh on hard navigations. To eliminate the pill entrance animation on every page load, we'd need to persist widget state (e.g., via `localStorage` or a cookie flag) so `widget.js` can show the iframe immediately instead of waiting for the API round-trip.

---

## ✅ Grounding Validation & Status Indicator (2026-01-29)

Two-layer defense against Gemini hallucinations, plus admin visibility into grounding status.

### Layer 1: System Prompt Guardrails (`src/app/api/chat/route.ts`)
- AI MUST ONLY use information from file search stored content
- NEVER use training data or general knowledge about the company/product
- If file search returns nothing relevant, say so — don't guess

### Layer 2: Runtime Grounding Check (`src/lib/gemini-file-search.ts`)
- After every response, checks `groundingMetadata.groundingChunks` from Gemini
- If `groundingChunks.length === 0` → response came from Gemini's own knowledge, not stored content
- Replaces ungrounded responses with fallback message
- Returns `grounded: boolean` in the result type

### Admin Grounding Badge
- Added `grounded` boolean column to `conversation_messages` table (nullable, NULL for user messages and pre-existing rows)
- `chat/route.ts` writes `grounded` value on every assistant message
- Admin conversation view shows a badge per assistant message:
  - Green `✓ Grounded` — answer came from stored content
  - Amber `⚠ Fallback` — answer was replaced with fallback
  - No badge for older messages (NULL)

### Files Modified
- `src/lib/gemini-file-search.ts` — grounding chunk check, fallback replacement, `grounded` return field
- `src/app/api/chat/route.ts` — system prompt rules, passes `grounded` to tracking
- `src/components/admin/types.ts` — `grounded` field on `ConversationMessage`
- `src/components/admin/ConversationMessageView.tsx` — grounding badge UI

### Database Migration
```sql
ALTER TABLE conversation_messages ADD COLUMN grounded BOOLEAN;
```

---

## ✅ Visitor Tracking - Phase 1 (2026-01-29)

Persistent visitor identity via first-party cookie (`easyask_vid`). Multiple chat sessions are now linked to the same visitor.

- `visitors` table with `visitor_id`, `organization_id`, `first_seen_at`, `last_seen_at`, `total_conversations`, `email`
- `conversation_sessions.visitor_id` FK links each session to a visitor
- Cookie: UUID, 2-year expiry, root domain (`.precisionnutrition.com`), SameSite=Lax
- Flow: `widget.js` sets cookie → passes `vid` to iframe → threaded through widget page → useChat → `/api/chat` → upserts visitor on new session creation
- Atomic `total_conversations` increment via Postgres function
- Multi-part TLD support (`.co.uk`, `.com.au`, etc.)

**Phase 2 (purchase attribution) and Phase 3** are planned in the Claude conversation transcript: `~/.claude/projects/-Users-lancejones-projects-conversion-help/57560f38-2978-471d-93cf-53eb111702ab.jsonl`

---

## ✅ Social Message Rescue for Grounding Fallback (2026-01-30)

When the grounding gate finds 0 chunks (no file search results), a fast Gemini classification call now checks if the user's message is social/conversational ("thank you", "hello", "got it") before replacing with fallback. Social messages return the AI's natural response; content questions still get the fallback.

- Added `isSocialMessage()` in `src/lib/gemini-file-search.ts` — Gemini 2.5 Flash REST call, JSON mode, `thinkingBudget: 0`
- Modified grounding gate: `!hasChunks` → classify → rescue or fallback
- Test: `tests/social-message-rescue.test.ts` (35 tests — classification accuracy + end-to-end gate behavior)
- Also fixed test runner: project uses **vitest**, not jest (`npx vitest run`)

---

## ✅ Conversation Sharing (2026-02-01)

Public share links for admin conversations. Share button on each conversation generates a unique token, copies the public URL to clipboard, and shows a brief confirmation tooltip.

- `POST /api/admin/conversations/[session_id]/share` — generates `share_token` (UUID), stores in `conversation_sessions`
- `GET /api/share/[token]` — public API returns session + messages (no auth required)
- `/share/[token]` — public read-only conversation view
- Share button with clipboard copy + 2s "Link copied!" tooltip
- `share_token` column added to `conversation_sessions` table
- Extracted `calculateDuration` helper to `src/lib/conversation-utils.ts`

**Files**: `src/app/api/admin/conversations/[session_id]/share/route.ts`, `src/app/api/share/[token]/route.ts`, `src/app/share/[token]/page.tsx`, `src/components/admin/ConversationSessionItem.tsx`, `src/lib/conversation-utils.ts`

---

## ✅ Quick Action Buttons by Intent (2026-02-02)

Replaced hardcoded quick action buttons with smart defaults based on `page_goal`. Different button sets appear depending on whether the page is configured for sales, lead gen, or education/support.

### Button Sets by Page Goal

**SALES** (`page_goal = 'sell'`):
| Button | Type | Purpose |
|--------|------|---------|
| Pros & Cons | Zero-input | Honest trade-off analysis from indexed content |
| Compare | Input | Side-by-side comparison using pasted competitor info |
| How Does It Work? | Zero-input | Step-by-step process/mechanism explanation |
| Show Me Proof | Zero-input | Surfaces case studies, testimonials, results |

**LEAD GEN** (`page_goal = 'lead'`):
| Button | Type | Purpose |
|--------|------|---------|
| TL;DR | Zero-input | Ultra-concise 2-3 sentence summary |
| Why Should I Care? | Zero-input | Personal relevance and impact framing |
| What Do I Get? | Zero-input | Deliverables/features/outcomes breakdown |
| Quick Facts | Zero-input | Price, timeline, requirements in bullets |

**EDUCATION** (`page_goal = 'support'`):
| Button | Type | Purpose |
|--------|------|---------|
| Explain Simply | Input | Rewrite at simpler reading level |
| Give an Example | Zero-input | Abstract → concrete real-world example |
| Define Terms | Input | Extract and define jargon |
| Translate | Input | Language dropdown (existing behavior) |

**FALLBACK** (no `page_goal`): Explain Simply, Summarize, Define Terms, Translate (current behavior preserved)

### Implementation Details

- **Zero-input buttons**: Always enabled, send canned prompt directly (no user text required)
- **Input-required buttons**: Disabled when input is empty, prepend prompt to user text
- **Translate dropdown**: Only renders for goals that include translate action (support + fallback)
- **Content-grounded prompts**: All prompts include "the content provided" / "from the content provided" phrasing to ensure Gemini File Search retrieves from indexed documents rather than hallucinating

### Data Flow

`GET /api/widget-pages` → returns `page_goal` → `VoiceWidget` → `WidgetModal` → `ChatInterface` → `getQuickActionsForGoal(pageGoal)` → dynamic button rendering

**Files**:
- `src/lib/quick-actions.ts` — **NEW**: types, presets, `getQuickActionsForGoal()` getter
- `src/app/api/widget-pages/route.ts` — added `page_goal` to SELECT and response
- `src/components/widget/VoiceWidget.tsx` — threads `pageGoal` state from API
- `src/components/widget/WidgetModal.tsx` — passes `pageGoal` prop through
- `src/components/widget/ChatInterface.tsx` — dynamic actions, zero-input handling

### Disabled Actions Config (2026-02-03)

Added global config to disable specific buttons per goal without removing code. The Compare button for Sell pages is currently disabled because it can't be grounded — competitor info isn't in indexed content, causing fallback responses.

**Config location**: `DISABLED_ACTIONS` object in `src/lib/quick-actions.ts`

```typescript
const DISABLED_ACTIONS: Partial<Record<NonNullable<PageGoal>, string[]>> = {
  sell: ['compare'], // Compare disabled until grounding bypass is implemented
}
```

**To re-enable Compare**: Remove `'compare'` from the `sell` array.

**Future**: If we implement a grounding bypass for Compare (e.g., two-call approach where EasyAsk info is grounded but comparison synthesis is unshackled), re-enable the button.

---

## ✅ Email Allowlist Gate for Approved Signups (2026-02-04)

Replaced hard signup block with an email allowlist. Approved users sign up via Google OAuth → onboarding flow (org creation, File Search store, user record). Unapproved users still see "Account not found."

### How It Works
1. User clicks "Login with Google" on `/login`
2. OAuth callback checks `public.users` — if existing user, redirect to `/admin`
3. If no user record, check `early_access_signups` for email with `approved = true`
4. If approved → redirect to `/onboarding` (creates everything automatically)
5. If not approved → reject with error message

### Approval Workflow
```sql
-- Approve someone already on waitlist:
UPDATE early_access_signups SET approved = true WHERE email = 'person@example.com';

-- Pre-approve someone not on waitlist yet:
INSERT INTO early_access_signups (email, approved) VALUES ('person@example.com', true);
```

### Database Change
```sql
ALTER TABLE early_access_signups ADD COLUMN approved BOOLEAN DEFAULT false;
```

### Files Modified
- `src/app/auth/callback/route.ts` — allowlist check before rejecting new OAuth users
- `src/components/LandingNav.tsx` — added Login link to desktop + mobile logged-out nav

### Notes
- Existing users unaffected — they already have `public.users` records
- Login page unchanged — already has Google OAuth button
- Onboarding flow unchanged — already handles full setup
- Email comparison is case-insensitive (lowercased before lookup)

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
- `src/app/api/chat/route.ts` - Chat conversation handler
- `src/app/api/admin/scrape/route.ts` - Jina AI scraping
- `src/app/api/admin/upload-to-file-search/route.ts` - Unified upload handler
- `src/lib/gemini-file-search.ts` - File Search queries with conversation history
- `src/components/widget/ChatInterface.tsx` - Widget chat UI
- `src/hooks/useChat.ts` - Chat state management

### Documentation
- `docs/MINDSET.md` - Architecture principles (SLC: Simple, Lovable, Complete)
- `CLAUDE.md` - Project context and value proposition
- `docs/MULTI_USER_ORG_MIGRATION.md` - Schema migration details
