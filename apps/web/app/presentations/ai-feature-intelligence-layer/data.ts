/**
 * Semantic content for the "AI Feature Intelligence Layer" deck.
 *
 * Every repeated visual node from the prototype (pipeline stages, branch curves,
 * persona journey steps, scattered insight questions) is modeled here so the
 * slide components map over data instead of hand-repeating JSX. Pixel
 * coordinates are kept on the 1920×1080 plane, exactly as in the source HTML.
 */

export const deckMeta = {
  title: "AI Feature Intelligence Layer",
  description: "Turning SDLC artifacts into operational knowledge after release."
} as const;

// ---------------------------------------------------------------------------
// Slide 1 — Title + SDLC pipeline diagram
// ---------------------------------------------------------------------------

export const titleSlide = {
  eyebrow: "Staff Software Engineer · Final Presentation",
  titleLead: "AI Feature ",
  titleAccent: "Intelligence",
  titleTrail: " Layer",
  subtitle: "Turning SDLC artifacts into operational knowledge after release.",
  footer: "A proposal to reduce post-release friction across Support, Product, Design, QA, and Engineering."
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
  { id: "s0", label: "Discovery", cx: 170, labelTop: 636 },
  { id: "s1", label: "Design", cx: 368, labelTop: 636 },
  { id: "s2", label: "Engineering", cx: 566, labelTop: 636 },
  { id: "s3", label: "QA", cx: 764, labelTop: 636 },
  { id: "s4", label: "Release", cx: 960, labelTop: 646, emphasized: true }
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
  { id: "b0", label: "Support", cy: 322, branch: "M1130 600 C 1210 600, 1230 322, 1300 322" },
  { id: "b1", label: "Docs", cy: 405, branch: "M1130 600 C 1215 600, 1235 405, 1300 405" },
  { id: "b2", label: "QA", cy: 487, branch: "M1130 600 C 1220 600, 1240 487, 1300 487" },
  { id: "b3", label: "Product Feedback", cy: 561, branch: "M1130 600 C 1225 600, 1245 561, 1300 561" },
  { id: "b4", label: "Onboarding", cy: 639, branch: "M1130 600 C 1225 600, 1245 639, 1300 639" },
  { id: "b5", label: "Incident Response", cy: 713, branch: "M1130 600 C 1220 600, 1240 713, 1300 713" },
  { id: "b6", label: "Ownership Transfer", cy: 795, branch: "M1130 600 C 1215 600, 1235 795, 1300 795" },
  { id: "b7", label: "Future Development", cy: 878, branch: "M1130 600 C 1210 600, 1230 878, 1300 878" }
];

// ---------------------------------------------------------------------------
// Slide 2 — About
// ---------------------------------------------------------------------------

