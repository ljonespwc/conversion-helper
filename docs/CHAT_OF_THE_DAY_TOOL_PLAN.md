# Typing... — Screenshot Generator Tool Plan

**Purpose:** An internal page at `/admin/chat-mockup` (auth-protected, not public) that lets Lance paste in a Typing... script and renders it inside the real EasyAsk widget UI — ready for screenshot.

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
- **Org restriction:** EasyAsk org only. On mount, the page calls `/api/admin/user-info` (same pattern as `/test` page) and checks `organization.name === 'EasyAsk'`. If the logged-in user belongs to any other org (PN, 8020 Inc, future customers), the page renders a simple "Not available" message and nothing else. No error details, no hint that the tool exists.
- **Not linked from admin nav** — accessed by URL only (internal tool, not a feature)

---

## UI Layout

The page has two panels side by side (desktop) or stacked (mobile):

### Left Panel: Script Editor

A form with fields that map 1:1 to the Typing... format:

**Series fields:**

| Field | Type | Example |
|-------|------|---------|
| Volume number | auto-incremented (next available) | 14 |
| Series tagline | dropdown (from `cotd_series_taglines` table) | "What people ask when they think no one's watching." |
| Published date | date picker (optional) | 2026-03-15 |

**Content fields:**

| Field | Type | Example |
|-------|------|---------|
| Business name | text input | "Luxury direct-to-consumer mattress brand" |
| Page context | text input | "Product detail page — king-size mattress" |
| Day & time | text input | "Tuesday, 2:47 AM" |
| Archetype tag | text input (optional) | "The 3 AM Shopper" |
| Setup line | text input | "A visitor has been on the mattress page for 22 minutes at nearly 3 AM." |
| Messages | repeating group (see below) | |
| "What AI really thinks" | text input w/ emoji picker (optional) | "🤖 You're literally proving the business case..." |
| Tagline | text input | "EasyAsk: They're browsing at 2 AM..." |

**Messages repeating group:** Each message has:
- Role toggle: `visitor` or `easyask`
- Content: textarea (supports markdown for the AI messages)
- Add/remove buttons to create 1-6 messages (enough for 3 Q&A pairs)

**Visual controls** (below content fields, collapsed by default under a "Styling" accordion):

| Control | Type | Details |
|---------|------|---------|
| Platform | Toggle: X / LinkedIn | Sets canvas dimensions (see Platform Selector section) |
| Visual preset | 5 preset buttons | One-click: Clean, Dark, Warm, Corporate, Bold |
| Widget background | Mode selector + controls | Solid / Gradient / Image Outline (see Visual Customization section) |
| Chat bubble font | Dropdown (8 fonts) | Inter, DM Sans, Space Grotesk, Lora, JetBrains Mono, Nunito, Playfair Display, IBM Plex Sans |
| Canvas border color | Color picker | Default: `#E5E7EB` |
| Canvas border thickness | Slider (0-12px) | Default: 0 |
| Canvas border radius | Slider (0-32px) | Default: 16px |

A "Load Example" dropdown at the top fetches examples from Supabase via `/api/admin/chat-mockup` (see Data Model section). Supports filtering by vertical, archetype, or sector. Pick one, fields populate, tweak as needed.

### Right Panel: Live Preview

The preview renders in real-time as you type. It has two layers:

#### Layer 0: Series Header (top of canvas)
The series branding, rendered at the very top of the screenshot canvas:
- **"Typing... | Vol. 14"** — series name + volume number, clean typeface
- **Rotating series tagline** underneath in smaller text (e.g. "What people ask when they think no one's watching.")

This is the first thing the eye hits. It brands every image as part of the series without mentioning EasyAsk.

#### Layer 1: Context Card (below series header)
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

## Platform Selector & Export

A toggle in the editor controls which platform the screenshot is sized for. Selecting a platform sets the preview canvas to that platform's ideal image dimensions — the `html2canvas` capture then produces a perfectly-sized image you can paste directly.

