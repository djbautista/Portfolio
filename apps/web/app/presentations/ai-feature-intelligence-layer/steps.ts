/**
 * Flattened step map for the deck — the single source of truth for "how many
 * beats does each slide have" and "what is beat N overall".
 *
 * The deck is step-driven: each slide has an internal `stage` (0..MAX) and the
 * companion speaker-notes view ({@link ./notes/page}) needs to address every
 * (slide, stage) pair as one flat list so it can show the matching note and a
 * preview of the next beat. The per-slide MAX_* constants live here (instead of
 * inside `PresentationDeck`) so the deck's keyboard clamps and the flattened
 * list can never drift apart.
 */
import { personaStageCount, slideLabels } from './data';

// Highest internal stage index per slide (0-based). Step count = MAX + 1.
// Title: 0 resting · 1 focus diagram · 2–9 spotlight each post-release bullet ·
// 10 restore · 11 reveal the AI layer.
export const MAX_TITLE_STAGE = 11;
// About: 0 centered · 1 swap Software→Product · 2 column home + right reveal.
export const MAX_ABOUT_STAGE = 2;
// Personas: one identity beat + one beat per timeline step, per persona, then a
// final synthesis beat — see personaStageCount in data.ts.
export const MAX_PERSONA_STAGE = personaStageCount;
// Insight: 0 resting · 1 questions forward · 2 questions fade, insight restored.
export const MAX_INSIGHT_STAGE = 2;
// Solution: 0 thesis alone · 1 thesis docks + diagram reveals.
export const MAX_SOLUTION_STAGE = 1;
// Architecture: 0 chips → 10 feedback loop. Kept as a literal so this module
// stays dependency-free (importable from server route handlers); must match
// ARCH_STAGE.feedback in components/ArchitectureFlow.tsx.
export const MAX_ARCH_STAGE = 10;
// Payoff: 0 Before · 1 After · 2 After compacts + SDLC diagram.
export const MAX_PAYOFF_STAGE = 2;
// Demo: closing interstitial, no internal stages.
export const MAX_DEMO_STAGE = 0;

/** Stable per-slide key, aligned 1:1 with `slideLabels` order. */
export type SlideKey =
  | 'title'
  | 'about'
  | 'personas'
  | 'insight'
  | 'solution'
  | 'architecture'
  | 'payoff'
  | 'demo';

export interface SlideSteps {
  /** slide index, matches PresentationDeck's `index` and slideLabels */
  index: number;
  key: SlideKey;
  /** human label from the slide registry */
  name: string;
  /** number of addressable beats on this slide (maxStage + 1) */
  stepCount: number;
}

const MAX_STAGE_BY_KEY: Record<SlideKey, number> = {
  title: MAX_TITLE_STAGE,
  about: MAX_ABOUT_STAGE,
  personas: MAX_PERSONA_STAGE,
  insight: MAX_INSIGHT_STAGE,
  solution: MAX_SOLUTION_STAGE,
  architecture: MAX_ARCH_STAGE,
  payoff: MAX_PAYOFF_STAGE,
  demo: MAX_DEMO_STAGE,
};

const SLIDE_KEYS: SlideKey[] = [
  'title',
  'about',
  'personas',
  'insight',
  'solution',
  'architecture',
  'payoff',
  'demo',
];

/** Ordered registry: one entry per slide, with its beat count. */
export const SLIDE_STEPS: SlideSteps[] = SLIDE_KEYS.map((key, index) => ({
  index,
  key,
  name: slideLabels[index] ?? key,
  stepCount: MAX_STAGE_BY_KEY[key] + 1,
}));

export interface FlatStep {
  /** 0-based position across the entire deck */
  global: number;
  /** slide index */
  slide: number;
  /** stage within that slide */
  stage: number;
  key: SlideKey;
  slideName: string;
  /** 1-based step within the slide (for "step 3 / 11" display) */
  stepInSlide: number;
  /** total beats on this slide */
  totalInSlide: number;
}

/** Every (slide, stage) beat in order — the flat list the notes view walks. */
export const flatSteps: FlatStep[] = SLIDE_STEPS.flatMap((slide) =>
  Array.from({ length: slide.stepCount }, (_, stage) => ({
    global: 0, // filled in below once the full list order is known
    slide: slide.index,
    stage,
    key: slide.key,
    slideName: slide.name,
    stepInSlide: stage + 1,
    totalInSlide: slide.stepCount,
  })),
).map((step, global) => ({ ...step, global }));

/** Total addressable beats in the deck. */
export const TOTAL_STEPS = flatSteps.length;

/** Per-slide global offset of stage 0 — the prefix sum of step counts. */
const SLIDE_OFFSET: number[] = (() => {
  const offsets: number[] = [];
  let running = 0;
  for (const slide of SLIDE_STEPS) {
    offsets[slide.index] = running;
    running += slide.stepCount;
  }
  return offsets;
})();

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Map a (slide, stage) pair to its global beat index (clamped to valid range). */
export function toGlobal(slide: number, stage: number): number {
  const s = SLIDE_STEPS[clamp(slide, 0, SLIDE_STEPS.length - 1)];
  if (!s) return 0;
  return (SLIDE_OFFSET[s.index] ?? 0) + clamp(stage, 0, s.stepCount - 1);
}

/** Map a global beat index back to its FlatStep (clamped to valid range). */
export function fromGlobal(global: number): FlatStep {
  const step = flatSteps[clamp(global, 0, TOTAL_STEPS - 1)];
  // flatSteps always has ≥1 entry, so [0] is the safe terminal fallback.
  return step ?? flatSteps[0] ?? FALLBACK_STEP;
}

const FALLBACK_STEP: FlatStep = {
  global: 0,
  slide: 0,
  stage: 0,
  key: 'title',
  slideName: 'Title',
  stepInSlide: 1,
  totalInSlide: 1,
};