export const aboutSlide = {
  eyebrow: "About Me",
  name: "David Bautista",
  role: { lead: "Senior", swapSoft: "Software", swapProd: "Product", trail: "Engineer" },
  statementLead: "Build with ",
  statementHl: "impact",
  formulaInputs: ["Curiosity", "Ownership", "Attention to Detail"],
  formulaOutput: "Great Products",
  footer: "02 — About",
  portrait: {
    src: "/ai-layer-for-post-release-support/project/assets/about-me.jpg",
    alt: "David Bautista"
  }
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

const AVATAR_BASE = "/ai-layer-for-post-release-support/project/assets";

export const personaSlide = {
  eyebrow: "The Problem",
  titleLead: "One problem, ",
  titleHl: "three perspectives",
  footer: "03 — The Problem"
} as const;

export const personas: Persona[] = [
  {
    id: "peter",
    name: "Peter",
    role: "End User",
    sub: "6 years on the same feature",
    avatar: { src: `${AVATAR_BASE}/Peter.png`, alt: "Peter" },
    steps: ["Old workflow", "Product change", "Broken muscle memory", "Confusion", "Raises an issue"],
    // Per spec: the prototype shows a metric end-cap for Peter only.
    metric: {
      label: "Directly impacts",
      value: "M.T.T.Respond",
      caption: "Mean time to respond"
    }
  },
  {
    id: "rachel",
    name: "Rachel",
    role: "Product Designer",
    avatar: { src: `${AVATAR_BASE}/Rachel.png`, alt: "Rachel" },
    steps: ["User research", "Discovery insights", "Handoff sessions", "Context dilution", "Clarification loops"]
  },
  {
    id: "daniel",
    name: "Daniel",
    role: "Engineer",
    avatar: { src: `${AVATAR_BASE}/Daniel.png`, alt: "Daniel" },
    steps: ["Feature shipped", "Time passes", "Support request", "Context reconstruction", "Interruption"]
  }
];

/**
 * Total reveal beats on the Problem slide. Each persona contributes one identity
 * beat (avatar + name + role) followed by one beat per timeline step, so the
 * story builds one element at a time. Drives the deck's persona-stage clamp.
 */
export const personaStageCount = personas.reduce((n, p) => n + 1 + p.steps.length, 0);

/**
 * Anonymous "everyone else" silhouettes for the slide's final synthesis beat:
 * once all three journeys land, the profiles slide to center and these dimmed
 * persona shapes fade in scattered around them — the three are just a sample.
 * Coordinates are centers on the 1920×1080 plane; opacities/delays are tuned by
 * hand to read as an organic crowd (kept away from the centered trio + chrome).
 */
export interface GhostProfile {
  id: string;
  /** center anchor on the 1920×1080 plane */
  x: number;
  y: number;
  /** chip diameter in px */
  size: number;
  /** resting (dimmed) opacity */
  op: number;
  /** fade-in stagger in seconds */
  delay: number;
}

// The centered trio occupies a horizontal band (≈ x 300–1600, y 400–680), so
// these sit above it, below it, or out in the side margins — never on top of it.
export const ghostProfiles: GhostProfile[] = [
  // top band (between the title and the profiles)
  { id: "g1", x: 400, y: 320, size: 80, op: 0.16, delay: 0.0 },
  { id: "g2", x: 660, y: 290, size: 90, op: 0.18, delay: 0.05 },
  { id: "g3", x: 960, y: 300, size: 86, op: 0.17, delay: 0.09 },
  { id: "g4", x: 1260, y: 296, size: 84, op: 0.16, delay: 0.12 },
  { id: "g5", x: 1530, y: 332, size: 72, op: 0.13, delay: 0.15 },
  // bottom band (between the profiles and the footer/nav)
  { id: "g6", x: 440, y: 820, size: 84, op: 0.16, delay: 0.07 },
  { id: "g7", x: 740, y: 868, size: 82, op: 0.15, delay: 0.11 },
  { id: "g8", x: 1040, y: 880, size: 88, op: 0.17, delay: 0.13 },
  { id: "g9", x: 1340, y: 838, size: 82, op: 0.15, delay: 0.15 },
  { id: "g10", x: 1560, y: 782, size: 70, op: 0.12, delay: 0.17 },
  // outer side margins, level with the profiles
  { id: "g11", x: 222, y: 560, size: 76, op: 0.13, delay: 0.06 },
  { id: "g12", x: 1712, y: 540, size: 76, op: 0.13, delay: 0.16 }
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
  { id: "q1", label: "What changed?", x: 960, y: 228, order: 0 },
  { id: "q0", label: "Bug or expected?", x: 600, y: 292, order: 1 },
  { id: "q2", label: "Why this decision?", x: 1320, y: 292, order: 2 },
  { id: "q5", label: "Escalate to Eng?", x: 256, y: 452, order: 3 },
  { id: "q3", label: "Who owns this?", x: 1664, y: 452, order: 4 },
  { id: "q6", label: "Docs gap or UX gap?", x: 298, y: 656, order: 5 },
  { id: "q4", label: "How to troubleshoot?", x: 1628, y: 656, order: 6 },
  { id: "q7", label: "Config issue or regression?", x: 960, y: 820, order: 7 }
];

export const insightSlide = {
  eyebrow: "The Problem",
  titleLead: "One problem, ",
  titleHl: "three perspectives",
  mainLead: "Feature knowledge is created during the SDLC, but it is ",
  mainHl: "not operationalized after release",
  mainTrail: ".",
  support:
    "After release, teams rely on fragmented artifacts and human memory to answer questions, support users, transfer ownership, improve docs, triage issues, and feed learnings back into the product.",
  footer: "04 — The Core Insight"
} as const;

// ---------------------------------------------------------------------------
// Slide 5 — Systematic Solution (funnel → AI layer → fan diagram)
// ---------------------------------------------------------------------------

export const solutionSlide = {
  eyebrow: "The Solution",
  titleLead: "Systematic ",
  titleHl: "Solution",
  thesisLead: "An AI Feature Intelligence Layer that turns SDLC artifacts into ",
  thesisHl: "reusable operational knowledge",
  thesisTrail: ".",
  footer: "05 — The Solution"
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
  { label: "PRs" },
  { label: "Tickets" },
  { label: "Specs" },
  { label: "Figma" },
  { label: "Docs" },
  { label: "Test cases" },
  { label: "Release notes" },
  { label: "Incidents" },
  { label: "Observability links" }
];

/** Reusable operational knowledge the layer fans back out (top → bottom). */
export const solutionOutputs: SolutionNode[] = [
  { label: "Support" },
  { label: "Triage" },
  { label: "Handoffs" },
  { label: "Onboarding" },
  { label: "Continuous improvement" }
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
  { label: "Fragmented artifacts", x: 340 },
  { label: "AI Feature Intelligence Layer", x: 960, layer: true },
  { label: "Reusable operational knowledge", x: 1580 }
];

// ---------------------------------------------------------------------------
// Slide 6 — System architecture (three capability lanes, one intelligence layer)
// ---------------------------------------------------------------------------

export const architectureSlide = {
  eyebrow: "System Design",
  titleLead: "Three capabilities, one ",
  titleHl: "intelligence layer",
  /** top-right qualities note, separated by red middots */
  note: ["Permission-aware", "RAG-first", "Evidence-backed"],
  footer: "06 — System Design"
} as const;

/**
 * The red full-screen explainer the Prezi camera lands on after pushing into the
 * Feature Knowledge Base. Three beats, each its own deck sub-step
 * (ARCH_STAGE.vectorize → vectorizeMap → vectorizeRag), cross-faded while the
 * camera stays parked: the motivation (why not just ask the model), the
 * mechanism (documents → a searchable map of meaning), and the payoff (RAG).
 * Audience is non-technical — lead with the analogy, keep jargon as labels.
 */
export interface VectorizeBeat {
  key: "why" | "map" | "rag";
  eyebrow: string;
  title: string;
  /**
   * background field for the beat; defaults to the landing red. `blue` is the
   * meaning-map's deep Twilio field; `dark` is the near-black field the RAG
   * pipeline diagram sits on (its navy nodes need a dark ground to read).
   */
  theme?: "blue" | "dark";
}

/**
 * The RAG beat's content: a full left-to-right pipeline diagram
 * (sources → Vector DB → Top-K chunks → LLM → grounded response) rendered by
 * `<RagPipeline/>`. It owns its own title + footer, so the shared `vz-head` is
 * skipped for this beat — copy lives here, geometry lives in `presentation.css`.
 */
export interface RagSource {
  id: string;
  label: string;
  icon: "jira" | "pr" | "spec" | "release" | "docs" | "support" | "observability";
}

export const ragSources: RagSource[] = [
  { id: "jira", label: "Jira tickets", icon: "jira" },
  { id: "pr", label: "PRs", icon: "pr" },
  { id: "spec", label: "Product specs", icon: "spec" },
  { id: "release", label: "Release notes", icon: "release" },
  { id: "docs", label: "Docs", icon: "docs" },
  { id: "support", label: "Support tickets", icon: "support" },
  { id: "observability", label: "Observability links", icon: "observability" }
];

export const ragPipeline = {
  title: "RAG: Retrieval-Augmented Generation",
  sourcesLabel: "SDLC Knowledge Sources",
  questionLabel: "User Question",
  question: "“Is this a bug?”",
  vectorDbLabel: "Vector DB",
  chunksLabel: "Top-K relevant chunks",
  llmLabel: "LLM",
  responseLabel: ["Grounded", "response"],
  steps: [
    { id: "index", prefix: "Step 1:", label: "Knowledge Indexing" },
    { id: "generation", prefix: "Step 2:", label: "Retrieval + Grounded Generation" }
  ],
  /** the takeaway line; `strong` words are white-bold, the rest light gray */
  principle: [
    { text: "Retrieve", strong: true },
    { text: "first,", strong: false },
    { text: "answer", strong: true },
    { text: "second.", strong: false }
  ]
} as const;

export const vectorizeBeats: VectorizeBeat[] = [
  { key: "why", eyebrow: "The problem", title: "Why not just ask the AI?" },
  {
    key: "map",
    eyebrow: "Inside the Feature Knowledge Base",
    title: "How documents become searchable memory",
    // the mechanism beat cools to a deep Twilio blue — a rest from the red field
    theme: "blue"
  },
  // the RAG beat renders its own title + pipeline via <RagPipeline/> (shared
  // vz-head skipped), and darkens the field so its navy nodes read.
  { key: "rag", eyebrow: "Retrieval-Augmented Generation", title: ragPipeline.title, theme: "dark" }
];

/** Your product's artifacts — the pile the base model never trained on. */
export const vectorizeDocs = ["PRD", "Ticket", "Runbook", "Code", "Slack", "Incident"] as const;

/**
 * The "map of meaning" the documents become once chunked + embedded: each
 * passage is a dot, and close = similar topic. Kept deliberately sparse (~7
 * dots) for a clean read from the back of the room; two carry topic labels.
 * `hot` marks the passages a question retrieves — dim in the map beat, lit in
 * the RAG beat. Coordinates are dot centers on the 1920×1080 plane.
 */
export interface VectorizeDot {
  id: string;
  x: number;
  y: number;
  label?: string;
  hot?: boolean;
}

export const vectorizeDots: VectorizeDot[] = [
  { id: "d1", x: 860, y: 400, label: "checkout", hot: true },
  { id: "d2", x: 980, y: 470, hot: true },
  { id: "d3", x: 910, y: 552, hot: true },
  { id: "d4", x: 1140, y: 372 },
  { id: "d5", x: 1268, y: 492, label: "billing" },
  { id: "d6", x: 1182, y: 612 },
  { id: "d7", x: 1330, y: 632 }
];

/**
 * The map beat's hero: the canonical word-embedding diagram — `king→queen`
 * mirrors `man→woman`, `walking→walked` mirrors `swimming→swam`. A transparent
 * PNG, so it drops straight onto the deep-blue field (light axes/labels and
 * coloured points read natively on the navy).
 */
export const vectorizeMapImage = {
  src: "/ai-layer-for-post-release-support/project/assets/vectors.png",
  alt:
    "Words plotted in 3-D meaning space: the arrow from king to queen matches the " +
    "arrow from man to woman, and walking to walked matches swimming to swam — " +
    "meaning relationships are consistent directions.",
  width: 1517,
  height: 606
} as const;

/**
 * A capability column. `left` is the left edge of its capability chip and
 * phase-chip row (both 520px wide, in CSS); an `→` arrow renders in the 40px
 * gutter before each chip after the first.
 */
export interface CapabilityLane {
  id: "memory" | "triage" | "feedback";
  index: string;
  label: string;
  left: number;
  /** lifecycle phase chips shown under the capability chip */
  phases: string[];
}

export const capabilityLanes: CapabilityLane[] = [
  {
    id: "memory",
    index: "01",
    label: "Feature Memory",
    left: 140,
    phases: ["Sources", "Ingestion", "Feature Context", "Knowledge Layer"]
  },
  {
    id: "triage",
    index: "02",
    label: "AI Triage Assistant",
    left: 700,
    phases: ["Question Intake", "Retrieval", "Triage Runtime", "Evidence Output"]
  },
  {
    id: "feedback",
    index: "03",
    label: "Feedback Loop",
    left: 1260,
    phases: ["Pattern Detection", "Recommendations", "Back to SDLC"]
  }
];

/**
 * The dashed "external systems" group at the head of the memory column —
 * rendered as a titled chip cloud rather than a component box.
 */
export const archSourcesGroup = {
  id: "sdlc-sources",
  title: "SDLC Sources",
  chips: ["Jira", "GitHub", "Figma", "Docs"],
  x: 207,
  y: 356,
  w: 386,
  h: 108,
  /** revealed in the Feature Memory phase */
  group: 1,
  delay: 0
} as const;

/**
 * A component box on the 1920×1080 plane. `emph` is the red-accented runtime
 * core (Triage Runtime / RAG); `db` is the red-accented datastore, drawn as a
 * database cylinder rather than a rectangle (it's the document store, not a
 * "layer"); `input` renders dashed/transparent (an entry point, not a
 * service). `group` is the capability phase (1 Feature Memory · 2 AI Triage ·
 * 3 Feedback Loop) the box reveals in; `delay` is its within-stage stagger
 * offset (seconds), interleaved with the connections that share the stage.
 */
export interface ArchBox {
  id: string;
  label: string;
  tags: string;
  x: number;
  y: number;
  w: number;
  h: number;
  variant?: "emph" | "input" | "db";
  group: 1 | 2 | 3;
  delay: number;
}

export const archBoxes: ArchBox[] = [
  {
    id: "ingestion",
    label: "Ingestion Service",
    tags: "Webhooks · Scheduled sync · Parsers",
    x: 207,
    y: 504,
    w: 386,
    h: 78,
    group: 1,
    delay: 0.18
  },
  {
    id: "context-builder",
    label: "Feature Context Builder",
    tags: "Linking · Summarization · Ownership",
    x: 207,
    y: 622,
    w: 386,
    h: 78,
    group: 1,
    delay: 0.36
  },
  {
    id: "knowledge-layer",
    label: "Feature Knowledge Base",
    tags: "Structured store · Vector index · Source links",
    x: 364,
    y: 795,
    w: 72,
    h: 84,
    variant: "db",
    group: 1,
    delay: 0.56
  },
  {
    id: "question-input",
    label: "Query Input",
    tags: "Support · QA · PM · Engineering",
    x: 816,
    y: 423,
    w: 288,
    h: 78,
    variant: "input",
    group: 2,
    delay: 0
  },
  {
    id: "triage-runtime",
    label: "RAG",
    tags: "Retrieval · Reasoning · Confidence",
    x: 803,
    y: 571,
    w: 314,
    h: 86,
    variant: "emph",
    group: 2,
    delay: 0.18
  },
  {
    id: "evidence-output",
    label: "Output Parser",
    tags: "Classification · Sources · Next steps",
    x: 797,
    y: 727,
    w: 326,
    h: 86,
    group: 2,
    delay: 0.52
  },
  {
    id: "feedback-analytics",
    label: "Analytics",
    tags: "Repeated issues · Docs gaps · Learnings",
    x: 1400,
    y: 575,
    w: 340,
    h: 86,
    group: 3,
    delay: 0.14
  }
];

/**
 * A labeled edge between two components (ids reference `archBoxes` /
 * `archSourcesGroup`). Same-column `flow` edges render as muted vertical
 * wires; `bi` is the red Knowledge Layer ↔ Triage Runtime retrieval hop
 * (arrowheads both ends); `feedback` is the dashed red loop closing back to
 * the SDLC sources. Geometry is derived in `ArchitectureFlow`, not stored
 * here. Array order is the within-stage reveal order.
 */
export interface ArchConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind: "flow" | "bi" | "feedback";
  /** capability phase the edge reveals in (matches its target box's group) */
  group: 1 | 2 | 3;
  /** within-stage stagger offset (seconds); wire + label share it */
  delay: number;
}

