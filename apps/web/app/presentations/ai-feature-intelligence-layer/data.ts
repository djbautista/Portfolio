/**
 * Semantic content for the "AI Feature Intelligence Layer" deck.
 *
 * Every repeated visual node from the prototype (pipeline stages, branch curves,
 * persona journey steps, scattered insight questions) is modeled here so the
 * slide components map over data instead of hand-repeating JSX. Pixel
 * coordinates are kept on the 1920×1080 plane, exactly as in the source HTML.
 */

export const deckMeta = {
  title: 'AI Feature Intelligence Layer',
  description:
    'Turning SDLC artifacts into operational knowledge after release.',
} as const;

// ---------------------------------------------------------------------------
// Slide 1 — Title + SDLC pipeline diagram
// ---------------------------------------------------------------------------

export const titleSlide = {
  eyebrow: 'Staff Software Engineer · Final Presentation',
  titleLead: 'AI Feature ',
  titleAccent: 'Intelligence',
  titleTrail: ' Layer',
  subtitle: 'Turning SDLC artifacts into operational knowledge after release.',
  footer:
    'A proposal to reduce post-release friction across Support, Product, Design, QA, and Engineering.',
} as const;

/** Pre-release pipeline stages along the y=600 baseline. */
export interface SdlcStage {
  id: string;
  label: string;
  cx: number;
  /** top of the text label (px) */
  labelTop: number;
  /** emphasized "Release" terminal node */
  emphasized?: boolean;
}

export const sdlcStages: SdlcStage[] = [
  { id: 's0', label: 'Discovery', cx: 170, labelTop: 636 },
  { id: 's1', label: 'Design', cx: 368, labelTop: 636 },
  { id: 's2', label: 'Engineering', cx: 566, labelTop: 636 },
  { id: 's3', label: 'QA', cx: 764, labelTop: 636 },
  { id: 's4', label: 'Release', cx: 960, labelTop: 646, emphasized: true },
];

/** Post-release operation nodes at x=1300, fed by the AI layer spine. */
export interface PostReleaseNode {
  id: string;
  label: string;
  cy: number;
  /** cubic branch path from the spine junction (1130,600) to this node */
  branch: string;
}

export const postReleaseNodes: PostReleaseNode[] = [
  { id: 'b0', label: 'Support', cy: 322, branch: 'M1130 600 C 1210 600, 1230 322, 1300 322' },
  { id: 'b1', label: 'Docs', cy: 405, branch: 'M1130 600 C 1215 600, 1235 405, 1300 405' },
  { id: 'b2', label: 'QA', cy: 487, branch: 'M1130 600 C 1220 600, 1240 487, 1300 487' },
  { id: 'b3', label: 'Product Feedback', cy: 561, branch: 'M1130 600 C 1225 600, 1245 561, 1300 561' },
  { id: 'b4', label: 'Onboarding', cy: 639, branch: 'M1130 600 C 1225 600, 1245 639, 1300 639' },
  { id: 'b5', label: 'Incident Response', cy: 713, branch: 'M1130 600 C 1220 600, 1240 713, 1300 713' },
  { id: 'b6', label: 'Ownership Transfer', cy: 795, branch: 'M1130 600 C 1215 600, 1235 795, 1300 795' },
  { id: 'b7', label: 'Future Development', cy: 878, branch: 'M1130 600 C 1210 600, 1230 878, 1300 878' },
];

// ---------------------------------------------------------------------------
// Slide 2 — About
// ---------------------------------------------------------------------------

export const aboutSlide = {
  eyebrow: 'About Me',
  name: 'David Bautista',
  role: { lead: 'Senior', swapSoft: 'Software', swapProd: 'Product', trail: 'Engineer' },
  statementLead: 'Build with ',
  statementHl: 'impact',
  formulaInputs: ['Curiosity', 'Ownership', 'Attention to Detail'],
  formulaOutput: 'great products',
  footer: '02 — About',
  portrait: { src: '/profile.jpg', alt: 'David Bautista' },
} as const;

// ---------------------------------------------------------------------------
// Slide 3 — Persona journeys
// ---------------------------------------------------------------------------

export interface PersonaMetric {
  label: string;
  value: string;
  caption: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  sub?: string;
  avatar: { src: string; alt: string };
  /** five timeline steps; the last is the journey end-state */
  steps: string[];
  metric?: PersonaMetric;
}

const AVATAR_BASE = '/ai-layer-for-post-release-support/project/assets';

export const personaSlide = {
  eyebrow: 'The Problem',
  titleLead: 'One problem, ',
  titleHl: 'three perspectives',
  footer: '03 — The Problem',
} as const;