| Platform | Dimensions | Aspect Ratio | Notes |
|----------|-----------|--------------|-------|
| **X (Twitter)** | 1200 × 675 px | 16:9 | Landscape. Displays fully in-feed without cropping. |
| **LinkedIn** | 1200 × 1200 px | 1:1 | Square. Maximum in-feed real estate on LinkedIn. |

The preview panel resizes in real-time when you switch platforms. Internal content (context card, widget, footer) reflows to fit — the widget width stays consistent, but vertical spacing and padding adjust so the composition looks intentional at each ratio.

**Export:** A "Copy as Image" button uses `html2canvas` to capture the preview div at the exact platform dimensions → `canvas.toBlob()` → `navigator.clipboard.write()`. One click, paste into X/LinkedIn/Figma/wherever.

---

## Visual Customization

Five controls in the editor panel that affect the live preview. All changes are reflected in real-time and included in the `html2canvas` export.

### 1. Widget Background

A background picker that applies **only to the widget mockup area** (Layer 2). The context card (Layer 1) and footer overlay (Layer 3) keep their own neutral styling — this way the background creates a "stage" effect around the chat without overwhelming the surrounding copy.

**Three background modes:**

#### Solid Color
A color input (hex/RGB) with 8-10 preset swatches (white, off-white, light gray, dark charcoal, EasyAsk orange, soft blue, etc.). Default: white.

#### Gradient
Apple-style linear gradients. A curated set of 10-12 presets:

| Name | Colors | Vibe |
|------|--------|------|
| Sunrise | `#FF6B6B → #FFA07A` | Warm, energetic |
| Ocean | `#667eea → #764ba2` | Professional, modern |
| Mint | `#a8edea → #fed6e3` | Fresh, approachable |
| Midnight | `#0f0c29 → #302b63 → #24243e` | Dark, dramatic |
| Peach | `#ffecd2 → #fcb69f` | Soft, friendly |
| Arctic | `#e6e9f0 → #eef1f5` | Subtle, clean |
| Sunset | `#fa709a → #fee140` | Bold, social-native |
| Forest | `#134e5e → #71b280` | Natural, calm |
| Lavender | `#c471f5 → #fa71cd` | Playful, creative |
| Slate | `#2c3e50 → #4ca1af` | B2B-friendly, trust |
| Ember | `#f12711 → #f5af19` | EasyAsk brand-adjacent |
| Monochrome | `#434343 → #000000` | Stark, editorial |

Each preset shows a small swatch preview in the picker. Gradient direction defaults to top-to-bottom but can be toggled to diagonal (135deg) with a single button.

#### Image Outline (Telegram-style)
A blurred, zoomed version of the widget content rendered behind it as a backdrop — similar to how Telegram shows media previews. Implementation: duplicate the widget div, apply `scale(1.15)`, `filter: blur(20px)`, and `opacity(0.6)` behind the main widget. Creates a soft glow/outline effect that adapts to whatever the chat content looks like. No image uploads needed.

### 2. Chat Bubble Typeface

A dropdown with 5-8 curated Google Fonts loaded on demand via `@next/font/google` or a dynamic `<link>` tag. Applies **only to message content inside chat bubbles** — headings, context card, "What AI really thinks", and tagline keep their default fonts for consistency.

| Font | Style | Best For |
|------|-------|----------|
| **Inter** (default) | Clean sans-serif | Universal, professional |
| **DM Sans** | Geometric, friendly | Approachable brands |
| **Space Grotesk** | Techy, modern | SaaS, dev tools |
| **Lora** | Elegant serif | Luxury, editorial |
| **JetBrains Mono** | Monospace | Coding/tech posts |
| **Nunito** | Rounded, warm | Consumer products |
| **Playfair Display** | High-contrast serif | Premium, aspirational |
| **IBM Plex Sans** | Neutral, corporate | B2B, enterprise |

Fonts are loaded lazily — only the selected font downloads. The preview updates instantly on selection.

### 3. Emoji in "What AI Really Thinks"

The "What the AI really wanted to say" field in the editor supports native emoji input. Additionally, the preview renderer for this section:

