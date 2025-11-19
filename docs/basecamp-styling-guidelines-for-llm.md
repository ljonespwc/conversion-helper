# Basecamp Design System - Styling Guidelines for LLM Prompts

**Version:** 1.0
**Last Updated:** November 18, 2025
**Source:** https://basecamp.com

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Component Patterns](#component-patterns)
6. [Responsive Design](#responsive-design)
7. [Animation & Transitions](#animation--transitions)
8. [Accessibility](#accessibility)
9. [LLM Implementation Guide](#llm-implementation-guide)

---

## Design Philosophy

### Core Principles

Basecamp's design embodies **calm, clarity, and confidence**:

- **Simplicity First**: Minimal visual noise, maximum clarity
- **Approachable**: Professional but not corporate, friendly but not childish
- **Consistent**: Predictable patterns, familiar interactions
- **Efficient**: Fast load times, smooth animations, no bloat
- **Accessible**: Works for everyone, everywhere

### Visual Characteristics

- **Clean white backgrounds** with subtle paper textures
- **Generous whitespace** for breathing room
- **Soft shadows** for depth without drama
- **Bold, confident typography** that's easy to read
- **Intentional color** - accent colors used sparingly for impact
- **Smooth, subtle animations** that feel natural

---

## Color System

### Primary Colors

```css
/* Main Brand Colors */
--color-black: rgb(11, 18, 21)          /* Primary text, dark elements */
--color-white: rgb(255, 255, 255)       /* Backgrounds, light text */
--color-green: rgb(11, 138, 15)         /* Primary CTA, success */
--color-green-dark: rgb(0, 117, 0)      /* Hover states */
--color-blue: rgb(37, 99, 235)          /* Links, interactive elements */
--color-yellow: rgb(255, 214, 10)       /* Highlights, badges */
```

### Secondary Colors

```css
--color-grey: rgb(231, 232, 233)        /* Borders, dividers */
--color-paper: rgb(250, 248, 244)       /* Card backgrounds, subtle contrast */
--color-red: rgb(255, 1, 1)             /* Errors, warnings */
--color-orange: rgb(248, 121, 23)       /* Accent */
--color-purple: rgb(153, 50, 204)       /* Accent */
--color-blurple: rgb(85, 34, 250)       /* HEY brand color */
```

### Color Usage Guidelines

**Text Colors:**
- Primary text: `--color-black`
- Links: `--color-blue` → `--color-black` on hover
- Strong emphasis: `--color-black` with `font-weight: 600`

**Backgrounds:**
- Main: `--color-white`
- Cards/sections: `--color-paper`
- Navigation: `rgba(255, 255, 255, 0.9)` with backdrop blur

**Interactive Elements:**
- Primary CTAs: `--color-green` background, white text
- Secondary buttons: White background with grey border
- Hover states: Darker shade of base color or increased opacity

**Color Application:**
```css
/* Use RGB variables for opacity control */
background: rgba(var(--rgb-black), 0.1);  /* 10% black */
box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.1);
```

---

## Typography

### Font Families

**Primary: Graphik** (Custom sans-serif)
- Clean, modern, highly readable
- 9 weights: 400-800 (Regular, Medium, Semibold, Bold, Black)
- Used for all UI, headings, body text

**Secondary: Sharpie** (Handwriting)
- Used sparingly for playful accents
- Badges, labels, hand-drawn elements

**Monospace: Monaspace**
- Code, technical content, data displays

### Font Loading

```css
@font-face {
  font-display: swap;  /* Prevent FOIT - show fallback immediately */
  font-family: "Graphik";
  font-style: normal;
  font-weight: 400;
  src: url("/assets/fonts/Graphik-Regular-Web.woff2") format("woff2"),
       url("/assets/fonts/Graphik-Regular-Web.woff") format("woff");
}
```

### Type Scale

Basecamp uses **fluid typography** that scales with viewport:

```css
--font-size: max(1.375rem, 2.225vw)       /* Base: ~22px */
--font-size-xxxx-small: max(0.875rem, 50%)  /* ~14px */
--font-size-xxx-small: max(0.9375rem, 60%)  /* ~15px */
--font-size-xx-small: max(1rem, 65%)        /* ~16px */
--font-size-x-small: max(1.0625rem, 75%)    /* ~17px */
--font-size-small: 85%                      /* Relative */
--font-size-medium: 120%                    /* ~26px */
--font-size-large: 140%                     /* ~31px */
--font-size-x-large: 160%                   /* ~35px */
--font-size-xx-large: 200%                  /* ~44px */

/* Scales up on desktop */
@media (min-width: 64em) {
  --font-size-medium: 125%;
  --font-size-large: 175%;
  --font-size-x-large: 200%;
  --font-size-xx-large: 300%;
}
```

### Typography Hierarchy

**Display Headings:**
```css
h1 {
  font-size: var(--font-size-xx-large);   /* 200-300% */
  font-weight: 700;
  letter-spacing: var(--letter-spacing-x-tight);  /* -0.04125em */
  line-height: 1.15;
  margin-bottom: -0.175em;
  margin-top: -0.4375em;
}
```

**Section Headings:**
```css
h2 {
  font-size: var(--font-size-large);      /* 140-175% */
  font-weight: 700;
  letter-spacing: var(--letter-spacing-tight);  /* -0.03375em */
  line-height: 1.15;
}
```

**Body Text:**
```css
p {
  font-size: var(--font-size-x-small);    /* ~17px */
  letter-spacing: var(--letter-spacing);  /* -0.025em */
  line-height: var(--line-height);        /* 1.4 */
}
```

### Letter Spacing

Basecamp uses **negative letter spacing** for a tighter, more refined look:

```css
--letter-spacing: -0.025em          /* Default */
--letter-spacing-loose: -0.0175em   /* Looser (still negative!) */
--letter-spacing-tight: -0.03375em  /* Tighter */
--letter-spacing-x-tight: -0.04125em  /* Display headings */
```

### Font Weights

```css
400: Normal body text, secondary UI
500: Medium - form controls, subtle emphasis
600: Semibold - strong emphasis, links, buttons
700: Bold - headings, primary CTAs
800: Black - display headings (rarely used)
```

---

## Spacing System

### Spacing Scale

Basecamp uses an **em-based spacing system** that scales with font size:

```css
--space-neutral: 1.4em   /* Default, matches line-height */
--space-small: 0.5em     /* Tight spacing */
--space-medium: 1em      /* Standard spacing */
--space-large: 2em       /* Section gaps */
--space-x-large: 3em     /* Major section gaps */
--space-xx-large: 4em    /* Large section gaps */
--space-xxx-large: 5em   /* Hero spacing */
```

### Margin Utilities

```css
.space-top--neutral { margin-top: var(--space-neutral); }
.space-top--large { margin-top: var(--space-large); }
.space-top--xxx-large { margin-top: var(--space-xxx-large); }

/* Same pattern for bottom margins */
```

### Spacing Application

**Vertical Rhythm:**
- Section spacing: `--space-xxx-large` (5em)
- Component spacing: `--space-large` (2em)
- Content spacing: `--space-neutral` (1.4em)
- Tight spacing: `--space-small` (0.5em)

**Horizontal Rhythm:**
- Page margins (mobile): `--space-medium` (1em)
- Page margins (desktop): `--space-neutral` (1.4em)
- Component gaps: `--space-medium` to `--space-large`

### Container Widths

```css
/* Narrow content (text) */
width: min(100%, 24em);   /* ~384px-528px */

/* Standard content */
width: min(100%, 28em);   /* ~448px-616px */

/* Wide content */
width: min(100%, 35em);   /* ~560px-770px */
```

---

## Component Patterns

### Buttons

**Primary Button (Green CTA):**
```css
.button--green {
  background: var(--color-green);
  border-radius: 0.25em;
  color: var(--color-white);
  font-size: var(--font-size-xxx-small);
  font-weight: 500;
  padding: 0.5625em 0.95em 0.65em 0.95em;
  box-shadow: none;
}

/* Hover state */
.button--green:hover {
  background: var(--color-green-dark);
}
```

**Secondary Button (Default):**
```css
.button {
  background: var(--color-white);
  border-radius: 0.25em;
  box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.1),
              0 0 0.1em 0.02em rgba(var(--rgb-black), 0.05);
  color: var(--color-black);
  font-weight: 600;
}

/* Hover state */
.button:hover {
  box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.85),
              0 0 0.1em 0.02em rgba(var(--rgb-black), 0.05);
}
```

### Cards

```css
.card {
  background: var(--color-paper);
  border-radius: 0.2em;
  box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.1),
              0 0 0.1em 0.02em rgba(var(--rgb-black), 0.05);
  padding: var(--space-neutral);
}
```

### Shadows

Basecamp uses **subtle, layered shadows**:

```css
/* Subtle card shadow */
box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.1),
            0 0 0.1em 0.02em rgba(var(--rgb-black), 0.05);

/* Elevated shadow (modals, dropdowns) */
box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.075),
            0 0.4em 1.6em -0.8em rgba(var(--rgb-black), 0.1),
            0 0.8em 1.2em -1.6em rgba(var(--rgb-black), 0.2),
            0 1.2em 1.6em -2.4em rgba(var(--rgb-black), 0.3);
```

### Border Radius

```css
/* Buttons, inputs, small elements */
border-radius: 0.25em;

/* Cards, containers */
border-radius: 0.2em;

/* Badges, circles */
border-radius: 100%;
```

### Navigation

```css
.nav {
  backdrop-filter: blur(0.5em);
  background: rgba(var(--rgb-white), 0.9);
  position: fixed;
  top: 0;
  z-index: 100;
}

/* Stuck/scrolled state */
.nav--stuck {
  box-shadow: 0 0 0 1px rgba(var(--rgb-black), 0.1),
              0 0 0.1em 0.02em rgba(var(--rgb-black), 0.05);
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile-first approach */

/* Small tablets and up */
@media (min-width: 32em) { /* 512px */ }

/* Tablets and up */
@media (min-width: 48em) { /* 768px */ }

/* Small desktops and up */
@media (min-width: 56em) { /* 896px */ }

/* Desktops and up - PRIMARY BREAKPOINT */
@media (min-width: 64em) { /* 1024px */ }

/* Large desktops */
@media (min-width: 80em) { /* 1280px */ }
```

### Grid System

Basecamp uses **CSS Grid** with 12 columns on desktop:

```css
@media (min-width: 64em) {
  .container {
    grid-template-columns: repeat(12, 1fr);
  }

  /* Span examples */
  .content { grid-column: span 9; }   /* 75% width */
  .sidebar { grid-column: span 3; }   /* 25% width */
  .full { grid-column: 1/-1; }        /* Full width */
}
```

### Mobile-First Patterns

```css
/* Mobile: Stack vertically */
.layout {
  display: grid;
  gap: var(--space-medium);
}

/* Desktop: Side-by-side */
@media (min-width: 64em) {
  .layout {
    grid-template-columns: repeat(12, 1fr);
  }
}
```

### Responsive Typography

Font sizes automatically scale using `max()`:

```css
/* Scales from 22px (mobile) to ~35.6px (desktop) */
font-size: max(1.375rem, 2.225vw);
```

---

## Animation & Transitions

### Timing

```css
--transition: 0.1s ease;        /* Quick, snappy */
--transition-slow: 0.2s ease;   /* Smooth, refined */
```

### Common Patterns

**Hover Effects:**
```css
.element {
  transition: box-shadow var(--transition);
}

.element:hover {
  box-shadow: /* darker/stronger */;
}
```

**Transform Animations:**
```css
.element {
  transition: transform var(--transition-slow);
  will-change: transform;
}

.element:hover {
  transform: scale(1.03);
}
```

**Fade In/Out:**
```css
.element {
  opacity: 0;
  transition: opacity var(--transition-slow);
}

.element--visible {
  opacity: 1;
}
```

### Motion Principles

- **Subtle**: Animations are barely noticeable, not showy
- **Fast**: 100-200ms, feels instant
- **Natural**: Ease curves, no bounce or elastic
- **Purposeful**: Only animate what needs attention

---

## Accessibility

### Focus States

Always visible, high contrast:

```css
:focus {
  outline: 0.1em solid var(--color-black);
  outline-offset: 0.12em;
}
```

### Hover States

Only apply on devices that support hover:

```css
@media (hover: hover) {
  .element:hover {
    /* hover styles */
  }
}
```

### Color Contrast

- Text on white: Minimum AA compliance (4.5:1)
- Interactive elements: Clear visual distinction
- Focus indicators: Strong contrast

### Semantic HTML

```html
<!-- Use appropriate elements -->
<button> for actions
<a> for navigation
<nav>, <main>, <footer> for structure
<h1>-<h6> for hierarchy
```

### Font Rendering

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

---

## LLM Implementation Guide

### When to Use This Design System

**Ideal For:**
- Professional SaaS products
- B2B tools and dashboards
- Content-heavy websites
- E-commerce platforms
- Marketing sites

**Characteristics:**
- Clean, minimal, professional
- High readability, low cognitive load
- Trustworthy, established feel
- Works across devices seamlessly

### Key Prompting Patterns

#### Pattern 1: Basecamp-Inspired Component

```
Create a [component name] in the Basecamp design style with:
- Clean white background with subtle shadow
- Graphik-like sans-serif font (use system fonts: -apple-system, BlinkMacSystemFont, "Segoe UI")
- Generous padding (1.5-2em)
- Subtle border radius (0.2-0.25em)
- Green CTA button (rgb(11, 138, 15))
- Fluid typography scaling with viewport
- Mobile-first responsive design
```

#### Pattern 2: Color Application

```
Style this element following Basecamp's color philosophy:
- Primary text: near-black rgb(11, 18, 21)
- White background rgb(255, 255, 255)
- Accent: green rgb(11, 138, 15) for CTAs
- Links: blue rgb(37, 99, 235), turn black on hover
- Subtle grey borders rgb(231, 232, 233)
- Paper texture background rgb(250, 248, 244) for cards
```

#### Pattern 3: Typography Hierarchy

```
Implement Basecamp's typography scale:
- Display heading: 200% base size, 700 weight, -0.04em letter-spacing, 1.15 line-height
- Section heading: 140% base size, 700 weight, -0.03em letter-spacing
- Body text: 75% base size, 400 weight, -0.025em letter-spacing, 1.4 line-height
- Use negative letter spacing for tighter, refined look
- Base font size: max(1.375rem, 2.225vw) for fluid scaling
```

#### Pattern 4: Spacing & Layout

```
Apply Basecamp's spacing system:
- Section gaps: 5em (--space-xxx-large)
- Component gaps: 2em (--space-large)
- Content spacing: 1.4em (--space-neutral)
- Container padding: 1em mobile, 1.4em desktop
- Max content width: 28em for readable text
- Use CSS Grid with 12 columns on desktop (1024px+)
```

#### Pattern 5: Interactive Elements

```
Style buttons following Basecamp patterns:

Primary CTA:
- Background: rgb(11, 138, 15)
- Color: white
- Padding: 0.56em 0.95em 0.65em
- Border radius: 0.25em
- Font weight: 500
- Hover: rgb(0, 117, 0)
- Transition: 0.1s ease

Secondary button:
- Background: white
- Border: 1px rgba(11, 18, 21, 0.1)
- Color: rgb(11, 18, 21)
- Font weight: 600
- Hover: darker border rgba(11, 18, 21, 0.85)
```

#### Pattern 6: Shadows & Depth

```
Apply Basecamp's shadow system:

Subtle elevation (cards):
box-shadow:
  0 0 0 1px rgba(11, 18, 21, 0.1),
  0 0 0.1em 0.02em rgba(11, 18, 21, 0.05);

Medium elevation (modals):
box-shadow:
  0 0 0 1px rgba(11, 18, 21, 0.075),
  0 0.4em 1.6em -0.8em rgba(11, 18, 21, 0.1),
  0 0.8em 1.2em -1.6em rgba(11, 18, 21, 0.2);
```

#### Pattern 7: Responsive Grid

```
Create responsive layout like Basecamp:

Mobile (< 1024px):
- Single column stack
- Padding: 1em sides
- Full width content

Desktop (≥ 1024px):
- 12-column CSS Grid
- Padding: 1.4em sides
- Content spans 9 columns (75%)
- Sidebar spans 3 columns (25%)
- Grid gap: 2em

Use this breakpoint: @media (min-width: 64em)
```

### System Font Fallback

Basecamp uses custom fonts, but for implementations use:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

### Common Mistakes to Avoid

❌ **Don't:**
- Use bright, saturated colors (except green CTA)
- Add heavy shadows or gradients
- Use positive letter spacing
- Create busy, cluttered layouts
- Use bounce or elastic animations
- Apply borders to everything

✅ **Do:**
- Keep it clean and minimal
- Use whitespace generously
- Apply subtle shadows sparingly
- Use negative letter spacing
- Create clear hierarchy
- Prioritize readability

### Quick Reference Card

```css
/* Copy-paste starter template */
:root {
  /* Colors */
  --color-black: rgb(11, 18, 21);
  --color-white: rgb(255, 255, 255);
  --color-green: rgb(11, 138, 15);
  --color-blue: rgb(37, 99, 235);
  --color-grey: rgb(231, 232, 233);
  --color-paper: rgb(250, 248, 244);

  /* Typography */
  --font-size-base: max(1.375rem, 2.225vw);
  --letter-spacing: -0.025em;
  --line-height: 1.4;

  /* Spacing */
  --space-sm: 0.5em;
  --space-md: 1em;
  --space-lg: 2em;
  --space-xl: 3em;

  /* Effects */
  --transition: 0.1s ease;
  --border-radius: 0.25em;
  --shadow: 0 0 0 1px rgba(11, 18, 21, 0.1),
            0 0 0.1em 0.02em rgba(11, 18, 21, 0.05);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: var(--font-size-base);
  letter-spacing: var(--letter-spacing);
  line-height: var(--line-height);
  color: var(--color-black);
  background: var(--color-white);
}
```

---

## Example LLM Prompts

### Prompt Example 1: Hero Section

```
Create a hero section following Basecamp's design philosophy:

Layout:
- Clean white background
- Centered content, max-width 28em
- Generous top/bottom padding (5em)

Typography:
- Heading: 200% size, 700 weight, -0.04em spacing
- Subheading: 75% size, normal weight, -0.025em spacing
- Line height: 1.15 for headings, 1.4 for body

Colors:
- Text: rgb(11, 18, 21)
- CTA button: rgb(11, 138, 15) background, white text
- Subtle grey for secondary text: rgba(11, 18, 21, 0.65)

Spacing:
- Heading to subheading: 1.4em
- Subheading to CTA: 2em
- Internal button padding: 0.56em 0.95em 0.65em

Effects:
- Button border-radius: 0.25em
- Smooth hover transition: 0.1s ease
- Hover state: darker green rgb(0, 117, 0)
```

### Prompt Example 2: Feature Card Grid

```
Design a 3-column feature card grid using Basecamp's style:

Grid:
- Mobile: 1 column stack
- Desktop (1024px+): 3 equal columns
- Gap: 2em between cards

Cards:
- Background: rgb(250, 248, 244) paper texture
- Border radius: 0.2em
- Shadow: 0 0 0 1px rgba(11, 18, 21, 0.1)
- Padding: 1.5em

Typography:
- Card title: 120% size, 700 weight
- Description: 75% size, 400 weight
- All text: -0.025em letter spacing

Hover effect:
- Subtle outline: 0.1em solid black, 0.12em offset
- Transition: 0.2s ease
- No transform or scale
```

---

## Conclusion

Basecamp's design is **deceptively simple**. Its power lies in:

1. **Consistency**: Every element follows the same principles
2. **Restraint**: Limited colors, effects, patterns
3. **Typography**: Bold, readable, hierarchical
4. **Whitespace**: Generous, intentional negative space
5. **Performance**: Fast, smooth, efficient

When implementing this style, remember: **Less is more**. If you're unsure whether to add an effect, color, or animation—don't. Basecamp's elegance comes from what's NOT there.

---

**For questions or clarifications, reference:**
- Full CSS: `/docs/basecamp-complete-css.css`
- Source: https://basecamp.com
- Design team: 37signals
