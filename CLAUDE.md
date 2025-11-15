# Conversion Helper - Voice Assistant Project

## Project Overview
Building a voice-enabled AI assistant widget that helps visitors find answers to frequently asked questions through natural conversation. The widget appears as a small button on the page that opens a modal with voice interaction capabilities.

## Supabase Configuration
**Project ID**: `fwimhxkkszdaogugslar` (conversionhelper project)
Always use this project_id when interacting with Supabase MCP tools.

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

## Experiment Workflow (For Claude to Execute)

When the user says "let's run an experiment" or "let's try this," follow this process:

### 1. Create Experiment Branch
```bash
# Create and switch to experiment branch
git checkout -b experiment/descriptive-name

# Example names:
# experiment/two-step-generation
# experiment/flash-lite-cleanup
# experiment/simplified-prompt
```

### 2. Make Changes
- Implement the experiment code
- Commit with clear message:
```bash
git add .
git commit -m "experiment: brief description of what we're testing"
```

### 3. Deploy to Vercel Preview
```bash
# Push branch (Vercel auto-deploys preview)
git push -u origin experiment/descriptive-name

# Get preview URL
vercel ls
# Look for deployment with branch name, URL format:
# https://conversion-help-git-experiment-descriptive-name-username.vercel.app
```

**Tell the user:**
- The preview URL
- What to test
- That it uses production Supabase database

### 4. After Testing - Success Path
If experiment works and user wants to keep it:

```bash
# Switch to main
git checkout main

# Merge experiment
git merge experiment/descriptive-name

# Push to production
git push origin main

# Cleanup: delete experiment branch
git branch -d experiment/descriptive-name
git push origin --delete experiment/descriptive-name
```

### 5. After Testing - Abandon Path
If experiment fails or user doesn't want it:

```bash
# Switch back to main (discards experiment)
git checkout main

# Force delete experiment branch
git branch -D experiment/descriptive-name
git push origin --delete experiment/descriptive-name
```

**No revert needed** - main branch stays clean!

### 6. Database Cleanup (If Needed)
Preview deployments use **production Supabase** (`fwimhxkkszdaogugslar`).

If experiment created test data:
```bash
# Use MCP to clear test conversations
mcp__supabase-conversionhelper__execute_sql:
DELETE FROM conversation_messages WHERE session_id LIKE 'test-%'
```

### Important Notes:
- **Always create a branch** for experiments (never commit directly to main)
- **Preview URLs** are production-quality, just different domain
- **Database is shared** with production (be careful with data changes)
- **Vercel auto-deploys** every push to any branch
- **Main branch = production** - only merge when experiment is proven

### Quick Reference Commands:
```bash
# Current branch
git branch

# All branches (local + remote)
git branch -a

# Switch branches
git checkout branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# View Vercel deployments
vercel ls

# View Vercel logs for specific deployment
vercel logs [deployment-url]
```

