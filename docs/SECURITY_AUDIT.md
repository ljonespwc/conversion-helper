# Security Audit — EasyAsk

**Date**: January 2025
**Scope**: Full codebase review before B2B launch

---

## CRITICAL — Fix Before Selling

### 1. `/api/page-assistant` is wide open
- **File**: `src/app/api/page-assistant/route.ts`
- No auth, no API key, no rate limit
- Anyone can call it and burn Gemini credits
- `/api/chat` already does this right (key validation + rate limiting)
- **Fix**: Delete if unused. If needed, add API key validation matching `/api/chat`.

### 2. `/api/track` accepts anything from anyone
- **File**: `src/app/api/track/route.ts`
- Uses service role key, `CORS: *`, zero authentication
- Anyone can insert fake sessions and messages into any org's data
- Analytics become worthless if someone spams it
- **Fix**: Require publishable API key (same pattern as `/api/chat`). Validate session belongs to org.

### 3. `/api/early-access` has no rate limiting
- **File**: `src/app/api/early-access/route.ts`
- Public endpoint that sends emails via Resend
- Can be used as a spam cannon to any email address
- **Fix**: Add rate limiting (same Upstash pattern as `/api/chat`). 3 per IP per hour is plenty.

---

## HIGH — Fix Soon

### 4. `/api/resend-webhook` has no signature verification
- **File**: `src/app/api/resend-webhook/route.ts`
- Anyone can POST fake webhook events
- Forwards unvalidated HTML content to hardcoded Gmail
- **Fix**: Verify `svix-signature` header. Resend documents this: https://resend.com/docs/dashboard/webhooks/verify-webhooks

### 5. Gemini API key in a URL
- **File**: `src/app/api/admin/indexed-pages/route.ts` (line 62)
- `&key=${process.env.GEMINI_API_KEY}` in a fetch URL
- API keys in URLs leak through logs, monitoring, error reports
- **Fix**: Move to `x-goog-api-key` header or `Authorization` header.

### 6. RBAC exists in schema but is never enforced
- `users` table has a `role` column (`owner`, `admin`, `editor`, `analyst`)
- No API route checks it — every org member has full admin access
- **Fix**: Not urgent for single-user early customers. Add role checks to destructive operations before selling to larger orgs.

---

## MEDIUM — Worth Knowing

### 7. `/api/conversations/analyze-escalation` auth is decorative
- **File**: `src/app/api/conversations/analyze-escalation/route.ts`
- `ANALYSIS_SECRET` header check logs a warning but lets the request through anyway
- Default secret is hardcoded `'internal-only'`
- **Fix**: Either enforce the check or remove the pretend-auth.

### 8. Widget iframe accepts messages from any origin
- **File**: `src/app/widget/page.tsx` (line 24-34)
- `widget.js` (parent side) validates origins correctly
- But the iframe page accepts `postMessage` from ANY origin — no `e.origin` check
- An attacker embedding the widget could send fake `easyask:urlchange` messages
- **Fix**: Check `e.origin` against the expected parent origin.

### 9. Rate limiting fails open
- **File**: `src/app/api/chat/route.ts` (line 263-265)
- If Redis is down, rate limiting is bypassed and the request goes through
- Reasonable availability tradeoff, just know it exists

### 10. Prompt injection
- User messages go straight to Gemini with no sanitization
- RAG architecture (File Search grounding) provides natural protection — AI mostly sticks to stored content
- Worst case: leaking the system prompt or getting off-script answers
- The AI can only access the customer's own content, so blast radius is limited
- **Not worth overengineering** — accept this as inherent to LLM apps, monitor for abuse

---

## What's Actually Solid

- **XSS**: No `dangerouslySetInnerHTML` anywhere. ReactMarkdown used safely. User messages rendered as plain text.
- **Admin routes**: All consistently authenticate + scope by `organization_id`
- **File uploads**: Extension whitelist (`.txt`/`.md` only), binary detection, size limits, filename sanitization
- **Publishable keys**: 192-bit entropy, proper format validation
- **Scrape endpoint**: SSRF protection (blocks private IPs, localhost, cloud metadata `169.254.169.254`)
- **Client secrets**: No server secrets leak through `NEXT_PUBLIC_` variables
- **Widget CORS**: `widget.js` has explicit origin allowlist

---

## RLS Note

Every API route uses `SUPABASE_SERVICE_ROLE_KEY`, which bypasses all RLS policies. Tenant isolation depends on application code adding `.eq('organization_id', ...)` to every query. The admin routes do this consistently.

The RLS policies in migrations are well-written but effectively never run. Not something to refactor now — just be aware that every new route needs an org filter and there's no safety net if you miss one.

---

## Status

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | `/api/page-assistant` open | CRITICAL | DONE — deleted (dead code) |
| 2 | `/api/track` open | CRITICAL | DONE — deleted (dead code, zero callers) |
| 3 | `/api/early-access` no rate limit | CRITICAL | DONE — added 3/IP/hour rate limit |
| 4 | Resend webhook unverified | HIGH | TODO |
| 5 | Gemini key in URL | HIGH | TODO |
| 6 | RBAC not enforced | HIGH | TODO (before larger orgs) |
| 7 | analyze-escalation auth decorative | MEDIUM | TODO |
| 8 | Widget iframe origin check | MEDIUM | TODO |
| 9 | Rate limit fail-open | MEDIUM | Accepted |
| 10 | Prompt injection | MEDIUM | Accepted |