- Renders emojis at a slightly larger size (1.2em) so they pop in screenshots
- The field includes a small emoji picker button (using a lightweight library like `emoji-mart` or native OS picker trigger) for quick insertion
- Default examples in the seed data should include emojis where they add humor (e.g. "They came to ask about insurance. They left having confronted a two-year avoidance pattern. I'm a chatbot and I need a moment. 🤖😭")

### 4. Canvas Border

A border/frame around the **entire screenshot canvas** (the outermost div that `html2canvas` captures). This is the final image edge — makes posts stand out in a social feed.

**Controls:**

| Control | Type | Default | Range |
|---------|------|---------|-------|
| Border color | Color picker (hex) | `#E5E7EB` (light gray) | Any color |
| Border thickness | Slider | 0 px (no border) | 0-12 px |
| Border radius | Slider | 16 px | 0-32 px |

The border sits outside the background — so a gradient background with a thin dark border creates a polished, card-like look in the feed. Setting thickness to 0 removes the border entirely (useful for edge-to-edge gradient backgrounds).

### 5. Visual Presets (Convenience)

To avoid tweaking 4 controls every time, include 4-5 one-click presets that set background + border + font together:

| Preset | Background | Border | Font | Vibe |
|--------|-----------|--------|------|------|
| **Clean** | White solid | 1px light gray, 16px radius | Inter | Default, minimal |
| **Dark** | Midnight gradient | 0px | DM Sans | Dramatic, X-friendly |
| **Warm** | Peach gradient | 2px `#f5c6aa`, 20px radius | Nunito | Friendly, consumer |
| **Corporate** | Arctic gradient | 1px `#cbd5e1`, 12px radius | IBM Plex Sans | B2B, LinkedIn-friendly |
| **Bold** | Sunset gradient | 0px | Space Grotesk | Eye-catching, social-native |

Selecting a preset fills in all visual controls at once. Individual controls can still be tweaked after — the preset is a starting point, not a lock.

---

## Data Model (Supabase)

Four new tables in Supabase, following the same org-based RLS pattern as `widget_pages`, `indexed_pages`, etc. All data is owned by the EasyAsk organization — RLS ensures only EasyAsk org members can read or write it.

### Table: `cotd_verticals`

Lookup table for business vertical categories (e.g. "DTC E-commerce", "B2B SaaS").

```sql
CREATE TABLE public.cotd_verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                    -- e.g. 'dtc-ecommerce'
  label TEXT NOT NULL,                   -- e.g. 'DTC E-commerce'
  sector TEXT NOT NULL,                  -- e.g. 'Retail', 'Technology', 'Services'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX idx_cotd_verticals_org ON public.cotd_verticals(organization_id);

ALTER TABLE public.cotd_verticals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view verticals"
  ON public.cotd_verticals FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert verticals"
  ON public.cotd_verticals FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update verticals"
  ON public.cotd_verticals FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete verticals"
  ON public.cotd_verticals FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));
```

### Table: `cotd_archetypes`

Lookup table for visitor archetype categories. Supports optional subtypes (e.g. The Honesty Test has 5 subtypes). Archetypes with `parent_id IS NULL` are top-level; rows with a `parent_id` are subtypes.

```sql
CREATE TABLE public.cotd_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                    -- e.g. 'the-3am-shopper', 'the-impressed'
  label TEXT NOT NULL,                   -- e.g. 'The 3 AM Shopper', 'The Impressed'
  description TEXT,                      -- e.g. 'Late-night browsers making questionable purchase decisions'
  parent_id UUID REFERENCES public.cotd_archetypes(id) ON DELETE CASCADE,  -- NULL = top-level, set = subtype
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX idx_cotd_archetypes_org ON public.cotd_archetypes(organization_id);
CREATE INDEX idx_cotd_archetypes_parent ON public.cotd_archetypes(parent_id);

ALTER TABLE public.cotd_archetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view archetypes"
  ON public.cotd_archetypes FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert archetypes"
  ON public.cotd_archetypes FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update archetypes"
  ON public.cotd_archetypes FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete archetypes"
  ON public.cotd_archetypes FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));
```

### Table: `cotd_series_taglines`

