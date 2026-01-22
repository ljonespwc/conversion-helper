# Landing Page Voice-to-Text Audit

**Date:** 2026-01-22
**Purpose:** Identify all voice-related copy and images that need updating now that EasyAsk is text chat only.

---

## HERO SECTION (`src/app/page.tsx`)

| Location | Current (Voice) | Suggested (Text Chat) |
|----------|-----------------|----------------------|
| Line 285 H1 | "Give your site the persuasive power of voice." | "Give your site the power of conversation." |
| Line 299-300 image alt | "EasyAsk voice assistant widget speaking an answer with sound waves emanating" | **Needs new image** - chat widget mockup |
| Line 305-306 caption | "Your site speaks now. Visitors love it." | "Your site answers now. Visitors love it." |
| **IMAGE** | `/images/hero.png` | **Needs replacement** - likely shows sound waves |

---

## PROBLEM SECTION

| Location | Current | Suggested |
|----------|---------|-----------|
| Line 333 | "What if every visitor could just *ask*—**out loud**—and get an instant, accurate answer?" | "What if every visitor could just *ask*—and get an instant, accurate answer?" |

---

## PRODUCT SECTION

| Location | Current | Suggested |
|----------|---------|-----------|
| Line 347 heading | "EasyAsk gives your site a voice." | "EasyAsk turns your site into a conversation." |

---

## DIFFERENTIATOR #1 (Lines 51-66) - ENTIRE SECTION NEEDS REWRITE

This entire differentiator is voice-specific and needs to be replaced with a text-chat benefit.

| Element | Current | Action |
|---------|---------|--------|
| Heading | "Don't make them type. Let them talk." | **REWRITE** |
| Subhead | "Speaking is 3x faster than typing. Lower friction = higher engagement." | **REWRITE** |
| Feature 1 | "Interruptible. Talk to it like a human. Interrupt, redirect, follow up." | **REWRITE** |
| Feature 2 | "Instant. No queue. No 'an agent will be with you shortly.'" | **KEEP** (still valid) |
| Feature 3 | "Mobile-native. Thumbs-free. Because nobody types paragraphs on their phone." | **REWRITE** |
| **IMAGE** | `/images/voice-first.png` | **REMOVE/REPLACE** |
| Image alt | "Voice-first interface with sound waves emanating from a glowing microphone" | **REMOVE** |
| Image caption | "Just talk. It listens." | **REMOVE** |

### Suggested Replacement Concept

**Heading:** "Lower friction than forms. Smarter than search."
**Subhead:** "Visitors ask in natural language. No digging through FAQs or filling out contact forms."
**Features:**
- **Conversational.** Ask follow-ups, get clarifications, have a real back-and-forth.
- **Instant.** No queue. No "an agent will be with you shortly."
- **Mobile-friendly.** Works great on any device. No tiny form fields.

---

## VISITOR_BENEFITS (Line 173)

| Current | Suggested |
|---------|-----------|
| "Voice-first, no typing" | "Instant answers, no searching" |

---

## USE_CASES (Lines 184-209)

| Location | Current | Suggested |
|----------|---------|-----------|
| Use case 1 body (line 189) | "**Voice** makes dense info digestible. Page-specific AI delivers relevant answers and shortens sales cycles." | "**Chat** makes dense info digestible. Page-specific AI delivers relevant answers and shortens sales cycles." |
| Use case 3 body (line 202) | "**Voice** eliminates scroll fatigue. Visitors ask instead of hunt. Higher mobile conversion." | "**Chat** eliminates scroll fatigue. Visitors ask instead of hunt. Higher mobile conversion." |

---

## STEPS (Lines 218-243)

| Location | Current | Suggested |
|----------|---------|-----------|
| Step 4 body (line 241) | "Paste one embed code. Your **voice assistant** is live. Visitors can start asking questions immediately." | "Paste one embed code. Your **chat assistant** is live. Visitors can start asking questions immediately." |

---

## FINAL_CTA_ITEMS (Lines 250-263) - FIRST ITEM NEEDS FULL REWRITE

| Element | Current | Suggested |
|---------|---------|-----------|
| Heading | "Voice-first" | "Instant answers" |
| Body | "Way easier than typing. Especially on mobile. Visitors ask **out loud** and get answers in seconds." | "No scrolling, no searching. Visitors ask and get answers in seconds." |

---

## MANIFESTO SECTION (Lines 491-514)

| Element | Current | Suggested |
|---------|---------|-----------|
| **IMAGE** | `/images/library-as-voice.png` | **Needs replacement** - shows microphone |
| Image alt (line 494) | "A glowing microphone pulling threads of information from a massive library of floating documents" | Update alt for new image |

---

## FAQ ACCORDION (`src/components/FAQAccordion.tsx`)

### FAQ 1 (Lines 9-12)

| Element | Current | Suggested |
|---------|---------|-----------|
| Answer line 11 | "EasyAsk answers instantly—24/7—**using voice or text**." | "EasyAsk answers instantly—24/7." |

### FAQ 3 (Lines 22-26) - FULL REWRITE NEEDED

| Element | Current | Action |
|---------|---------|--------|
| Question | "Will visitors actually **talk** to my website?" | **REWRITE** |
| Answer | "They don't have to talk—they can read the AI's response as text while it speaks. But **voice** removes a lot of friction, especially on mobile. People say more than they type. They ask follow-up questions. They stay engaged longer." | **REWRITE** |

### Suggested Replacement for FAQ 3

**Question:** "Will visitors actually use a chat widget?"

**Answer:**
- "Yes—when it gives them what they want faster than scrolling. Most visitors have one or two specific questions. A chat widget lets them ask directly instead of hunting through your pages."
- "What matters most is that visitors get answers instantly. And you see every question they ask. That's intent data you'd never get from a static page or a form they didn't fill out."

---

## Images Requiring Replacement

| Image Path | Issue | Action |
|------------|-------|--------|
| `/public/images/hero.png` | Likely shows sound waves/voice UI | Replace with chat widget mockup |
| `/public/images/voice-first.png` | Voice-specific imagery (microphone, sound waves) | **REMOVE** (differentiator being replaced) |
| `/public/images/library-as-voice.png` | Shows microphone | Replace with chat/conversation imagery |

---

## Summary

| Category | Count |
|----------|-------|
| Simple text swaps | ~10 |
| Full section rewrites | 3 (Differentiator #1, FAQ #3, Final CTA item #1) |
| Images to replace | 2 (hero.png, library-as-voice.png) |
| Images to remove | 1 (voice-first.png) |

---

## Implementation Order

1. **Copy changes** - Update all simple text swaps first
2. **Section rewrites** - Rewrite Differentiator #1, FAQ #3, Final CTA #1
3. **Images** - Replace/remove voice-related images
4. **QA** - Full read-through to catch any missed references
