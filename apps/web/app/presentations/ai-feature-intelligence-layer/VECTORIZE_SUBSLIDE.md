# The vectorize sub-slide — remaining work

The architecture slide (slide 6) has a **Prezi camera push-in** that flies the
viewport into the red database icon and lands on a full-screen red sub-slide.
The *motion and the staging are done*. **What's left is the content** — the
non-technical explainer of how documents become searchable memory.

Read [`CLAUDE.md`](./CLAUDE.md) first for the deck's guardrails (data-driven
nodes, route-scoped CSS, `@/…` imports) and [`ANIMATIONS.md`](./ANIMATIONS.md)
for the motion rules. This file is the single source of truth for finishing the
sub-slide.

---

## 1. What already exists (don't rebuild this)

| Piece | File | Role |
| --- | --- | --- |
| Reveal stages | `components/ArchitectureFlow.tsx` → `ARCH_STAGE` | `chips:0 · featureMemory:1 · vectorize:2 · restored:3 · triage:4 · feedback:5` |
| Group→stage map | `components/ArchitectureFlow.tsx` → `GROUP_REVEAL_STAGE` | keeps box `group` values semantic (1/2/3) while the inserted `vectorize` step shifts when columns 2/3 reveal |
| Camera + zoom math | `slides/ArchitectureSlide.tsx` → `CAMERA_ZOOM`, `.arch-camera` | inverse transform that centers + fills the DB at `CAM_SCALE = 36` |
| The red sub-slide | `components/VectorizeOverlay.tsx` | the destination panel the camera lands on |
| Styling + timing | `presentation.css` → `.arch-camera`, `.arch-vectorize`, `.vz-*` | in-curve mirrors the out-curve; red fades in on the late acceleration |

**Enter/exit today:** the deck (`PresentationDeck.tsx`) owns `archStage`; the
sub-slide is live **only at `stage === ARCH_STAGE.vectorize` (2)**. From the
Feature Memory column (1) `→` zooms in. `→` again lands on `restored` (3) — the
camera zooms back out and the sub-slide closes, leaving the base diagram (just
column 1); only the *next* `→` reveals the Triage column (4). This decoupling is
deliberate: the zoom-out is its own beat, never entangled with a column reveal.
`MAX_ARCH_STAGE` auto-derives from `ARCH_STAGE.feedback`, so nav already accounts
for the extra steps — **don't touch `PresentationDeck`** unless you add
*internal* sub-steps (see §4).

---

## 2. Where to write the content

All copy goes in **`components/VectorizeOverlay.tsx`**, inside `.vz-content`.
Today it's a placeholder:

```tsx
<div className="vz-content">
  <p className="vz-eyebrow">Inside the Feature Knowledge Base</p>
  <h2 className="vz-title">How documents become searchable memory</h2>
</div>
```

**Follow the deck's data-driven rule** (CLAUDE.md → "Repeated visual nodes are
data-driven"): put the explainer beats as a typed array in **`data.ts`** (e.g.
`vectorizeBeats: { key, title, body, … }[]`) and `.map()` over them in the
overlay. Don't hand-repeat near-identical JSX.

**Styling** lives in `presentation.css` under the `.afil-architecture
.arch-vectorize` / `.vz-*` block (already scoped). Reuse the tokens — white/red
text on the red field needs care:

- The background is flat `var(--red)` (`#F22F46`). Body text must be **white or
  near-white** (`#fff`, `rgba(255,255,255,.82)`); never `--ink-*` (they're tuned
  for the dark slides and vanish on red).
- Match the deck's type scale: `--font-display` (Space Grotesk) for titles,
  `--font-body` (Manrope) for body. See `.vz-title` / `.vz-eyebrow` for sizes.
- Coordinates are still on the 1920×1080 plane. **Heed `ANIMATIONS.md`**: don't
  wrap absolutely-positioned children in a *new* `transform`. (The `.arch-camera`
  transform is an intentional, isolated exception — it's `inset:0` and the same
  size as the canvas, so child coordinates resolve unchanged.)

---

## 3. The content to write (the actual explainer)

Audience: **non-technical** (support, PMs, leadership). Goal: make "vectorized
documents in a database + retrieval" feel obvious. Lead with analogies, keep the
jargon as labels on top of the intuition. Suggested beats:

**Beat 1 — Documents become "meaning coordinates" (embeddings / vectorization).**
Every artifact (PRD, ticket, runbook, code comment) is turned into a list of
numbers — an *embedding* — that captures its **meaning**, not its keywords.
Things that mean similar things get similar numbers, so they sit close together
on a giant "map of meaning." Analogy: every document gets a pin on a map where
related topics are neighbors. (Mention: long docs are first **chunked** into
passages, then each chunk is embedded.)

