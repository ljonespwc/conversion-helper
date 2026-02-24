# Chat of the Day — Screenshot Generator Tool Plan

**Purpose:** An internal page at `/admin/chat-mockup` (auth-protected, not public) that lets Lance paste in a Chat of the Day script and renders it inside the real EasyAsk widget UI — ready for screenshot.

---

## Why Build This

Taking screenshots of the real widget with fake conversations today would require:
1. Manually typing each message into a live widget
2. Waiting for AI responses (which won't match the scripted content)
3. Trying to crop/edit screenshots after the fact

This tool skips all of that. Paste a script, see it rendered in the actual widget chrome, screenshot it. Done.

---

## The Tool in One Sentence

A single page that renders the real `ChatInterface` + `WidgetModal` UI with scripted messages (no API calls, no AI, no session tracking) — plus the context header and "What the AI really wanted to say" overlay — ready for screenshot capture.

---

## Route & Access

- **URL:** `/admin/chat-mockup`
- **Auth:** Same middleware as all `/admin/*` pages — login required
- **Not linked from admin nav** — accessed by URL only (internal tool, not a feature)

---

## UI Layout

The page has two panels side by side (desktop) or stacked (mobile):

### Left Panel: Script Editor

A form with fields that map 1:1 to the Chat of the Day format:

| Field | Type | Example |
|-------|------|---------|
| Business name | text input | "CloudNine Mattress Co." |
| Page context | text input | "Product page — The CloudNine Pro King" |
| Day & time | text input | "Tuesday, 2:47 AM" |
| Archetype tag | text input (optional) | "The 3 AM Shopper" |
| Setup line | text input | "A visitor has been on the mattress page for 22 minutes at nearly 3 AM." |
| Messages | repeating group (see below) | |
| "What AI wanted to say" | text input (optional) | "You're literally proving the business case..." |
| Tagline | text input | "EasyAsk: They're browsing at 2 AM..." |

**Messages repeating group:** Each message has:
- Role toggle: `visitor` or `easyask`
- Content: textarea (supports markdown for the AI messages)
- Add/remove buttons to create 1-6 messages (enough for 3 Q&A pairs)

A "Load Example" dropdown at the top pre-fills the form from the 25 examples in `CHAT_OF_THE_DAY_EXAMPLES.md` (hardcoded as a JSON array in a constants file). Pick one, fields populate, tweak as needed.

### Right Panel: Live Preview

The preview renders in real-time as you type. It has two layers:

#### Layer 1: Context Card (above the widget)
A styled card showing:
- Business name + page context
- Day & time
- Archetype tag (if provided)
- Setup line in italics

This card uses a clean, neutral design that looks good in screenshots — not part of the widget itself, but part of the social media post visual.

#### Layer 2: Widget Mockup
The real `WidgetModal` shell (orange gradient header, close button, border) containing the scripted messages rendered as `ChatBubble` components. This reuses the actual widget components but with two key differences:

1. **No `useChat` hook.** Messages come from the form state, not from an API.
2. **No interactivity.** No input field, no quick action buttons, no escalation form, no typing indicator. Just the header + message bubbles + footer (branding line).

The header shows the business name (where it normally shows org name + "Answers").

#### Layer 3: Footer Overlay (below the widget)
- "What the AI really wanted to say" in italics with a subtle background
- Tagline in bold

The full stack (context card + widget + footer) is wrapped in a single `div` with a ref — this is the screenshot target.

---

## Screenshot Capture

Two options, implement whichever is simpler:

### Option A: Manual screenshot (MVP)
The preview panel is designed to look screenshot-ready at standard social media dimensions. Add a "Copy to clipboard" button that uses the `html2canvas` library (or similar) to capture the preview div as a PNG and copy it to clipboard. One click, paste into Figma/Twitter/wherever.

### Option B: Just make it screenshot-friendly
Skip the library entirely. Size the preview panel to standard dimensions (1080x1350 for Instagram/LinkedIn, 1200x675 for Twitter) with a toggle between formats. The user takes a native screenshot (Cmd+Shift+4 on Mac) of the panel. The panel has a clean white/light background and no surrounding UI clutter.

**Recommendation: Option A.** `html2canvas` is one dependency, well-maintained, and saves time over manual cropping every day.

---

## Implementation Plan

### File Structure

```
src/app/admin/chat-mockup/
  page.tsx              — Main page component (form + preview)

src/lib/
  chat-mockup-data.ts   — The 25 examples as a typed JSON array

src/components/admin/
  ChatMockupPreview.tsx  — The preview renderer (context card + widget shell + footer)
```

### Step-by-step

**Step 1: Create the example data file**
- Convert the 25 examples from the markdown doc into a typed TypeScript array in `src/lib/chat-mockup-data.ts`
- Type: `{ id, business, page, time, archetype?, setup, messages: { role, content }[], innerMonologue?, tagline }`

**Step 2: Build the preview component**
- `ChatMockupPreview.tsx` receives the script data as props
- Renders: context card, then the WidgetModal header (reuse the gradient + title bar), then ChatBubble components for each message, then the branding footer, then the inner monologue + tagline
- ChatBubble is imported directly from ChatInterface (it's currently defined inside that file — may need to extract it or just duplicate the markup/styles since it's pure UI)
- No hooks, no state, no API — pure render from props
- Wraps everything in a ref div for screenshot capture

**Step 3: Build the page**
- Left panel: form with controlled inputs + the repeating message group
- Right panel: `ChatMockupPreview` receiving form state as props
- "Load Example" dropdown populated from `chat-mockup-data.ts`
- Dimension toggle (Twitter 1200x675 vs. LinkedIn/Instagram 1080x1350)
- "Copy as Image" button using `html2canvas`

**Step 4: Install html2canvas**
- `npm install html2canvas` (single dependency, ~40KB)
- Wire up the capture button: `html2canvas(previewRef.current)` → `canvas.toBlob()` → `navigator.clipboard.write()`

### What We Reuse vs. Build New

| Component | Reuse or New |
|-----------|-------------|
| WidgetModal header (gradient bar, title, close button) | Reuse markup/styles (copy the JSX, not the component — we don't want the close handler, animations, or props) |
| ChatBubble (message styling, markdown rendering) | Reuse directly if extracted, or copy the JSX + styles |
| ReactMarkdown + remarkGfm + markdownComponents | Reuse directly (already in ChatInterface) |
| Form / editor panel | New |
| Context card | New |
| Footer overlay (inner monologue + tagline) | New |
| Screenshot capture | New (html2canvas) |

### What We Explicitly Skip

- No `useChat` hook, no API calls, no session tracking
- No PostHog tracking
- No typing indicator, no quick actions, no escalation form
- No input field in the widget preview
- No animations (static render for clean screenshots)
- No rating thumbs
- The preview is read-only — a visual renderer, not an interactive widget

---

## Dependency Impact

- **1 new npm package:** `html2canvas` (~40KB, well-maintained, MIT license)
- **0 new API routes**
- **0 database changes**
- **3 new files**, all in existing directories
- Auth-protected behind existing middleware — no new security surface

---

## Future Nice-to-Haves (Not in V1)

- **Batch export:** Load all 25 examples and export all screenshots at once
- **Custom background colors/gradients** behind the widget for different social channels
- **Direct Twitter/LinkedIn image sizing presets** with safe zones marked
- **Dark mode variant** of the widget for visual variety
- **Import from markdown:** Paste raw markdown from the examples doc and auto-parse into form fields