The rotating series-level taglines that appear under "Typing... | Vol. N" at the top of each image. These describe the *series*, not EasyAsk — no product mention. Distinct from the per-post EasyAsk CTA taglines stored on each example.

```sql
CREATE TABLE public.cotd_series_taglines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,                    -- e.g. 'What people ask when they think no one's watching.'
  category TEXT,                         -- e.g. 'voyeuristic', 'contrast', 'confessional', 'editorial'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, text)
);

CREATE INDEX idx_cotd_series_taglines_org ON public.cotd_series_taglines(organization_id);

ALTER TABLE public.cotd_series_taglines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view series taglines"
  ON public.cotd_series_taglines FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert series taglines"
  ON public.cotd_series_taglines FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update series taglines"
  ON public.cotd_series_taglines FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete series taglines"
  ON public.cotd_series_taglines FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));
```

**Seed data (20 taglines):**

| # | Category | Tagline |
|---|----------|---------|
| 1 | voyeuristic | What people ask when they think no one's watching. |
| 2 | voyeuristic | A front-row seat to the internet's most honest moments. |
| 3 | voyeuristic | The conversations happening on your website right now. |
| 4 | voyeuristic | Behind every chat bubble is a human being at 2 AM. |
| 5 | voyeuristic | A peek behind the blinking cursor. |
| 6 | contrast | Where human chaos meets AI composure. |
| 7 | contrast | Unfiltered questions. Unflinching answers. |
| 8 | contrast | They type things. AI handles it. |
| 9 | contrast | Real questions. Real answers. Fake businesses. |
| 10 | contrast | The humans are improvising. The AI is not. |
| 11 | confessional | The things they type at 3 AM. |
| 12 | confessional | No one edits their first message. |
| 13 | confessional | Every question is a confession. |
| 14 | confessional | What the search bar doesn't see. |
| 15 | confessional | The questions your FAQ never prepared for. |
| 16 | editorial | A field guide to internet behavior. |
| 17 | editorial | Dispatches from the chat window. |
| 18 | editorial | Studies in human curiosity. |
| 19 | editorial | An ongoing investigation into what people actually want to know. |
| 20 | editorial | The internet, one question at a time. |

### Table: `cotd_examples`

The main table — each row is one Typing... example. Messages are stored as a JSONB array (ordered, variable length). References verticals and archetypes by foreign key.

```sql
CREATE TABLE public.cotd_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Series branding
  volume_number INTEGER NOT NULL,        -- Incrementing: 1, 2, 3... displayed as "Typing... | Vol. 14"
  series_tagline_id UUID REFERENCES public.cotd_series_taglines(id) ON DELETE SET NULL,  -- Rotating series tagline
  published_date DATE,                   -- NULL = draft, set when published

  -- Content fields
  business_name TEXT NOT NULL,           -- e.g. 'Luxury direct-to-consumer mattress brand'
  page_context TEXT NOT NULL,            -- e.g. 'Product page — The CloudNine Pro King'
  day_time TEXT NOT NULL,                -- e.g. 'Tuesday, 2:47 AM'
  setup TEXT NOT NULL,                   -- e.g. 'A visitor has been on the mattress page for 22 minutes...'

  -- Classification
  vertical_id UUID NOT NULL REFERENCES public.cotd_verticals(id) ON DELETE RESTRICT,
  archetype_id UUID NOT NULL REFERENCES public.cotd_archetypes(id) ON DELETE RESTRICT,

  -- Chat messages as JSONB array: [{ "role": "visitor"|"easyask", "content": "..." }, ...]
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Post extras
  inner_monologue TEXT,                  -- "What the AI really wanted to say"
  tagline TEXT NOT NULL,                 -- e.g. 'EasyAsk: They're browsing at 2 AM...'

  -- Metadata
  sort_order INTEGER DEFAULT 0,         -- Controls display order in "Load Example" dropdown
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_cotd_examples_volume ON public.cotd_examples(organization_id, volume_number);
CREATE INDEX idx_cotd_examples_org ON public.cotd_examples(organization_id);
CREATE INDEX idx_cotd_examples_vertical ON public.cotd_examples(vertical_id);
CREATE INDEX idx_cotd_examples_archetype ON public.cotd_examples(archetype_id);
CREATE INDEX idx_cotd_examples_tagline ON public.cotd_examples(series_tagline_id);

ALTER TABLE public.cotd_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view examples"
  ON public.cotd_examples FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert examples"
  ON public.cotd_examples FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update examples"
  ON public.cotd_examples FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete examples"
  ON public.cotd_examples FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));
```

