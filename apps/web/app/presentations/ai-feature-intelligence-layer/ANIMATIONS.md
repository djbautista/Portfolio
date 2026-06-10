# Animating slides — the `FadeIn` recipe

How to add subtle entrance animation to slide elements. Read
[`CLAUDE.md`](./CLAUDE.md) first for the deck's guardrails; this file is the
practical how-to for motion specifically.

> **TL;DR** — wrap any slide element in `<FadeIn>`. Stagger siblings with
> `delay`. Don't reach for `motion` directly, and don't animate `transform`.
> `InsightSlide.tsx` is the worked reference.

## The one hard rule: opacity only, never transform

Every slide lives on the absolutely-positioned **1920×1080 plane** (see
`CLAUDE.md` → "The 1920×1080 plane"). Almost every element is
`position: absolute` with `top` / `bottom` / `left` coordinates lifted 1:1 from
the prototype.

That makes `transform`-based motion (fade-**up**, slide-in, scale) a trap. CSS
rule: **any element with a `transform` becomes the containing block for its
absolutely-positioned descendants.** A wrapper that animates `y` therefore
"captures" the absolute child — which then positions against the zero-height
wrapper instead of the canvas. Concretely, a footer pinned with `bottom: 74px`
jumps to the *top* of the slide. The layout silently breaks.

**Opacity has no such side effect** and multiplies cleanly through the wrapper
(so a `0.3`-opacity element fading from a wrapper still lands at `0.3`). So:

- ✅ animate `opacity`
- ❌ animate `transform` / `x` / `y` / `scale` / `rotate` on anything wrapping an
  absolutely-positioned element (i.e. almost everything in this deck)

If you ever add an element that is in **normal flow** (rare here), a small
`y` fade-up is safe *for that element only* — but prefer to keep one consistent
primitive.

## The primitive: `<FadeIn>`

`components/FadeIn.tsx` — the only thing you need for entrance motion.

```tsx
import { FadeIn } from '@/app/presentations/ai-feature-intelligence-layer/components/FadeIn';

<FadeIn>
  <h2 className="i-title">…</h2>
</FadeIn>
```

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | The element to fade in. |
| `delay` | `number` (seconds) | `0` | When the fade starts. Use to stagger. |

It already handles the two things that are easy to get wrong:

- **Resting state is fully visible.** It animates *to* `opacity: 1`, never away
  from it.
- **Reduced motion is respected.** Via `useReducedMotion`, `initial` becomes
  `false` so the element renders at its final state with no animation — matching
  the global `prefers-reduced-motion` gate at the bottom of `presentation.css`.

It uses the deck's `--ease` curve `[0.16, 1, 0.3, 1]` and a `0.5s` duration so it
matches the slide-level crossfade in `PresentationDeck`.

## Staggering a cascade

Pass increasing `delay` values to sequence elements. The reference cascade in
`InsightSlide.tsx`:

```tsx
<FadeIn>{/* eyebrow */}</FadeIn>            // delay 0    — arrives first
<FadeIn delay={0.08}>{/* title */}</FadeIn>
<FadeIn delay={0.2}>{/* central anchor */}</FadeIn>
<FadeIn delay={0.5}>{/* footer */}</FadeIn>  // arrives last
```

Order by **visual hierarchy**, not DOM order: bring the anchor in early and let
secondary elements trickle in after.

### Staggering a data-driven `.map()`

For repeated nodes (the convention is to `.map()` over a typed array in
`data.ts`), derive the delay from the index:

```tsx
{insightQuestions.map((q, i) => (
  <FadeIn key={q.id} delay={0.4 + i * 0.06}>
    <div className="i-q" style={{ left: q.x, top: q.y }}>
      <span className="qd" />
      {q.label}
    </div>
  </FadeIn>
))}
```

`base + i * step` — `0.06`s steps read as a smooth trickle; widen for a more
deliberate reveal.

## How it composes with the deck

The whole slide *already* crossfades on navigation — `PresentationDeck` wraps the
active slide in a `motion.div` keyed on the slide index. `FadeIn` layers a
per-element cascade *on top of* that. Two consequences:

- **It replays on re-entry.** Because the slide `motion.div` is keyed on `index`,
  it remounts every time you navigate to the slide, so the cascade fires each
  visit. That's the intended deck behavior — don't try to "fix" it.
- **Keep delays short.** The slide crossfade is `0.4s`; total cascade delays much
  beyond ~`0.6s` start to feel laggy against it.

## Do / don't

- **Do** wrap with `<FadeIn>`. **Don't** `import { motion }` into a slide — the
  one place `motion` is used directly is `PresentationDeck`.
- **Don't** add CSS `@keyframes` / `transition` for entrance motion. Motion is
  `framer-motion` only (a `CLAUDE.md` hard rule); the only hand-written CSS
  transitions are the persona slide's staged reveal, which is faithful to the
  prototype.
- **Don't** install an animation library. Tailwind v4, `next/font`, and
  `framer-motion` are the entire allowed surface.
- **Do** keep motion as *polish*: the resting state must be fully legible with
  motion off.

## Validate before you're done (from `apps/web/`)

```
npm run check-types
npm run lint
```

Then open `/presentations/ai-feature-intelligence-layer`, arrow to the slide, and
confirm: the cascade reads well, nothing shifted position (the opacity-only
rule), and it still looks right with reduced motion on
(macOS: System Settings → Accessibility → Display → Reduce motion).
