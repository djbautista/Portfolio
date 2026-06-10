# AI Feature Intelligence Layer — deck (React migration)

This folder is the **React/TypeScript implementation** of a Claude Design HTML
presentation. The HTML prototype is the **visual source of truth**; this code is
the production implementation. When a new slide is added to the prototype, it is
migrated here by hand — never pasted as raw markup.

> **Adding a slide? Follow [`ADD_A_SLIDE.md`](./ADD_A_SLIDE.md).** It has the
> step-by-step recipe and a copy-pasteable skeleton. This file is the why + the
> guardrails.

## Where the two halves live

| Half | Location | Role |
| --- | --- | --- |
| Prototype (plain HTML) | `public/ai-layer-for-post-release-support/project/AI Feature Intelligence Layer.html` | Visual spec. New slides are authored here first as `<section class="slide …">` (see that folder's own `CLAUDE.md`). |
| React deck (this folder) | `app/presentations/ai-feature-intelligence-layer/` | Faithful, maintainable implementation embedded in the portfolio. |

Route: **`/presentations/ai-feature-intelligence-layer`**.

## Use the prototype as the source of truth for — and ONLY for

slide content · copy · slide order · typography scale · colors · spacing ·
visual hierarchy · layout composition · the 1920×1080 proportions · the dark
Twilio-like aesthetic · each slide's specific visual structure.

**Do NOT carry over** the prototype's React-hostile bits: DOM structure, inline
styles, vanilla JS controllers, generated class names, custom elements
(`deck-stage`, `image-slot`), the `.intro`/`.in` entrance machinery, or the
thumbnail `<template>`. Re-express the visual in idiomatic React.

## Hard rules (do not break these)

- **No `dangerouslySetInnerHTML`. No pasting prototype markup. No prototype JS.**
- **No new dependencies / styling libs.** Tailwind v4, `next/font`, and
  `framer-motion` (already installed) are all you get. Animations: `motion`
  (framer-motion) **only**.
- **All deck CSS is route-scoped under `.afil-root`** in `presentation.css`.
  Every selector starts with `.afil-root` or a slide root class
  (`.afil-title`, `.afil-about`, `.afil-persona`, `.afil-insight`, …). The deck
  reuses generic class names (`.eyebrow`, `.footer`, `.title`) that would collide
  globally if unscoped — keep them scoped.
- **Parent imports must use the `@/…` alias**, not `../`. The lint rule
  `no-restricted-imports` fails the build otherwise. `./` (same dir) is fine.
  Example: `import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame'`.
- **Repeated visual nodes are data-driven.** Pipeline stages, journey steps,
  scattered questions, etc. live as typed arrays in `data.ts`; components
  `.map()` over them. Don't hand-repeat near-identical JSX.
- **Resting state is fully visible.** Motion is subtle entrance polish only, and
  must be gated on `prefers-reduced-motion` (CSS does this globally at the bottom
  of `presentation.css`; `PresentationDeck` also checks `useReducedMotion`).

## Architecture

```
page.tsx                 Server component. metadata (+ robots: noindex). Renders <PresentationDeck/>.
PresentationDeck.tsx     'use client'. Owns: active slide index, the 1920×1080 scale wrapper,
                         keyboard nav (←/→, Space, PageUp/Down), per-slide motion crossfade, and
                         any in-slide interaction handoff (see "Interactive slides"). renderSlide()
                         switches on the index → returns the active <…Slide/>.
SlideFrame.tsx           One slide on the fixed 1920×1080 plane. Props: variant (union), className.
                         Renders `.afil-slide <variant>` (background wash) > `.afil-canvas afil-<variant>`.
SlideNavigation.tsx      Bottom-center prev/next + `NN / NN` counter + jump dots. Driven by data.
useDeckScale.ts          Fits 1920×1080 into the viewport: scale = min(vw/1920, vh/1080), on resize.
icons.tsx                Shared inline SVG chevrons.
data.ts                  ALL content + geometry + the slide registry (slideLabels, SLIDE_COUNT).
presentation.css         The single route-scoped stylesheet (tokens + per-slide CSS + nav).
slides/                  One component per slide (TitleSlide, AboutSlide, PersonaJourneysSlide, InsightSlide).
components/              Reusable slide-internal pieces (SDLCFlow, PersonaJourney, MetricCallout).
```

### The 1920×1080 plane
Every slide is absolutely positioned inside a fixed 1920×1080 canvas, scaled to
fit (letterboxed) by `useDeckScale` via `--afil-scale`. **Coordinates from the
prototype transfer 1:1.** For data-driven positions, pass numbers through inline
`style={{ left, top }}` (React serializes a bare number to `px`) — this is the
one place inline positioning is correct, mirroring how the prototype positions
labels/questions. Static layout still goes in `presentation.css`.

### Design tokens (on `.afil-root`, lifted from the prototype `:root`)
`--bg #0A0C10` · `--ink-1 #F4F6FA` · `--ink-2 #AEB4C0` · `--ink-3 #6E7787` ·
`--line #232834` · `--line-bright #333B49` · `--red #F22F46` ·
`--red-soft rgba(242,47,70,.55)` · `--ease cubic-bezier(.16,1,.3,1)`.
Fonts: `var(--font-display)` (Space Grotesk) for display, `var(--font-body)`
(Manrope) for body — wired from `next/font` in `utils/fonts.ts` and applied as
`spaceGrotesk.variable` / `manrope.variable` on `.afil-root`.

### The slide registry (one source of truth for nav)
`slideLabels` in `data.ts` is the ordered list of slides; `SLIDE_COUNT` derives
from it. The nav counter and dots read from it automatically. To wire a new
slide into navigation you only: (1) add its label to `slideLabels`, and (2) add
its `case` to `renderSlide()` in `PresentationDeck.tsx`.

### Interactive slides (e.g. Personas' 1/3 → 3/3 reveal)
If a prototype slide has an internal step/reveal, recreate it in **React state
owned by `PresentationDeck`** (not a vanilla controller). The pattern, from the
persona slide:
- The stage lives in the deck (`personaStage`). `navigate('next'|'prev')`
  advances the in-slide stage first and only falls through to slide navigation at
  the boundaries. Re-entering the slide resets the stage.
- The slide component is presentational: it receives the stage + handlers and
  toggles CSS classes (`revealed` / `dim` / `focus`, `.staged` on the canvas).
  The reveal timing stays in CSS transitions — faithful to the prototype, no
  re-implementation in motion.

## Validate before you're done (from `apps/web/`)
```
npm run check-types   # next typegen && tsc --noEmit
npm run lint          # eslint --max-warnings 0  (public/** is ignored — static assets)
npm run build
```
Then open `/presentations/ai-feature-intelligence-layer` and compare against the
prototype (open the HTML, and the screenshots in
`public/ai-layer-for-post-release-support/project/screenshots/`).