### How RLS Restricts to EasyAsk Only

No special org-name check is needed. The standard org-based RLS pattern handles it naturally:

1. All seed data is inserted with EasyAsk's `organization_id`
2. RLS policies filter every query by `organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())`
3. PN users, 8020 Inc users, or any future customer org users get zero rows back — the data simply doesn't exist for them
4. The client-side `organization.name === 'EasyAsk'` check on the page itself is a **belt-and-suspenders** UX gate — even if bypassed, the Supabase queries return nothing

### JSONB Messages Format

The `messages` column stores the chat exchange as an ordered JSON array:

```json
[
  { "role": "visitor", "content": "is this mattress good for someone who sleeps like a starfish" },
  { "role": "easyask", "content": "The CloudNine Pro King is 76 inches wide..." },
  { "role": "visitor", "content": "ok but what about a starfish that also steals all the blankets" },
  { "role": "easyask", "content": "That's more of a relationship question than a mattress question..." }
]
```

This keeps the schema flat (no `cotd_messages` join table) since messages are always loaded with the example and never queried independently.

### Seed Data

The migration includes an `INSERT` block that seeds all initial data from the examples doc. The seed:
1. Looks up EasyAsk's `organization_id` from the `organizations` table
2. Inserts the 26 verticals into `cotd_verticals`
3. Inserts the 10 top-level archetypes + 5 Honesty Test subtypes into `cotd_archetypes`
4. Inserts the 20 series taglines into `cotd_series_taglines` (4 categories: voyeuristic, contrast, confessional, editorial)
5. Inserts all 30 examples into `cotd_examples` with `volume_number` 1-30, each assigned a rotating `series_tagline_id` (cycles through the 20 taglines), and `published_date` NULL (drafts)

### Seed Data Reference (30 Examples)

| # | Business | Vertical slug | Archetype slug | Subtype slug |
|---|----------|--------------|----------------|--------------|
| 1 | Luxury direct-to-consumer mattress brand | `dtc-ecommerce` | `the-3am-shopper` | — |
| 2 | Online coding bootcamp | `online-education` | `one-word-wonder` | — |
| 3 | Commercial HVAC installation company | `b2b-services` | `wrong-website-entirely` | — |
| 4 | Small-batch artisanal candle company | `dtc-ecommerce` | `the-overthinker` | — |
| 5 | Online language learning platform | `saas` | `one-word-wonder` | — |
| 6 | Family law firm | `professional-services` | `the-multitasker` | — |
| 7 | Premium supplement brand | `health-ecommerce` | `the-philosopher` | — |
| 8 | Specialty coffee roaster | `food-bev-dtc` | `the-loyal-regular` | — |
| 9 | Wedding photography studio | `creative-services` | `the-negotiator` | — |
| 10 | Children's coding education platform | `edtech` | `the-panicked-parent` | — |
| 11 | Standing desk company | `ergonomic-furniture` | `the-philosopher` | — |
| 12 | True crime subscription box | `subscription-commerce` | `the-3am-shopper` | — |
| 13 | Artisan bakery with online ordering | `local-food` | `the-overthinker` | — |
| 14 | Freelance graphic design agency | `creative-services` | `the-negotiator` | — |
| 15 | Premium noise-canceling headphones brand | `consumer-electronics` | `the-philosopher` | — |
| 16 | Online nutrition certification program | `online-education` | `one-word-wonder` | — |
| 17 | Online garden supply store | `home-garden-ecommerce` | `the-3am-shopper` | — |
| 18 | CRM software for small businesses | `b2b-saas` | `the-overthinker` | — |
| 19 | Custom phone case company | `personalized-products` | `the-loyal-regular` | — |
| 20 | Team-building event company | `corporate-services` | `the-multitasker` | — |
| 21 | Korean skincare brand | `beauty-ecommerce` | `the-philosopher` | — |
| 22 | Industrial safety equipment supplier | `b2b-supply` | `the-multitasker` | — |
| 23 | Online legal document service | `legal-tech` | `the-3am-shopper` | — |
| 24 | AI-powered writing assistant tool | `saas` | `the-philosopher` | — |
| 25 | Neighborhood pizza shop with online ordering | `local-restaurant` | `the-loyal-regular` | — |
| 26 | Premium men's grooming subscription | `dtc-personal-care` | `the-honesty-test` | `the-impressed` |
| 27 | Boutique travel agency | `travel-services` | `the-honesty-test` | `the-rephraser` |
| 28 | Online used bookstore | `niche-ecommerce` | `the-honesty-test` | `the-zen-acceptor` |
| 29 | Online therapy matching platform | `health-tech` | `the-honesty-test` | `the-oversharer` |
| 30 | Eco-friendly cleaning products subscription | `dtc-subscription` | `the-honesty-test` | `the-converter` |