export const personas: Persona[] = [
  {
    id: 'peter',
    name: 'Peter',
    role: 'End User',
    sub: '6 years on the same feature',
    avatar: { src: `${AVATAR_BASE}/Peter.png`, alt: 'Peter' },
    steps: ['Old workflow', 'Product change', 'Broken muscle memory', 'Confusion', 'Raises an issue'],
    // Per spec: the prototype shows a metric end-cap for Peter only.
    metric: {
      label: 'Directly impacts',
      value: 'M.T.T.Respond',
      caption: 'Mean time to respond',
    },
  },
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Product Designer',
    avatar: { src: `${AVATAR_BASE}/Rachel.png`, alt: 'Rachel' },
    steps: ['User research', 'Discovery insights', 'Handoff sessions', 'Context dilution', 'Clarification loops'],
  },
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'Engineer',
    avatar: { src: `${AVATAR_BASE}/Daniel.png`, alt: 'Daniel' },
    steps: ['Feature shipped', 'Time passes', 'Support request', 'Context reconstruction', 'Interruption'],
  },
];

// ---------------------------------------------------------------------------
// Slide 4 — Core insight
// ---------------------------------------------------------------------------

/** Orbiting "question symptoms"; x/y are center anchors on the 1920×1080 plane. */
export interface InsightQuestion {
  id: string;
  label: string;
  x: number;
  y: number;
  /** entrance order index (drives staggered fade-in) */
  order: number;
}

export const insightQuestions: InsightQuestion[] = [
  { id: 'q1', label: 'What changed?', x: 960, y: 228, order: 0 },
  { id: 'q0', label: 'Bug or expected?', x: 600, y: 292, order: 1 },
  { id: 'q2', label: 'Why this decision?', x: 1320, y: 292, order: 2 },
  { id: 'q5', label: 'Escalate to Eng?', x: 256, y: 452, order: 3 },
  { id: 'q3', label: 'Who owns this?', x: 1664, y: 452, order: 4 },
  { id: 'q6', label: 'Docs gap or UX gap?', x: 298, y: 656, order: 5 },
  { id: 'q4', label: 'How to troubleshoot?', x: 1628, y: 656, order: 6 },
  { id: 'q7', label: 'Config issue or regression?', x: 960, y: 820, order: 7 },
];

export const insightSlide = {
  eyebrow: 'The Problem',
  titleLead: 'One problem, ',
  titleHl: 'three perspectives',
  mainLead: 'Feature knowledge is created during the SDLC, but it is ',
  mainHl: 'not operationalized after release',
  mainTrail: '.',
  support:
    'After release, teams rely on fragmented artifacts and human memory to answer questions, support users, transfer ownership, improve docs, triage issues, and feed learnings back into the product.',
  footer: '04 — The Core Insight',
} as const;

// ---------------------------------------------------------------------------
// Slide 5 — Systematic Solution (funnel → AI layer → fan diagram)
// ---------------------------------------------------------------------------

export const solutionSlide = {
  eyebrow: 'The Solution',
  titleLead: 'Systematic ',
  titleHl: 'Solution',
  thesisLead: 'An AI Feature Intelligence Layer that turns SDLC artifacts into ',
  thesisHl: 'reusable operational knowledge',
  thesisTrail: '.',
  footer: '05 — The Solution',
} as const;

/**
 * A labeled node on either side of the diagram. Vertical position is derived in
 * `SolutionFlow` from the array order, so the data stays free of pixel noise:
 * inputs start at y=452 (step 47), outputs at y=470 (step 85), matching the
 * prototype's funnel/fan geometry.
 */
export interface SolutionNode {
  label: string;
}

/** Fragmented SDLC artifacts that funnel into the layer (top → bottom). */
export const solutionInputs: SolutionNode[] = [
  { label: 'PRs' },
  { label: 'Tickets' },
  { label: 'Specs' },
  { label: 'Figma' },
  { label: 'Docs' },
  { label: 'Test cases' },
  { label: 'Release notes' },
  { label: 'Incidents' },
  { label: 'Observability links' },
];

/** Reusable operational knowledge the layer fans back out (top → bottom). */
export const solutionOutputs: SolutionNode[] = [
  { label: 'Support' },
  { label: 'Triage' },
  { label: 'Handoffs' },
  { label: 'Onboarding' },
  { label: 'Continuous improvement' },
];

/**
 * The transformation caption row beneath the diagram. `x` is the center anchor
 * on the 1920×1080 plane; `layer` flags the central (red, emphasized) caption.
 * Arrows between captions are derived at their midpoints in `SolutionFlow`.
 */
export interface SolutionZone {
  label: string;
  x: number;
  layer?: boolean;
}

export const solutionZones: SolutionZone[] = [
  { label: 'Fragmented artifacts', x: 340 },
  { label: 'AI Feature Intelligence Layer', x: 960, layer: true },
  { label: 'Reusable operational knowledge', x: 1580 },
];

// ---------------------------------------------------------------------------
// Deck-level slide registry
// ---------------------------------------------------------------------------

export const slideLabels = ['Title', 'About', 'Personas', 'Insight', 'Solution'] as const;
export const SLIDE_COUNT = slideLabels.length;