**Beat 2 — Why this unlocks relevance ("Attention Is All You Need").**
The 2017 Transformer paper ("Attention Is All You Need") is why models can weigh
*which words matter* for a given question — **attention**. The practical payoff
once docs are vectorized and stored: at question time we **retrieve only the
few relevant chunks** and hand just those to the model, instead of dumping every
document. It's the difference between "read the whole wiki" and "a librarian
who instantly pulls the 3 pages you need." (Motivation: models have a limited
**context window** — you can't and shouldn't feed them everything.)

**Beat 3 — RAG: Retrieval-Augmented Generation (the open-book exam).**
The pattern the whole layer runs on:
1. **Embed the question** the same way the documents were embedded.
2. **Search** the vector database for the closest chunks (*semantic search* —
   by meaning, not keyword match).
3. **Hand those chunks + the question** to the LLM as context.
4. The LLM **answers grounded in the retrieved evidence**, with citations and a
   confidence signal.
Why it matters (the close): fewer hallucinations (answers are grounded), always
**current** (update the index, not the model — no retraining), and **traceable**
(every answer links back to its sources). This is exactly the Knowledge Base ⇄
RAG hop drawn in the diagram.

**Optional / if room:** semantic vs keyword search in one line; the vector index
& similarity (cosine distance) as "how 'close' is measured"; freshness =
re-index, don't retrain.

Keep total reading load light — this is a spoken-over slide, not a wall of text.
3 short beats with a headline + one or two lines each is the target.

---

## 4. How to enter/exit *properly* if the content needs multiple reveals

The sub-slide is currently **one deck stage**. If beats 1→2→3 should reveal one
at a time (recommended for a talk), make each beat its own deck stage rather
than re-implementing a controller inside the slide — stay consistent with the
deck-owned pattern. Do this:

1. **Add stages** in `ARCH_STAGE` (`ArchitectureFlow.tsx`) — keep `restored`
   *after* the beats so the zoom-out stays its own decoupled step, e.g.:
   ```ts
   chips: 0, featureMemory: 1,
   vectorize: 2, vectorizeAttention: 3, vectorizeRag: 4,
   restored: 5, triage: 6, feedback: 7,
   ```
2. **Nothing to re-point in `GROUP_REVEAL_STAGE`** — it references
   `ARCH_STAGE.triage` / `.feedback` by name, so the column reveals follow the
   renumbering automatically (the map keeps box `group` values untouched —
   that's the whole point of it).
3. In `ArchitectureSlide.tsx`, make the camera/overlay live for the **whole
   range**, and pass the sub-step in:
   ```ts
   const vzStep = stage - ARCH_STAGE.vectorize;            // 0,1,2 within the sub-slide
   const inVectorize = vzStep >= 0 && stage <= ARCH_STAGE.vectorizeRag;
   const cameraStyle = inVectorize ? { transform: CAMERA_ZOOM } : undefined;
   // <div className={`arch-camera${inVectorize ? ' zoomed' : ''}`} …>
   // <VectorizeOverlay active={inVectorize} step={vzStep} />
   ```
   The camera stays parked at full zoom across the whole range; only the content
   changes — so beats cross-fade **without** re-zooming between them. Good.
4. In `VectorizeOverlay.tsx`, take a `step` prop and reveal beats with
   `step >= i` (opacity via CSS, mirroring `ArchitectureFlow`'s `shownAt`).
5. `MAX_ARCH_STAGE` still auto-derives from `ARCH_STAGE.feedback` — **no
   `PresentationDeck` change needed.** Re-entering slide 6 resets `archStage` to
   0 already.

**Guardrails for the exit/return:** the overlay must be `visibility: hidden`
when inactive (it already is) so the red never sits over the diagram on stages
outside the range; and the camera transform must return to identity (no
`zoomed` class) so the diagram is interactive again. Keep the asymmetric
easing — in = `cubic-bezier(.7,0,.84,0)`, out = `var(--ease)` — it's the agreed
feel.

---

## 5. Validate before you're done (from `apps/web/`)

```
npm run check-types
npm run lint
npm run build
```

Then open `/presentations/ai-feature-intelligence-layer`, arrow to slide 6,
step into the zoom, and check: copy is legible on red, beats reveal in order,
`←`/`→` enter and exit cleanly with the camera returning to the full diagram.
