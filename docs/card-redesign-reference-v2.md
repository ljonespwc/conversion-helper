# ChatMockupPreview — Dark Editorial Redesign Reference V2

Reference URL: `https://preview--cravewave-spark-boost.lovable.app/card`

## Overall Structure

- Page background: `bg-[#0a0a0a]`
- Card: `bg-[#111111] rounded-2xl overflow-hidden`, `aspect-ratio: 1200/675`
- Thin gradient accent line at top: `absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500`
- Inner padding: `px-12 py-8`
- Layout: `flex flex-col h-full`

## Section 1: Header

Left-aligned only (no right-side branding), `flex items-baseline gap-3 mb-4`:

- **"Typing..."** — `text-[2rem] font-black text-white tracking-tight` with `font-family: Georgia, serif`
- **"|"** — `text-white/30 text-lg font-light`
- **"Vol. 31"** — `text-white/40 text-lg font-medium tracking-wide`

## Section 2: Context Card

Contained in a subtle card: `bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 mb-5`

### Row 1 — Archetype + Time

`flex items-center gap-3 mb-2`:

- **Archetype badge**: `bg-amber-500/20 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`
- **Dot separator**: `text-white/25 text-xs` — "·"
- **Day/time**: `text-white/35 text-xs`

### Row 2 — Setup Line

- `text-white/70 text-[15px] leading-relaxed` with `font-family: Georgia, serif`

### Row 3 — Business Breadcrumb

`flex items-center gap-2 mt-2`:

- **Business name**: `text-white/25 text-[11px]`
- **Arrow**: `text-white/15` — "→"
- **Page context**: `text-white/25 text-[11px]`

## Section 3: Chat Bubbles

Container: `flex-1 flex flex-col gap-4 min-h-0`

### Visitor Bubble (left-aligned)

Row: `flex items-start gap-3 justify-start`

- **Avatar**: `w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1`
  - Emoji: `text-amber-400 text-sm` — "👤"
- **Bubble**: `relative max-w-[65%] px-5 py-3.5 rounded-2xl bg-amber-500 text-black rounded-bl-sm`
  - Text: `text-sm leading-relaxed font-semibold`

### AI Bubble (right-aligned)

Row: `flex items-start gap-3 justify-end`

- **Bubble**: `relative max-w-[65%] px-5 py-3.5 rounded-2xl bg-white/10 text-white/90 rounded-br-sm`
  - Text: `text-sm leading-relaxed font-normal`
- **Avatar** (after bubble, right side): `w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1`
  - Emoji: `text-white/70 text-sm` — "🤖"

## Section 4: Punchline Footer

Container: `mt-auto pt-4`

### Inner Monologue Card

Warm amber tinted card: `bg-amber-500/[0.06] border border-amber-500/10 rounded-xl px-5 py-3.5`

- **Label**: `text-amber-400/60 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1.5` — "💭 What the AI was actually thinking"
- **Quote**: `text-white/70 text-[15px] italic leading-relaxed` with `font-family: Georgia, serif`

### Tagline

`text-center mt-3 text-white/25 text-xs font-bold uppercase tracking-[0.25em]`

## Changes from V1 to V2

1. **"EASYASK" watermark removed** from header right side — header is now left-aligned only
2. **Header margin** — `mb-4` (was `mb-6`)
3. **Context card redesign** — now a proper card (`bg-white/[0.03] border border-white/[0.06] rounded-xl`) containing archetype + time on row 1, setup line (serif) on row 2, and business→page breadcrumb on row 3
4. **Archetype badge** — moved into context card row 1 (was on same row as time in context area), now `text-[11px] uppercase tracking-wider`
5. **Setup line** — elevated to `text-[15px]` serif (was `text-sm`), now inside context card
6. **Business/page breadcrumb** — now `text-[11px] text-white/25` with arrow separator (was pill with dot separator)
7. **Emoji avatars** replace text labels — 👤 for visitor (`bg-amber-500/20` circle), 🤖 for AI (`bg-white/10` circle)
8. **Bubble max-width** — `max-w-[65%]` (was `max-w-[70%]`)
9. **Bubble layout** — `flex items-start gap-3` with avatars alongside (was just bubble + floating label)
10. **Inner monologue** — now in its own amber-tinted card (`bg-amber-500/[0.06] border border-amber-500/10 rounded-xl`) with a label "💭 What the AI was actually thinking"
11. **Footer separator** — removed `border-t border-white/5`, now just `mt-auto pt-4`
12. **Tagline** — `mt-3` (was `mt-2`)