export const archConnections: ArchConnection[] = [
  { id: "sources-ingestion", from: "sdlc-sources", to: "ingestion", label: "webhooks / API sync", kind: "flow", group: 1, delay: 0.1 },
  { id: "ingestion-context", from: "ingestion", to: "context-builder", label: "normalized artifacts", kind: "flow", group: 1, delay: 0.28 },
  { id: "context-knowledge", from: "context-builder", to: "knowledge-layer", label: "feature memory", kind: "flow", group: 1, delay: 0.46 },
  { id: "question-runtime", from: "question-input", to: "triage-runtime", label: "question / ticket", kind: "flow", group: 2, delay: 0.1 },
  { id: "knowledge-runtime", from: "knowledge-layer", to: "triage-runtime", label: "context", kind: "bi", group: 2, delay: 0.3 },
  { id: "runtime-evidence", from: "triage-runtime", to: "evidence-output", label: "triage result", kind: "flow", group: 2, delay: 0.42 },
  {
    id: "evidence-analytics",
    from: "evidence-output",
    to: "feedback-analytics",
    label: "resolved cases",
    kind: "flow",
    group: 3,
    delay: 0
  },
  { id: "loop", from: "feedback-analytics", to: "sdlc-sources", label: "feeds the next cycle", kind: "feedback", group: 3, delay: 0.3 }
];

