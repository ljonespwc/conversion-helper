# Development Progress Tracker

**Last Updated**: 2025-11-20
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

**Required before changes:**
1. Document proposed changes in detail
2. Explain effects on latency, reliability, and user experience
3. Get explicit approval before implementation

**Reason:** These systems are highly sensitive to latency and reliability. Changes can introduce subtle issues that only appear in production under load. System prompts and context passing directly affect response quality and user experience. Widget UI changes affect the core user interaction flow and must be carefully considered for consistency and usability.

---

## 🎯 Current Architecture

### Core Tech Stack
- **Framework**: Next.js 14 App Router + TypeScript
- **Database**: Supabase (Postgres + Storage + Auth)
- **AI**: Gemini File Search (semantic RAG), Gemini 2.5 Flash (voice responses)
- **Voice**: Layercode (WebSocket STT/TTS)
- **Scraping**: Jina AI Reader (r.jina.ai) - FREE, fast markdown conversion
- **Deployment**: Vercel (https://easyask.io)

### Data Flow
1. **Scraping**: URL → Jina AI Reader → Markdown → Supabase Storage
2. **Upload**: Local files → Supabase Storage
3. **Indexing**: Storage → Google File Search (embeddings)
4. **Voice Query**: User → Layercode STT → Gemini + File Search → Layercode TTS

---

## 📚 Google File Search - CRITICAL Patterns

### API Reference
- **Stores API**: https://ai.google.dev/api/file-search/file-search-stores
- **Documents API**: https://ai.google.dev/api/file-search/documents

### ⚠️ SDK Bug: Listing Documents
The `@google/genai` SDK pagination is broken. **Always use REST API**:

```typescript
import https from 'https'

const STORE_NAME = 'fileSearchStores/your-store-id'

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(res.statusCode === 200 ? JSON.parse(data) : reject(new Error(`HTTP ${res.statusCode}`))))
    }).on('error', reject)
  })
}

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

// ❌ FAILS with "Cannot delete non-empty Document"
await ai.fileSearchStores.documents.delete({ name: documentId })
```

### Document IDs vs Operation IDs

```typescript
let operation = await ai.fileSearchStores.uploadToFileSearchStore({
  file, fileSearchStoreName: STORE_NAME, config: { displayName, customMetadata }
})

while (!operation.done) {
  await new Promise(r => setTimeout(r, 3000))
  operation = await ai.operations.get({ operation })
}

// ✅ Get document ID from response
const documentId = operation.response.documentName

// OR convert operation ID
const documentId = operation.name.replace('/upload/operations/', '/documents/')
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

### Storage Strategy (2025-11-12)
**All files stored in Supabase Storage** - scraped pages AND uploaded files use identical architecture:
- **Bucket**: `uploaded-docs` (private, 10MB limit)
- **Path format**: `{userId}/{timestamp}-{filename}.md`
- **Database**: Metadata in `scraping_jobs` and `file_uploads` tables (no markdown in DB)

### Scraping (Jina AI Reader)
- **Endpoint**: `POST /api/admin/scrape`
- **Process**: URL → `https://r.jina.ai/{url}` → Markdown → Storage
- **Performance**: 500-800ms, FREE (20 req/min)
- **Quality**: ReaderLM-v2 model (best-in-class for LLM consumption)

```typescript
// Simple GET request - no API key needed
const response = await fetch(`https://r.jina.ai/${url}`)
const markdown = await response.text()

// Upload to Storage
const storagePath = `${userId}/${Date.now()}-${sanitizedFilename}.md`
await supabaseAdmin.storage.from('uploaded-docs').upload(storagePath, markdown)

// Save metadata to DB
await supabase.from('scraping_jobs').update({
  status: 'scraped', file_path: storagePath, file_size, word_count
}).eq('id', jobId)
```

### File Uploads
- **Component**: `FileUploadSection.tsx` (drag & drop + file picker)
- **Endpoint**: `POST /api/admin/upload-files`
- **Types**: .txt, .md (10MB limit)
- **Flow**: Browser → Multipart → Storage → DB record

### Upload to File Search
- **Endpoint**: `POST /api/admin/upload-to-file-search`
- **Input**: `{ jobIds: [], uploadIds: [] }` - handles both types
- **Process**: Download from Storage → Upload to Gemini → Update `indexed_pages`

```typescript
// Download from Storage
const { data: fileData } = await supabase.storage.from('uploaded-docs').download(file_path)
const markdown = await fileData.text()

// Upload to File Search
const operation = await ai.fileSearchStores.uploadToFileSearchStore({
  file: new File([markdown], `${title}.md`),
  fileSearchStoreName: STORE_NAME,
  config: { displayName: title, customMetadata: [{ key: 'page_url', stringValue: url }] }
})
```

### Environment Variables
- `SUPABASE_SERVICE_ROLE_KEY` - Required for Storage operations (bypasses RLS)
- `GEMINI_API_KEY` - Google File Search access
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client access

---

## 🔐 Authentication (Supabase Auth + SSR)

### Architecture
- **Package**: `@supabase/ssr` for Next.js App Router
- **Methods**: Email/password + Magic link (OTP)
- **Protected**: `/admin/*`, `/test`
- **Public**: `/`, `/widget`, `/login`

### Clients (`src/lib/supabase/`)
- `client.ts` - Browser (Client Components)
- `server.ts` - Server (Route Handlers, Server Components)
- `middleware.ts` - Token refresh helper

### Middleware
- Auto-refreshes tokens on every request
- Redirects unauthenticated → `/login`
- Excludes: static assets, Layercode webhook

### Manual Setup Required
Update Supabase email templates:
1. **Confirm Signup**: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
2. **Magic Link**: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`

---

## 🔧 Key Implementation Details

### Database Schema

**scraping_jobs**
- Dual status tracking: `scraping_status` (pending → scraping → scraped/failed), `indexing_status` (not_indexed → uploading → indexed/failed)
- Stores: url, file_path (Storage), file_size, word_count, user_id, error_message
- RLS: Users only see own jobs
- Retry logic: Failed items show checkbox for re-indexing

**file_uploads**
- Status flow: `ready → uploading → completed/failed`
- Stores: filename, file_path (Storage), file_size, word_count, user_id, error_message
- RLS: Users only see own uploads
- Retry logic: Failed items show checkbox for re-upload

**indexed_pages**
- Tracks documents in File Search
- Fields: page_url (unique), document_id, source_type ('scraped' | 'uploaded'), synced_to_file_search
- Metadata JSONB: Links to source via `scraping_job_id` or `file_upload_id`
- RLS: Users only see own indexed pages

### Admin UI (`/admin/content`)
1. **Scraped Pages**: URL input, job list with status (Ready/Scraping/Failed)
2. **Uploaded Docs**: Drag & drop zone, file list with metadata
3. **Upload to File Search**: Unified button for selected items (both types)
4. **Currently Indexed**: Collapsible list from Google API, shows sync status

### Content Admin Features
- Real-time polling during scraping (useMemo to prevent infinite loops)
- Checkboxes for bulk selection
- Status badges (green=ready, blue=processing, red=failed)
- Card-based UI (consistent design across sections)
- Purple icon badges for both scraped + uploaded

### Deletion (2025-11-11)
- **Cascade deletion** across all systems: Storage → File Search (force: true) → indexed_pages → source table
- **Bulk delete** with checkboxes in all 3 sections (scraped, uploaded, indexed)
- **Confirmation modal** prevents accidental deletion
- **DELETE endpoints**: `/api/admin/scraping-jobs`, `/api/admin/upload-files`, `/api/admin/indexed-pages`

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
NEXT_PUBLIC_APP_URL=https://easyask.io
```

---

## 📋 Development History (Condensed)

### Initial Setup (2025-11-10)
- Forked from hubermanchat, rebranded to conversion-helper
- New Supabase project: `fwimhxkkszdaogugslar`
- Deployed to Vercel with GitHub auto-deploy
- Configured Layercode voice pipeline

### Phase 1: File Search (2025-11-11)
- Integrated Gemini File Search for semantic RAG
- Created admin tools for scraping + indexing
- Built `indexed_pages` registry with sync tracking
- Resolved SDK pagination bugs (moved to REST API)

### Phase 2: Authentication (2025-11-11 Evening)
- Implemented Supabase SSR auth
- Protected admin routes with middleware
- Email/password + magic link flows
- Generic demo mode for public widget

### Phase 3: File Upload (2025-11-12)
- Added drag & drop file upload
- Unified Storage architecture (scraped + uploaded)
- Created `file_uploads` table with RLS
- Integrated with File Search upload workflow

### Phase 4: Scraping Upgrade (2025-11-12)
- Replaced Firecrawl with Jina AI Reader
- 2-4x faster scraping (500ms vs 1-3s)
- FREE tier (no API key needed)
- Better markdown quality (ReaderLM-v2)

### Phase 5: Deletion & Status Refactor (2025-11-11)
- Implemented cascade deletion with confirmation modals
- Separated status tracking: `scraping_status` + `indexing_status` (allows failed upload retry)
- Fixed service role key bug in upload-to-file-search
- Added retry support for failed uploads/indexing
- Clear error messages on successful retry

### Phase 6: Architecture Refactor - Page-Based Model (2025-11-12)
**One-to-One Architecture**: 1 User = 1 Organization = 1 Website = 1 File Search Store
- **Replaced**: Deployment-based multi-tenant model → Simple page-based filtering
- **New Tables**: `users` (org_name, website_url, file_search_store_name), `widget_pages` (page_url, page_title)
- **Removed**: `widget_deployments` table, `deployment_id` from indexed_pages
- **Content Filtering**: Documents tagged with `page_urls` array, queries filter by page URL
- **Signup Flow**: Auto-creates File Search store on registration with org details
- **Widget Pages**: Users add pages where widget should appear (e.g., /pricing, /features)
- **Content Upload**: Select which pages get access to each document (multi-page support)
- **Query System**: `queryPageContent(question, pageUrl)` filters by `page_urls` metadata
- **Test Page**: Select widget page from dropdown to test page-specific responses
- **Migration**: Dropped old tables, wiped data, clean slate for production
- **Result**: Simpler architecture, clearer user model, easier to reason about

---

## 🚀 What's Next (2025-11-14)

### Priority 1: Conversation Tracking Simplification ✅ COMPLETED (2025-11-14)

**Evolution:** Started with complex metadata tracking system, simplified to raw transcript storage.

**Final Implementation:**
1. ✅ **Database schema**
   - `conversation_messages`: Stores complete transcripts with `role`, `message`, `timestamp`
   - `conversation_sessions`: Tracks sessions with `total_questions`, `started_at`, `ended_at`
   - **Removed**: `conversation_turn_metadata` table (no longer needed)
   - **Unused but kept**: `matched` and `category` columns (set to null, avoiding breaking changes)

2. ✅ **Simplified webhook tracking**
   - Session.end saves raw Layercode transcript (user + assistant messages)
   - No complex metadata matching or state management
   - ~100 lines of code removed from webhook handler

3. ✅ **Analytics updates**
   - **Removed**: "Content Match Rate" metric (not meaningful after testing)
   - **Added**: "Avg Session Duration" - shows engagement depth (format: "2m 15s")
   - Removed match percentage badges from conversation summaries
   - Session stats show message counts: "9 Assistant messages • 8 User messages • 125s duration"

**Rationale:** "Matched" tracking proved difficult to measure accurately. Session duration is simpler and more valuable for understanding engagement.

**Files modified:**
- `src/app/api/layercode/webhook/route.ts` (removed metadata storage/matching logic)
- `src/app/api/stats/route.ts` (avg duration calculation)
- `src/app/admin/page.tsx` (updated card and removed badges)
- Migration: `20251114_drop_conversation_turn_metadata.sql`

---

### Priority 1.5: Fix Gemini File Search Context & Prompting ✅ COMPLETED (2025-11-15)

**Issue:** Gemini was frequently asking for clarification on answerable questions ("What's the price?", "Tell me more about that") and ignoring conversation context.

**Root Cause Analysis:**
1. System instructions created in webhook but **never passed to Gemini API**
2. Conversation history stored locally but **only current question sent to Gemini**
3. Gemini API call using plain string instead of structured contents array
4. Missing `systemInstruction` field in API config

**Solution Implemented:**

1. ✅ **Pass full conversation history to Gemini**
   - Created `buildContentsArray()` helper to convert conversation history
   - Properly map roles: user→user, assistant→model, system→systemInstruction
   - Pass entire conversation context in structured `contents` array

2. ✅ **Send system instructions to Gemini API**
   - Extract system prompt from conversation history
   - Pass via `systemInstruction` config parameter
   - Ensures Gemini actually receives and follows the instructions

3. ✅ **Strengthen system prompt**
   - Changed from "helpful assistant" to "sales assistant"
   - Added CRITICAL RULES section with explicit forbiddens:
     - ❌ NEVER ask users to clarify or specify
     - ❌ NEVER say "I need more information" or "Could you please specify"
     - ✅ Always attempt to answer directly
     - ✅ Use conversation context for pronouns like "that", "it"

**Results (Verified in Production):**
- ✅ "What's the price?" → Direct answer with pricing options (no clarification request)
- ✅ "Tell me more about that" → Uses context, knows "that" = previous topic, expands appropriately
- ✅ Multi-turn conversations flow naturally with context retention
- ✅ AI acts confident and assertive instead of overly cautious

**Files modified:**
- `src/lib/gemini-file-search.ts` (added buildContentsArray, updated queryPageContent signature)
- `src/app/api/layercode/webhook/route.ts` (extract and pass system prompt + conversation history)

**⚠️ IMPORTANT:** These changes are now part of the CRITICAL system. Do NOT modify File Search system prompts or conversation history passing without explicit user permission.

---

### Priority 2: Performance Optimization & Bottleneck Analysis ✅ COMPLETED (2025-11-15)

**Issue:** Substantial lag between visitor question and assistant response.

**Solution Implemented:**

1. ✅ **Performance Tracking System**
   - `logTiming()` utility added to webhook and File Search
   - Console logs capture timing at key stages:
     - Message processing (init to search start)
     - Widget page lookup
     - User store lookup
     - File Search total query time
     - LLM generation time
     - Total turn time

2. ✅ **Performance Analytics Dashboard**
   - `/api/stats` endpoint calculates session-level metrics
   - Average session duration (computed from message timestamps)
   - Total conversations, today's count, active sessions
   - Admin dashboard displays real-time analytics with page filtering

3. ✅ **Optimizations Applied**
   - **In-memory cache** (5min TTL) for widget page/user lookups - eliminates redundant DB queries during multi-turn conversations
   - **Gemini config tuning**: temperature: 0.3, maxOutputTokens: 300 for faster, more deterministic responses
   - **DB query optimization**: Only select needed columns (user_id, page_title vs SELECT *)
   - **Conversation context caching**: Store full history in memory to avoid repeated lookups

**Results:**
- File Search queries optimized with metadata filtering (page_urls array)
- DB lookups reduced via caching (cache hit = ~0ms vs ~50-100ms DB query)
- Response length capped at ~225 words (~1.5min voice) for faster TTS

**Files Modified:**
- `src/app/api/layercode/webhook/route.ts` - timing instrumentation, conversation caching
- `src/lib/gemini-file-search.ts` - cache implementation, query optimization, timing logs
- `src/app/api/stats/route.ts` - session duration calculation from message timestamps
- `src/app/admin/page.tsx` - analytics dashboard with page filtering

---

### Priority 3: Widget UI/UX Improvements

**Issue:** User experience during voice interactions needs enhancement.

**Completed Improvements:**

1. ✅ **Text Response Display** (2025-11-16)
   - AI response text displays in frosted glass card with blue/purple gradient
   - Markdown formatting (bold, italic, lists, code blocks) with custom styling
   - Sparkle icon represents AI-generated content (not just speaking)
   - Copy button for easy text sharing
   - Scroll indicator for long responses
   - Text persists through ambient noise (debounced clearing on user speech)
   - File: `src/components/widget/SimplifiedVoiceInterface.tsx`

2. ✅ **Sparkle Burst Animation** (2025-11-16)
   - 8 yellow sparkles radiate from orb when AI answer arrives
   - 0.8s animation creates magical "eureka!" moment
   - Triggers exactly when response data arrives
   - File: `src/components/widget/SimplifiedVoiceInterface.tsx`

3. ✅ **Loading & Wait State Visuals** (2025-11-16)
   - Minimal wait states in practice due to optimized performance
   - Existing pulse animations on orb provide sufficient visual feedback
   - "Listening to you..." / "Speaking..." status text provides clear state indication
   - Further animation not needed - system is fast enough

4. ✅ **Conversation History Display** (2025-11-16)
   - Collapsible conversation view with message count badge
   - Scrollable Q&A history (max 250px height)
   - Clear user/assistant distinction with icons and styling
   - Copy entire conversation with formatted timestamps
   - File: `src/components/widget/SimplifiedVoiceInterface.tsx`

---

### Priority 4: Widget Button Redesign ✅ COMPLETED (2025-11-16)

**Issue:** Original button looked generic (plain blue circle), didn't communicate voice-first capability or value proposition.

**Solution Implemented:**

1. ✅ **Friendly AI Orb Design**
   - Animated sound wave rings (3 pulsing layers)
   - Blue-to-purple gradient with breathing pulse effect
   - Sparkles icon indicates AI assistance
   - Hover/tap expands to pill shape with value proposition text
   - File: `src/components/widget/WidgetButton.tsx`

2. ✅ **Mobile Interaction Pattern**
   - Two-tap flow: First tap expands pill, second tap opens modal
   - Touch device detection prevents accidental opening
   - Auto-collapse after 4 seconds on mobile
   - Proper timeout management with useRef

3. ✅ **Value Proposition Messaging**
   - Static text: "Got questions? Save time and ask!"
   - Subtitle: "🎤 Voice-enabled • Instant answers"
   - Max-width: 340px to prevent text cutoff

**Results:**
- Higher perceived value (animated orb vs static circle)
- Clear voice capability indicator (sound waves + microphone subtitle)
- Mobile-friendly progressive disclosure (see value before committing to open)

---

### Priority 5: Security Validation ✅ COMPLETED (2025-11-16)

**Issue:** File uploads and page scraping lacked validation for MIME type spoofing, SSRF attacks, and resource exhaustion.

**Solution Implemented:**

1. ✅ **File Upload Security** (`src/app/api/admin/upload-files/route.ts`)
   - MIME type validation via `file-type` package (magic number detection)
   - UTF-8 text validation (null byte detection)
   - Batch size limit: 50MB total per request
   - Per-file limit: 10MB individual files
   - Prevents binary files renamed as .txt/.md

2. ✅ **Page Scraping Security** (`src/app/api/admin/scrape/route.ts`)
   - SSRF protection: Blocks private IPs (localhost, 127.x, 192.168.x, 10.x, 172.16-31.x, AWS metadata)
   - Protocol restriction: HTTP/HTTPS only (rejects file://, ftp://, etc.)
   - Request timeout: 30 seconds with AbortController
   - Content size limit: 5MB max for scraped markdown

3. ✅ **UI Updates**
   - FileUploadSection: "Text/Markdown only • 10MB per file • 50MB total per batch"
   - ScrapeForm: "(5MB max, 30s timeout)"

**Results:**
- Prevents file extension spoofing attacks
- Blocks SSRF attempts to internal services
- Resource exhaustion protection (size + timeout limits)
- Clear user-facing validation messages

---

### Priority 6: Email Escalation & AI Analysis ✅ COMPLETED (2025-11-16)

**Issue:** Need to capture leads who don't get satisfactory answers and intelligently route them to human support.

**Solution Implemented:**

1. ✅ **Email Capture UI**
   - Persistent email capture option appears after first AI response
   - Collapsible form with friendly messaging: "Need more help? Get a human response"
   - Success state: "✓ We'll follow up soon!"
   - Works mid-conversation (doesn't require session end)
   - File: `src/components/widget/SimplifiedVoiceInterface.tsx`

2. ✅ **Database Schema**
   - `conversation_sessions`: Added `user_email`, `escalation_timestamp`, `escalation_processed`, `resolved`, `resolved_at`
   - `conversation_messages`: Added `needs_followup`, `followup_reason`
   - Indexes for efficient filtering of unresolved escalations
   - Migrations: `20251116_add_email_escalation.sql`, `20251117_add_escalation_resolved.sql`

3. ✅ **Email Capture API** (`/api/conversations/escalate`)
   - Creates session if doesn't exist (mid-conversation support)
   - Updates existing session with email and timestamp
   - Race condition handling for concurrent submissions
   - Preserves page_url for proper tracking

4. ✅ **AI-Powered Analysis** (`/lib/conversation-analysis.ts`)
   - Uses Gemini 2.5-flash-lite for cost efficiency (~$0.000075 per analysis)
   - Conservative flagging strategy - only marks clear failures
   - JSON response mode for structured output
   - Analyzes: incomplete responses, unhelpful answers, incorrect information
   - Stores results in `needs_followup` and `followup_reason` fields

5. ✅ **Automated Analysis Trigger**
   - Fire-and-forget pattern in webhook (non-blocking)
   - Triggers when conversation ends AND email was submitted
   - 60-second timeout for long conversations
   - Endpoint: `/api/conversations/analyze-escalation`
   - Uses `NEXT_PUBLIC_APP_URL` for reliable production deployment

6. ✅ **Admin Escalations Dashboard** (`/admin/escalations`)
   - Stats cards: Total, Unresolved, Resolved, Flagged Messages
   - Filters: Status (all/unresolved/resolved), Sort (newest/oldest/most flagged), Page URL
   - Expandable conversation view with full transcript
   - Flagged messages highlighted with red badges
   - Actions: Copy email, Copy conversation, Mark as Handled/Reopen
   - Consistent design with other admin pages (Header, navigation)

**Results:**
- ✅ Captures leads before they bounce (even when AI can't fully answer)
- ✅ Intelligent routing: AI flags specific messages that need human followup
- ✅ Support team dashboard for efficient escalation management
- ✅ Manual status tracking (resolved/unresolved) for workflow control
- ✅ Tested in production: Correctly flagged 4 out of 18 messages in test conversation

**Files Created/Modified:**
- `src/app/api/conversations/escalate/route.ts` - Email capture endpoint
- `src/lib/conversation-analysis.ts` - Gemini-powered conversation analyzer
- `src/app/api/conversations/analyze-escalation/route.ts` - Analysis processor
- `src/app/api/layercode/webhook/route.ts` - Added fire-and-forget analysis trigger
- `src/app/api/admin/escalations/route.ts` - Fetch escalations with filters
- `src/app/api/admin/escalations/[session_id]/route.ts` - Update resolved status
- `src/app/admin/escalations/page.tsx` - Admin dashboard UI
- `src/components/Header.tsx` - Added Escalations navigation link
- `src/components/widget/SimplifiedVoiceInterface.tsx` - Email capture UI

---

### Priority 7: Abuse Prevention & Rate Limiting ✅ COMPLETED (2025-11-17)

**Issue:** No protection against API cost abuse - potential $500-2000/day exposure from spam sessions, runaway conversations, and fake webhooks.

**Solution Implemented:**

1. ✅ **IP-Based Rate Limiting** (Upstash Redis)
   - `/api/layercode/authorize`: 5 sessions per IP per hour
   - `/api/layercode/webhook`: 100 requests per IP per hour
   - `/api/conversations/escalate`: 3 email submissions per IP per day
   - `/api/conversations/feedback`: 10 submissions per IP per hour
   - Returns 429 status with rate limit headers when exceeded

2. ✅ **Max Messages Per Session**
   - 50 message limit per conversation (excludes system prompt)
   - Gracefully ends with TTS: "This conversation has reached maximum length..."
   - Prevents runaway conversations from burning API credits

3. ✅ **Session Idle Timeout**
   - 5-minute inactivity timeout in voice hook
   - Tracks user speech, agent responses, and data messages
   - Auto-disconnects to prevent forgotten sessions

4. ✅ **Webhook Signature Verification**
   - HMAC-SHA256 verification using `layercode-signature` header
   - 5-minute timestamp window prevents replay attacks
   - Timing-safe comparison prevents timing attacks
   - Returns 401 for invalid signatures

**Environment Variables Required:**
```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
LAYERCODE_WEBHOOK_SECRET=...  # Optional but recommended
```

**Results:**
- Worst-case cost reduced from $500-2000/day → ~$20-50/day (95% reduction)
- All endpoints protected with appropriate limits
- Webhook verification optional (gracefully degrades if secret not set)

**Files Created:**
- `src/lib/ratelimit.ts` - Rate limit configurations and utilities
- `src/lib/webhook-verification.ts` - Webhook signature verification

**Files Modified:**
- `src/app/api/layercode/authorize/route.ts` - Added rate limiting
- `src/app/api/layercode/webhook/route.ts` - Added rate limiting, message limits, signature verification
- `src/app/api/conversations/escalate/route.ts` - Added rate limiting
- `src/app/api/conversations/feedback/route.ts` - Added rate limiting
- `src/hooks/useSimpleLayercodeVoice.ts` - Added idle timeout with activity tracking

**Future Adjustments:**
- Rate limits configurable in `src/lib/ratelimit.ts` - adjust based on usage patterns
- Message limit (50) can be increased if longer conversations are valuable
- Idle timeout (5 min) can be extended if users commonly pause mid-conversation
- Monitor Upstash Redis usage - free tier includes 10K commands/day

### Priority 8: Multi-User Organization Migration ✅ COMPLETED (2025-11-18)

**Issue:** Application architecture assumed single user per organization, preventing team collaboration and creating security vulnerabilities.

**Solution Implemented:**

**Architecture Change:** Migrated from user-centric to organization-centric data model
- **Before:** All data scoped by `user_id` - one user per organization only
- **After:** All data scoped by `organization_id` - multiple users can belong to same organization

**Key Changes:**
1. ✅ **Database Schema Migration**
   - Moved organization metadata from `users` table to dedicated `organizations` table
   - Added `organization_id` foreign key to all relevant tables
   - Renamed `user_id` columns to `created_by_user_id` (audit trail)
   - Updated all RLS policies to filter by `organization_id`
   - Full details: `docs/MULTI_USER_ORG_MIGRATION.md`

2. ✅ **Security Updates Across Application**
   - Updated 16 admin API endpoints to filter by organization instead of user
   - Fixed escalations endpoint (critical security fix - was leaking cross-org data)
   - Applied service role pattern consistently to bypass RLS circular dependencies
   - Added no-cache headers to prevent stale organization data

3. ✅ **Authentication & Navigation Fixes**
   - Fixed login flow (removed old auth trigger causing constraint violations)
   - Created `/api/admin/user-info` endpoint to safely fetch user organization data
   - Resolved RLS circular dependency issues in client-side queries
   - Fixed navigation header to show user email and proper menu items

4. ✅ **Cache-Busting & State Management**
   - Added timestamp-based cache-busting to widget page queries
   - Implemented React key prop to force widget remount on page changes
   - Reset component state when switching pages to prevent stale data
   - Fixed hydration error in StatsCard component

**Results:**
- ✅ Multiple users can now collaborate within same organization
- ✅ All data properly scoped and secured by organization
- ✅ Zero cross-organization data leakage
- ✅ Clean separation of concerns (users belong to orgs, orgs own data)
- ✅ Ready for team-based workflows and enterprise customers

**Migration Documentation:** See `docs/MULTI_USER_ORG_MIGRATION.md` for complete schema changes and migration steps.

**Files Modified:** 16 API routes, 2 UI components, 1 widget component, 3 database migrations

---

### Priority 9: PostHog Analytics Integration ✅ COMPLETED (2025-11-20)

**Issue:** No visibility into how visitors and admins use the platform. Need analytics to understand engagement, drop-offs, and feature adoption.

**Solution Implemented:**

1. ✅ **PostHog Setup** (US region, session replay enabled)
   - Client-side only tracking
   - Privacy-first: no conversation content tracked, inputs masked in replays
   - Single project for both admin and widget events

2. ✅ **Widget Visitor Tracking**
   - Engagement: widget_opened, conversation_started, widget_closed
   - Interaction: response_copied, conversation_history_viewed, conversation_copied
   - Feedback: feedback_submitted (positive/negative with message count)
   - Escalation: escalation_form_opened, escalation_submitted
   - Anonymous identification by conversation ID

3. ✅ **Admin Team Tracking**
   - Activity: admin_dashboard_viewed, admin_page_filtered, conversation_expanded
   - User identification: Email + user_type='admin'

**Key Events Tracked:**
- Widget engagement funnel: opened → started → feedback/escalation
- Admin analytics: dashboard views, page filtering, conversation reviews
- All events include: page_url, conversation_id, message_count, page_title

**Privacy:**
- ✅ Session replay masks all input fields
- ✅ Conversation text NOT tracked (only metadata)
- ✅ Person profiles only for identified users (admin team)
- ✅ Autocapture disabled (manual events only)

**Results:**
- Can now measure: widget adoption, conversation completion rates, escalation patterns
- Admin feature usage visible (which pages get most attention)
- Session replay for debugging widget UX issues
- Foundation for A/B testing and funnel optimization

**Files Created/Modified:**
- `src/components/PostHogProvider.tsx` - Provider component
- `src/app/layout.tsx` - Wrapped with PostHog
- `src/components/widget/SimplifiedVoiceInterface.tsx` - 8 event types
- `src/components/widget/VoiceWidget.tsx` - Widget open tracking
- `src/app/admin/page.tsx` - 3 admin event types

---

## 🔮 Upcoming Priorities

### Performance: Smart Caching Strategy (When Needed)

**Current State:** No caching across all admin pages - always fresh data
**Works great for:** 1-10 users (current scale)

**When to revisit:**
- Supabase bill increases significantly ($50+/month for queries)
- Admin pages take >1 second to load
- 50+ organizations using the platform
- Database CPU consistently above 50%

**Recommended Implementation Timeline:**

#### Phase 1: Now (1-10 users)
- ✅ Keep current no-cache approach
- Simple, works fine at small scale

#### Phase 2: Growth (10-50 users)
- Add 30-second cache on aggregate stats
- Keep no-cache on user actions
- Monitor Supabase metrics

#### Phase 3: Scale (50-200 users)
- Implement SWR with 10-15s refresh
- Add database-level caching (materialized views)
- Real-time subscriptions for critical updates

#### Phase 4: Enterprise (200+ users)
- Redis/Vercel KV for edge caching
- Separate read replicas for analytics
- Event-driven cache invalidation

**Key Principles:**
- Aggregate stats: 30-60 second cache acceptable
- Recent data: 10-15 second cache
- User actions: Always fresh (no cache)
- Use SWR pattern for automatic background refresh
- Per-user caching only (never share cache across users)

---

## 📖 Reference

### Useful Scripts
- `scripts/inspect-file-search-store.mjs` - View store contents, limits, usage
- `scripts/list-all-docs-rest-api.mjs` - Proper document listing
- `scripts/force-delete-with-sdk.mjs` - Delete documents with force flag

### Key Files
- `src/app/api/admin/scrape/route.ts` - Jina AI scraping
- `src/app/api/admin/upload-to-file-search/route.ts` - Unified upload handler
- `src/app/admin/content/page.tsx` - Main admin UI
- `src/components/admin/*` - ScrapedPagesList, FileUploadSection, FileSearchUpload

### Documentation
- `docs/MINDSET.md` - Architecture principles
- `docs/AI_PROVIDER_SWITCHING.md` - OpenAI vs Gemini switching
- `CLAUDE.md` - Project context for AI assistance