## Full HTML Structure (cleaned)

```html
<!-- Outer card -->
<div class="relative w-full max-w-[1200px] bg-[#111111] rounded-2xl overflow-hidden"
     style="aspect-ratio: 1200 / 675;">

  <!-- Gradient accent line -->
  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>

  <!-- Content -->
  <div class="flex flex-col h-full px-12 py-8">

    <!-- Header -->
    <div class="flex items-baseline gap-3 mb-4">
      <h1 class="text-[2rem] font-black text-white tracking-tight"
          style="font-family: Georgia, serif;">Typing...</h1>
      <span class="text-white/30 text-lg font-light">|</span>
      <span class="text-white/40 text-lg font-medium tracking-wide">Vol. 31</span>
    </div>

    <!-- Context card -->
    <div class="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 mb-5">
      <div class="flex items-center gap-3 mb-2">
        <span class="bg-amber-500/20 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          The 3 AM Shopper
        </span>
        <span class="text-white/25 text-xs">·</span>
        <span class="text-white/35 text-xs">Thursday, 1:44 AM</span>
      </div>
      <p class="text-white/70 text-[15px] leading-relaxed"
         style="font-family: Georgia, serif;">
        It's 1:44 AM and someone is browsing a true crime subscription box worried about staying up all night.
      </p>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-white/25 text-[11px]">True crime subscription box</span>
        <span class="text-white/15">→</span>
        <span class="text-white/25 text-[11px]">"How It Works" page</span>
      </div>
    </div>

    <!-- Chat bubbles -->
    <div class="flex-1 flex flex-col gap-4 min-h-0">

      <!-- Visitor message -->
      <div class="flex items-start gap-3 justify-start">
        <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
          <span class="text-amber-400 text-sm">👤</span>
        </div>
        <div class="relative max-w-[65%] px-5 py-3.5 rounded-2xl bg-amber-500 text-black rounded-bl-sm">
          <p class="text-sm leading-relaxed font-semibold">
            do the cases in the box have actual solutions or will I be up all night trying to figure it out
          </p>
        </div>
      </div>

      <!-- AI message -->
      <div class="flex items-start gap-3 justify-end">
        <div class="relative max-w-[65%] px-5 py-3.5 rounded-2xl bg-white/10 text-white/90 rounded-br-sm">
          <p class="text-sm leading-relaxed font-normal">
            Each monthly box includes a complete case file — evidence cards, witness statements...
          </p>
        </div>
        <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
          <span class="text-white/70 text-sm">🤖</span>
        </div>
      </div>

    </div>

    <!-- Punchline footer -->
    <div class="mt-auto pt-4">
      <div class="bg-amber-500/[0.06] border border-amber-500/10 rounded-xl px-5 py-3.5">
        <span class="text-amber-400/60 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1.5">
          💭 What the AI was actually thinking
        </span>
        <p class="text-white/70 text-[15px] italic leading-relaxed"
           style="font-family: Georgia, serif;">
          "It's 1:44 AM and they're worried about staying up all night. The call is coming from inside the house."
        </p>
      </div>
      <p class="text-center mt-3 text-white/25 text-xs font-bold uppercase tracking-[0.25em]">
        EasyAsk: No question too short. No hour too late.
      </p>
    </div>

  </div>
</div>
```