// ---------------------------------------------------------------------------
// Slide 7 — The Payoff (before / after: context reconstruction → retrieval)
// ---------------------------------------------------------------------------

export const payoffSlide = {
  eyebrow: "The Payoff",
  footer: "07 — The Payoff"
} as const;

/**
 * The "Before" column: a ticket drops into the fragmented-sources fog, and the
 * only way out is human-dependent reconstruction. The fog image carries the
 * scattered-source labels (PRs · Docs · Slack · …) baked in.
 */
export const payoffBefore = {
  head: { title: "Before", subtitle: "Context must be reconstructed" },
  ticket: "Ticket / question",
  image: {
    src: `${AVATAR_BASE}/context-fog-flat.png`,
    alt: "Fragmented context scattered across PRs, Docs, Slack, Tickets, Logs, Release notes, and human memory"
  },
  outcomeLines: ["Ask the original engineer"]
} as const;

/** Output capability of the Feature Intelligence Layer; `icon` keys a glyph. */
export interface LayerOutput {
  id: string;
  label: string;
  icon: "answer" | "evidence" | "nextStep";
}

/**
 * The "After" column: the same ticket enters the Feature Intelligence Layer,
 * which already holds the context, so it returns an answer with evidence and a
 * next step — and the outcome is a confident resolution.
 */
