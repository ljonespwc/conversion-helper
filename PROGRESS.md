# Development Progress Tracker

**Last Updated**: 2025-11-15
**Current Phase**: Production Ready - Optimized Performance + Analytics
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

**Remaining:**

4. ⏳ **Conversation History Display**
   - Show previous Q&A pairs in the widget
   - Allow users to scroll back through conversation
   - Clear visual distinction between user and assistant messages

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