### API Route

One new API route to fetch data for the tool:

**`GET /api/admin/chat-mockup`** — Returns all verticals, archetypes, series taglines, and examples for the logged-in user's org. Uses the authenticated Supabase client (not service role) so RLS applies automatically. Single query with joins:

```typescript
const { data, error } = await supabase
  .from('cotd_examples')
  .select(`
    *,
    vertical:cotd_verticals(*),
    archetype:cotd_archetypes(*, parent:cotd_archetypes(*)),
    series_tagline:cotd_series_taglines(*)
  `)
  .order('volume_number');
```

A separate query fetches the full tagline list for the dropdown:

```typescript
const { data: taglines } = await supabase
  .from('cotd_series_taglines')
  .select('*')
  .order('category');
```

The page also needs **POST/PUT/DELETE** endpoints if we want to create/edit/delete examples from the UI (future enhancement — V1 can be read-only from seeded data).

### Filtering & Grouping

With proper foreign keys, the "Load Example" dropdown supports:
- **Filter by vertical:** `WHERE vertical_id = ?`
- **Filter by archetype:** `WHERE archetype_id = ?`
- **Filter by sector:** Join to `cotd_verticals` and `WHERE sector = ?`
- **Group by archetype + subtype:** Join `cotd_archetypes` with self-join on `parent_id`

---

## Implementation Plan

### File Structure

```
supabase/migrations/
  YYYYMMDD_add_chat_of_the_day.sql  — Tables, RLS, indexes, seed data

src/app/admin/chat-mockup/
  page.tsx              — Main page component (form + preview)

src/app/api/admin/chat-mockup/
  route.ts              — GET endpoint (fetches examples with joins, RLS-protected)

src/components/admin/
  ChatMockupPreview.tsx  — The preview renderer (context card + widget shell + footer)
```

### Step-by-step

**Step 1: Create the Supabase migration**
- Create `cotd_verticals`, `cotd_archetypes`, `cotd_series_taglines`, and `cotd_examples` tables with RLS policies
- Seed 26 verticals, 15 archetypes, 20 series taglines, and 30 examples (Vol. 1-30)
- All seed data inserted under EasyAsk's `organization_id`

**Step 2: Create the API route**
- `GET /api/admin/chat-mockup` — uses authenticated Supabase client so RLS filters to the user's org
- Returns examples with joined vertical and archetype data
- Same auth pattern as other `/api/admin/*` routes

