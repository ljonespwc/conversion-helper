# ChatMockupPreview — Dark Editorial Redesign Reference

Reference URL: `https://preview--cravewave-spark-boost.lovable.app/card`

## Overall Structure

- Dark background: `bg-[#111111]`, `rounded-2xl`, `aspect-ratio: 1200/675`
- Thin gradient accent line at top: `h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500`
- Inner padding: `px-12 py-8`
- Layout: `flex flex-col h-full`

## Header Row

Left-aligned, `flex items-baseline justify-between mb-6`:

- **"Typing..."** — `text-[2rem] font-black text-white tracking-tight` with `font-family: Georgia, serif`
- **"|"** — `text-white/30 text-lg font-light`
- **"Vol. 31"** — `text-white/40 text-lg font-medium tracking-wide`
- **"EASYASK"** on far right — `text-white/20 text-xs uppercase tracking-[0.2em] font-medium`

## Context Row

`flex items-center gap-3 mb-5`:

- **Business + page** in a pill: `bg-white/5 rounded-full px-4 py-1.5`
  - Business name: `text-white/70 text-xs font-medium`
  - Dot separator: `text-white/20`
  - Page context: `text-white/40 text-xs`
- **Right side** (`ml-auto`):
  - Day/time: `text-white/30 text-xs`
  - Archetype badge: `bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full`

## Setup Line

`text-white/40 text-sm mb-5 italic`

## Chat Bubbles

Container: `flex-1 flex flex-col gap-4 min-h-0`

### Visitor Bubble (left-aligned)

- Alignment: `flex justify-start`
- Bubble: `relative max-w-[70%] px-5 py-3.5 rounded-2xl bg-amber-500 text-black rounded-bl-sm`
- Text: `text-sm leading-relaxed font-semibold`
- Label above bubble: `absolute -top-5 left-1 text-[10px] text-white/25 uppercase tracking-widest font-bold` — "VISITOR"

### AI Bubble (right-aligned)

- Alignment: `flex justify-end`
- Bubble: `relative max-w-[70%] px-5 py-3.5 rounded-2xl bg-white/10 text-white/90 rounded-br-sm`
- Text: `text-sm leading-relaxed font-normal`
- Label above bubble: `absolute -top-5 right-1 text-[10px] text-white/25 uppercase tracking-widest font-bold` — "AI"

## Punchline Footer

Container: `mt-auto pt-5 border-t border-white/5`, `text-center`

- **Inner monologue**: `text-white/60 text-base italic leading-relaxed` with `font-family: Georgia, serif`
- **Emoji**: `ml-2 text-lg` (inline after quote)
- **Tagline**: `text-white/25 text-xs font-bold uppercase tracking-[0.25em]`, `mt-2`

## Key Design Shifts vs Current Implementation

1. **Dark theme** — `#111111` background, all text uses `text-white/*` opacity variants
2. **Left-aligned header** — "Typing..." left, "EASYASK" watermark right (no centered title)
3. **Serif font** — Georgia for "Typing..." title and inner monologue
4. **Thin gradient accent** — 4px gradient line at top replaces all widget chrome
5. **Left/right bubble alignment** — visitor left, AI right, `max-w-[70%]` (not full-width)
6. **Solid amber visitor bubble** — `bg-amber-500 text-black` (not gradient)
7. **Translucent AI bubble** — `bg-white/10 text-white/90` (not white with border)
8. **"VISITOR"/"AI" labels** — tiny uppercase labels floating above each bubble
9. **Subtle footer separator** — `border-t border-white/5` before punchline
10. **Uppercase tracked tagline** — `uppercase tracking-[0.25em]` for brand line
11. **No series tagline shown** — only title + volume in header