export const payoffAfter = {
  head: { title: "After", subtitle: "Context is already available" },
  ticket: "Ticket / question",
  layerName: "Feature Intelligence Layer",
  outputs: [
    { id: "answer", label: "Answer", icon: "answer" },
    { id: "evidence", label: "Evidence", icon: "evidence" },
    { id: "next-step", label: "Next step", icon: "nextStep" }
  ] as LayerOutput[],
  outcome: "Resolve or escalate with context"
} as const;

// ---------------------------------------------------------------------------
// Slide 8 — Demo time (interstitial handoff to the live demo, run off-deck)
// ---------------------------------------------------------------------------

/**
 * A single-beat interstitial: no internal stages, no diagram. It exists only to
 * hand the room off to the live demo the presenter runs outside the deck, so it
 * leans entirely on type/motion (a terminal cursor + a "going live" pulse) for
 * the wow moment rather than on content.
 */
export const demoSlide = {
  eyebrow: "Live Demo",
  titleLead: "Demo ",
  titleAccent: "time",
  subtitle: "Let's watch the Feature Intelligence Layer field a real ticket — live.",
  footer: "08 — Live Demo"
} as const;

// ---------------------------------------------------------------------------
// Deck-level slide registry
// ---------------------------------------------------------------------------

export const slideLabels = ["Title", "About", "Personas", "Insight", "Solution", "Architecture", "Payoff", "Demo"] as const;
export const SLIDE_COUNT = slideLabels.length;
