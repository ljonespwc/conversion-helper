# EasyAsk - Conversational AI Widget

## Project Overview
Building a text-based AI chat widget that helps website visitors find answers through natural conversation. The widget appears as a small button on the page that opens a modal with a chat interface. Answers are grounded in the customer's own content (scraped pages + uploaded files) via Gemini File Search.

**For technical details and project history, see `docs/PROGRESS.md`.**

## Supabase Configuration
**Project ID**: `fwimhxkkszdaogugslar` (conversionhelper project)
Always use this project_id when interacting with Supabase MCP tools.

## Development Workflow

### Division of Responsibilities

**Lance (User) handles:**
- Starting the Next.js dev server (`npm run dev`)
- Deploying code to Vercel (git push, Vercel CLI)
- Manual testing and QA

**Claude (AI Assistant) handles:**
- Running local builds (`npm run build`, `npx tsc`)
- Code generation and modifications
- Database queries and migrations
- Reading logs and debugging

**Important:** Claude should NOT start dev servers or deploy to production. Claude should focus on builds, tests, and code quality checks.

### Code Simplification Workflow

When using the `code-simplifier` skill to work through a list of files:

1. **Never move to the next file without explicit user approval.**
2. **Step 1 — Identify:** Analyze the file for real cleanup opportunities (dead code, deduplication, hoisting pure functions, etc.) without affecting functionality. Present findings to the user.
3. **Step 2 — Apply:** After user approval of which changes to make, apply them using coding agents.
4. **Step 3 — Verify:** Run a local build (`npx tsc --noEmit`) and write high-level tests for the file's pure helper functions to ensure nothing broke.
5. Wait for the user to say "move onto the next" before proceeding.

---

## EasyAsk: Value Proposition & Messaging Framework

### Core Value Proposition

**"Turn browsing into buying. Answer every question, close more sales, with AI that knows your product."**

EasyAsk replaces static content with intelligent conversation - meeting prospects exactly where they are in the buying journey, answering objections in real-time, and capturing intent before they leave.

---

### Primary Features & Benefits

#### 1. **Conversational Chat Interface**
**Feature:** Natural text chat with instant AI responses
**Benefit:** Visitors type questions and get immediate, contextual answers. Lower friction than forms or searching through pages.

*"Get answers instantly, right where you're browsing."*

#### 2. **Page-Specific Intelligence**
**Feature:** Different AI knowledge per page (pricing, features, support, etc.)
**Benefit:** Context-aware responses that match visitor intent. No generic answers - the AI knows what matters on each page.

*"On your pricing page? The AI talks pricing. On features? It demonstrates value. Always relevant."*

#### 3. **Your Content, AI-Powered**
**Feature:** Scrape existing pages OR upload custom documents (sales decks, case studies, technical specs)
**Benefit:** Answers grounded in YOUR information - product details, pricing, policies, objection handlers. Not generic AI, your AI.

*"Feed it your best sales content. It becomes your best salesperson."*

#### 4. **Built to Close Sales**
**Feature:** Intelligent conversation flow designed for conversion
**Benefit:**
- Answers product questions in real-time
- Handles objections before they become blockers
- Captures purchase intent while visitors are engaged
- Asks for likelihood to buy (1-10 rating) at the right moment

*"Don't just inform prospects. Qualify them."*

#### 5. **Lead Capture & Escalation**
**Feature:** Email collection when AI can't fully answer
**Benefit:** Never lose a prospect. If the AI doesn't have the answer, it captures their email and question, then routes to your support or sales team.

*"Didn't get their answer? Got their contact info."*

#### 6. **Conversation Analytics & Feedback**
**Feature:** Track questions, match rates, satisfaction (1-10), and purchase intent
**Benefit:** See exactly what prospects care about, where your content gaps are, and who's ready to buy.

*"Know what they asked, how satisfied they were, and how likely they are to buy - before they even fill out a form."*

