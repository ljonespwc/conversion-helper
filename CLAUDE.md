# Conversion Helper - Voice Assistant Project

## Project Overview
Building a voice-enabled AI assistant widget that helps visitors find answers to frequently asked questions through natural conversation. The widget appears as a small button on the page that opens a modal with voice interaction capabilities.

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

---

## EasyAsk: Value Proposition & Messaging Framework

### Core Value Proposition

**"Turn browsing into buying. Answer every question, close more sales, with AI that knows your product."**

EasyAsk replaces static content with intelligent conversation - meeting prospects exactly where they are in the buying journey, answering objections in real-time, and capturing intent before they leave.

---

### Primary Features & Benefits

#### 1. **Voice + Text Conversation**
**Feature:** Natural voice interaction with real-time text streaming
**Benefit:** Visitors choose how they engage - speak naturally or read along as the AI responds. Lower friction = higher engagement.

*"Talk to your website like you'd talk to sales."*

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
✓ Voice-first interface makes complex info digestible
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
✓ Voice + text makes support conversational, not transactional
✓ Upload support docs, policies, troubleshooting guides - AI answers from your knowledge base
✓ Can't answer? Captures email + question, escalates to support automatically
✓ Feedback ratings show where documentation needs improvement

**Outcome:** Fewer support tickets. Happier customers. Data on what actually confuses people.

---

### Key Differentiators

1. **Voice-first, not chat-first** → Lower barrier to engagement
2. **Page-specific filtering** → Contextually relevant, not generic
3. **Built for conversion** → Purchase intent + satisfaction scoring built-in
4. **Smart escalation** → Email capture when AI can't answer (no leads lost)
5. **Your content, not hallucinations** → Grounded in YOUR docs, pages, and knowledge

---

### Tagline Options

- **"Turn browsing into buying."**
- **"Every question answered. Every lead captured."**
- **"Your website's voice. Your sales team's best closer."**
- **"AI that sells while you sleep."**

---

### Core Value Drivers (from Lance)

These are the fundamental reasons why businesses choose EasyAsk, as articulated by the founder:

1. **People DON'T read**
   - Especially helpful for long sales pages visited on mobile devices
   - Voice conversation makes dense information digestible
   - Visitors can absorb complex details without scrolling through walls of text

2. **Real-time objection handling**
   - Strike while the iron's hot
   - Answering in real-time keeps lead/purchase momentum
   - Questions answered immediately = fewer drop-offs

3. **Capture lead before they bounce**
   - Email escalation option ensures no lead is lost
   - If AI can't answer → captures email + question → routes to sales/support
   - Convert "maybe later" into actionable leads

4. **Voice-first engagement**
   - Much lower friction than typing
   - Keeps visitors on-site longer
   - More natural than chatbots
   - Accessibility advantage for mobile users

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

---

## Monitoring Production Logs

When the user asks you to review Vercel logs or monitor production traffic, follow this process:

### Start Background Log Monitoring

```bash
# Create logs directory if it doesn't exist
mkdir -p /Users/lancejones/projects/conversion-help/logs

# Start vercel logs in background, writing to timestamped file
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
vercel logs https://easyask.io > /Users/lancejones/projects/conversion-help/logs/runtime-${TIMESTAMP}.log 2>&1
```

**Run this command with `run_in_background: true`** - it will continuously append new logs to the file.

### Review Logs

```bash
# View the most recent log file
cat /Users/lancejones/projects/conversion-help/logs/runtime-*.log | tail -100

# Search for specific patterns
grep "system:" /Users/lancejones/projects/conversion-help/logs/runtime-*.log
grep "ERROR\|WARN" /Users/lancejones/projects/conversion-help/logs/runtime-*.log

# Watch logs in real-time
tail -f /Users/lancejones/projects/conversion-help/logs/runtime-*.log
```

### Stop Log Monitoring

```bash
# Find and kill the vercel logs process
pkill -f "vercel logs"

# Or use the background shell ID if known
# KillShell tool with the shell_id
```

### Important Notes

- **Vercel CLI logs are LIVE-TAIL only** - they only show logs from the moment you start the command forward
- **No historical logs via CLI** - use Vercel Dashboard for past logs
- **Background process runs until killed** - remember to stop it when done monitoring
- **Log files are timestamped** - each monitoring session creates a new file
- **Add `logs/` to `.gitignore`** - these files can get large and shouldn't be committed

### When to Use This

- Before user starts testing a new feature (so you capture all logs)
- When debugging production issues
- When analyzing conversation flow or system prompt behavior
- When user asks "check the logs" or "what do the logs show"

---
