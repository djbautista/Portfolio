# Adding a slide to the deck

A step-by-step recipe for migrating one new slide from the Claude Design HTML
prototype into this React deck. Read [`CLAUDE.md`](./CLAUDE.md) first for the
architecture and the hard rules. The running example below adds a hypothetical
**5th slide** with variant key `solution` — substitute your own.

> Migrate **one slide at a time** and validate. Don't batch several slides into a
> single pass; small diffs are easier to check against the prototype.

---

## 0. Read the prototype slide

The new slide already exists in the prototype as a
`<section class="slide xyz-slide" data-label="…">` inside the HTML at
`public/ai-layer-for-post-release-support/project/AI Feature Intelligence Layer.html`.
Read **three** things from it:

1. **Markup** — the structure, copy, and any inline-positioned elements
   (`style="left:…;top:…"`).
2. **Its scoped CSS block** — the `section.xyz-slide { … }` rules and everything
   namespaced under `.xyz-slide …` in the `<style>` block. These are your exact
   pixel values, fonts, and colors.
3. **Any repeated nodes** — lists of cards/steps/labels you'll turn into a data
   array.

Ignore the `.intro`/`.in` entrance rules, the `@media print` staged-reveal
plumbing, and the vanilla `<script>` controllers — those don't migrate.

---

## 1. `data.ts` — content + geometry + registry

Add a content object (and typed arrays for any repeated nodes). Keep copy and
coordinates here, not in JSX.

```ts
// ---- Slide 5 — Solution ----
export interface SolutionPillar {
  id: string;
  title: string;
  body: string;
}

export const solutionSlide = {
  eyebrow: 'The Solution',
  titleLead: 'A layer that ',
  titleHl: 'remembers',
  footer: '05 — The Solution',
} as const;

export const solutionPillars: SolutionPillar[] = [
  { id: 'capture', title: 'Capture', body: '…' },
  { id: 'recall',  title: 'Recall',  body: '…' },
  { id: 'feedback', title: 'Feedback', body: '…' },
];
```

Then register it for navigation (this is what drives the counter + dots):

```ts
export const slideLabels = ['Title', 'About', 'Personas', 'Insight', 'Solution'] as const;
```

`SLIDE_COUNT` updates itself.

---

## 2. `SlideFrame.tsx` — extend the variant union

```ts
export type SlideVariant = 'title' | 'about' | 'persona' | 'insight' | 'solution';
```

That's all — `SlideFrame` already renders `.afil-slide <variant>` and
`.afil-canvas afil-<variant>` from the prop.

---

## 3. `presentation.css` — background wash + scoped slide styles

Add the per-slide background gradient (copy the prototype's
`section.xyz-slide { background: … }`):

```css
.afil-slide.solution {
  background:
    radial-gradient(70% 60% at 50% 12%, rgba(242, 47, 70, 0.07) 0%, rgba(242, 47, 70, 0) 55%),
    radial-gradient(100% 100% at 50% 0%, #0e1117 0%, var(--bg) 60%);
}
```

Then port the slide's content CSS, **namespaced under `.afil-solution`**, while
you translate it:

- Prototype `.xyz-slide .foo { … }` → `.afil-solution .foo { … }`.
- Keep pixel values as-is (same 1920×1080 plane).
- Swap literal colors for tokens (`#F22F46` → `var(--red)`, etc.) where the
  prototype used its `:root` vars.
- Fonts: `'Space Grotesk', sans-serif` → `var(--font-display)`;
  `'Manrope', …` → `var(--font-body)`.
- Drop `.intro`/`.in`, `transition-delay` entrance staggers, and `@media print`
  reveal rules. Keep only transitions you actually drive from React state.

---

## 4. `slides/SolutionSlide.tsx` — the component

Use `SlideFrame`, map over the data, and pull repeated structure into a
`components/` piece if it's non-trivial. **Import parents via the `@/…` alias.**

```tsx
import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { solutionPillars, solutionSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

export function SolutionSlide() {
  return (
    <SlideFrame variant="solution">
      <p className="s-eyebrow">
        <span className="dot" />
        <span>{solutionSlide.eyebrow}</span>
      </p>
      <h2 className="s-title">
        {solutionSlide.titleLead}
        <span className="hl">{solutionSlide.titleHl}</span>
      </h2>

      <div className="s-pillars">
        {solutionPillars.map((pillar) => (
          <article key={pillar.id} className="s-pillar">
            <h3 className="s-pillar-title">{pillar.title}</h3>
            <p className="s-pillar-body">{pillar.body}</p>
          </article>
        ))}
      </div>

      <div className="s-footer">
        <span className="bar" />
        <span>{solutionSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
```

For data-driven absolute positions, pass numbers through `style` (serialized to
px), exactly like `InsightSlide`/`SDLCFlow`:

```tsx
<div className="s-node" style={{ left: node.x, top: node.y }}>…</div>
```

---

## 5. `PresentationDeck.tsx` — register the slide

Import it and add a `case` to `renderSlide()` at the new index:

```tsx
import { SolutionSlide } from './slides/SolutionSlide';

// inside renderSlide():
case 4:
  return <SolutionSlide />;
```

That's the whole wiring — nav (prev/next, counter, dots, keyboard) now includes
the new slide because it reads `slideLabels` / `SLIDE_COUNT`.

### If the slide is interactive
Mirror the persona pattern instead of inventing a new mechanism:
- Own the step/reveal state in `PresentationDeck`.
- Make `navigate('next'|'prev')` advance the in-slide step first and fall
  through to slide change only at the boundaries; reset on (re-)entry.
- Pass the state + handlers down; the slide toggles CSS classes. Keep reveal
  timing in CSS transitions.

---

## 6. Validate (from `apps/web/`)

```
npm run check-types
npm run lint
npm run build
```

Fix every error/warning. Then open
`/presentations/ai-feature-intelligence-layer`, navigate to the new slide, and
compare side-by-side with the prototype HTML + its screenshots. Check typography
scale, colors, spacing, layout composition, and the 16:9 proportions — visual
parity is priority #1.

---

## Checklist

- [ ] Read the prototype slide's markup + scoped CSS + repeated nodes.
- [ ] `data.ts`: content object, typed arrays, **label added to `slideLabels`**.
- [ ] `SlideFrame.tsx`: variant added to `SlideVariant`.
- [ ] `presentation.css`: `.afil-slide.<variant>` background + content CSS under `.afil-<variant>` (tokens + font vars, entrance machinery dropped).
- [ ] `slides/<Name>Slide.tsx`: data-driven, `@/…` imports, repeated structure extracted to `components/` if needed.
- [ ] `PresentationDeck.tsx`: imported + `case` added to `renderSlide()`.
- [ ] Interactive? State owned by the deck, boundary handoff, reset on entry.
- [ ] `check-types`, `lint`, `build` all green; visually matches the prototype.
- [ ] No `dangerouslySetInnerHTML`, no prototype JS, no new deps, motion subtle + reduced-motion safe.