#### 7. **Simple Content Management**
**Feature:** Admin dashboard to scrape pages, upload files, assign content to pages
**Benefit:** No coding. No complex setup. Point, click, done.

*"Update your content in minutes, not sprints."*

---

### Positioning by Use Case

#### **For B2B SaaS / Complex Products**
*"Your product takes 10 pages to explain. Your prospects have 2 minutes to understand it."*

**The Problem:** Complex feature sets, multiple pricing tiers, technical requirements. Prospects bounce because they can't find answers fast enough.

**EasyAsk Solution:**
✓ Conversational chat makes complex info digestible
✓ Page-specific AI delivers relevant answers (features page = feature deep-dive, pricing page = pricing details)
✓ Captures purchase intent signals ("How likely are you to buy?") to prioritize hot leads
✓ Routes unanswered questions to sales with email capture

**Outcome:** Shorter sales cycles. Higher demo booking rates. Qualified leads before they even reach out.

---

#### **For High-Consideration Purchases**
*"Answer buyer objections in real-time, right when they're evaluating you vs. competitors."*

**The Problem:** Prospects are comparing 3-5 options. Small questions become deal-breakers when left unanswered.

**EasyAsk Solution:**
✓ Instant answers to "Does this integrate with X?" "What's included in Enterprise tier?"
✓ Conversation-based engagement keeps them on your site longer
✓ Performance feedback ("Rate your experience 1-10") shows you're listening
✓ Purchase intent capture ("How likely are you to buy?") identifies ready-to-close prospects

**Outcome:** Win more competitive deals. Reduce "I need to think about it" objections.

---

#### **For Support / FAQ Replacement**
*"Stop building FAQ pages no one reads. Give them an assistant that actually helps."*

**The Problem:** 87 FAQ entries. Zero engagement. Tickets pile up with the same questions.

**EasyAsk Solution:**
✓ Chat interface makes support conversational, not transactional
✓ Upload support docs, policies, troubleshooting guides - AI answers from your knowledge base
✓ Can't answer? Captures email + question, escalates to support automatically
✓ Feedback ratings show where documentation needs improvement

**Outcome:** Fewer support tickets. Happier customers. Data on what actually confuses people.

---

### Key Differentiators

1. **Instant conversational answers** → Lower barrier than forms, search, or reading docs
2. **Page-specific filtering** → Contextually relevant, not generic
3. **Built for conversion** → Purchase intent + satisfaction scoring built-in
4. **Smart escalation** → Email capture when AI can't answer (no leads lost)
5. **Your content, not hallucinations** → Grounded in YOUR docs, pages, and knowledge

---

### Core Value Drivers

These are the fundamental reasons why businesses choose EasyAsk, as articulated by the founder:

1. **People DON'T read**
   - Especially helpful for long sales pages visited on mobile devices
   - Conversational Q&A makes dense information digestible
   - Visitors can ask specific questions instead of scrolling through walls of text

2. **Real-time objection handling**
   - Strike while the iron's hot
   - Answering in real-time keeps lead/purchase momentum
   - Questions answered immediately = fewer drop-offs

3. **Capture lead before they bounce**
   - Email escalation option ensures no lead is lost
   - If AI can't answer → captures email + question → routes to sales/support
   - Convert "maybe later" into actionable leads

4. **Low-friction chat engagement**
   - Much lower friction than forms or searching docs
   - Keeps visitors on-site longer
   - More natural than FAQ pages or knowledge bases
   - Works seamlessly on mobile

5. **Only our content, not hallucinations**
   - Grounded 100% in our docs, sales decks, policies
   - Upload files or scrape pages
   - No generic AI responses - your information, your voice

6. **Conversation analytics**
   - See what prospects and leads actually care about
   - Identify what we're missing on the pages
   - Content gap analysis built-in

7. **Focus our client care on high-value work**
   - Cut down on "what's the price?"-type support questions
   - Free up human team for complex issues and relationship building
   - Scale support without scaling headcount