**Step 3: Build the preview component**
- `ChatMockupPreview.tsx` receives the script data + visual settings as props
- Renders: series header ("Typing... | Vol. N" + rotating series tagline), then context card, then the WidgetModal header (reuse the gradient + title bar), then ChatBubble components for each message, then the branding footer, then the inner monologue (with emoji support at 1.2em) + EasyAsk tagline
- ChatBubble is imported directly from ChatInterface (it's currently defined inside that file — may need to extract it or just duplicate the markup/styles since it's pure UI)
- Widget area wrapped in a background container that applies solid/gradient/image-outline based on visual settings
- Chat bubble text uses the selected Google Font (loaded via dynamic `<link>` tag)
- Outer canvas div applies border settings (color, thickness, radius)
- Canvas div sized to platform dimensions (1200×675 for X, 1200×1200 for LinkedIn)
- No hooks, no state, no API — pure render from props
- Wraps everything in a ref div for screenshot capture

**Step 4: Build the page**
- Left panel: form with controlled inputs + repeating message group + visual controls accordion
- Right panel: `ChatMockupPreview` receiving form state + visual settings as props
- "Load Example" dropdown fetches from `/api/admin/chat-mockup` with vertical/archetype/sector filters
- Platform toggle (X vs. LinkedIn) resizes preview in real-time
- Visual preset buttons (Clean, Dark, Warm, Corporate, Bold) set all visual controls at once
- Background picker with three modes (solid, gradient presets, image outline)
- Font dropdown loads selected Google Font on demand
- Border controls (color picker, thickness slider, radius slider)
- "Copy as Image" button using `html2canvas`

**Step 5: Install dependencies**
- `npm install html2canvas` (~40KB, MIT) — screenshot capture
- `npm install @emoji-mart/react @emoji-mart/data` (~200KB, MIT) — emoji picker for "What AI really thinks" field (or use native OS emoji picker to avoid the dependency)
- Wire up the capture button: `html2canvas(previewRef.current)` → `canvas.toBlob()` → `navigator.clipboard.write()`

### What We Reuse vs. Build New

| Component | Reuse or New |
|-----------|-------------|
| WidgetModal header (gradient bar, title, close button) | Reuse markup/styles (copy the JSX, not the component — we don't want the close handler, animations, or props) |
| ChatBubble (message styling, markdown rendering) | Reuse directly if extracted, or copy the JSX + styles |
| ReactMarkdown + remarkGfm + markdownComponents | Reuse directly (already in ChatInterface) |
| Form / editor panel | New |
| Series header ("Typing... | Vol. N" + tagline) | New |
| Context card | New |
| Footer overlay (inner monologue w/ emoji + tagline) | New |
| Platform selector (X / LinkedIn dimensions) | New |
| Background picker (solid, gradient, image outline) | New |
| Google Font loader + font dropdown | New |
| Canvas border controls | New |
| Visual presets (Clean, Dark, Warm, Corporate, Bold) | New |
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

- **1-2 new npm packages:** `html2canvas` (~40KB) required; `@emoji-mart/react` + `@emoji-mart/data` (~200KB) optional (can use native OS emoji picker instead)
- **8 Google Fonts** loaded on demand via dynamic `<link>` tags (only the selected font downloads — zero bundle impact)
- **1 new API route:** `GET /api/admin/chat-mockup` (RLS-protected, read-only)
- **4 new Supabase tables:** `cotd_verticals`, `cotd_archetypes`, `cotd_series_taglines`, `cotd_examples` — all with org-based RLS
- **1 migration file** with schema + seed data (30 examples)
- **3 new app files:** page, API route, preview component
- Auth-protected at two layers: admin middleware (login required) + Supabase RLS (EasyAsk org only)

---

## Future Nice-to-Haves (V2+)

- **TikTok export:** Add 9:16 vertical format (1080x1920) to the platform selector for TikTok content
- **CRUD from the UI:** Add POST/PUT/DELETE endpoints so examples can be created, edited, and deleted directly from the chat-mockup page (V1 is read-only from seed data)
- **Batch export:** Load all 30 examples and export all screenshots at once
- **Dark mode variant** of the widget chrome itself (not just background — actual dark widget header/bubbles)
- **Import from markdown:** Paste raw markdown from the examples doc and auto-parse into form fields
- **Custom gradient builder:** Let the user define their own gradient stops instead of only presets
- **Save visual settings:** Persist the last-used platform, background, font, and border settings per user so they carry over between sessions
