/**
 * Inline SVG glyphs for the RAG pipeline beat (the final beat of the Vectorize
 * overlay). Every stroke/fill is `currentColor`, so color is set by the
 * surrounding CSS — red for the knowledge-source marks and the Vector DB / LLM
 * nodes, green for the grounded-response output. No hard-coded colors here.
 */

import type { ComponentType } from 'react';

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/* ---- SDLC knowledge-source marks (left panel) ---- */

/** Jira ticket — a solid diamond mark. */
function JiraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 L19 11 L12 18 L5 11 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 8.5 L14.5 11 L12 13.5 L9.5 11 Z" fill="#0e1726" stroke="none" />
    </svg>
  );
}

/** PRs — a git branch / merge mark. */
function PrIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9 a9 9 0 0 1 -9 9" />
    </svg>
  );
}

/** Product specs — a document with ruled lines. */
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M13 3 H7 a1 1 0 0 0 -1 1 V20 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V8 Z" />
      <path d="M13 3 V8 H18" />
      <path d="M9 13 H15" />
      <path d="M9 16.5 H15" />
    </svg>
  );
}

/** Release notes — a tag. */
function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M20.6 13.4 L13.4 20.6 a2 2 0 0 1 -2.8 0 L2 12 V2 h10 l8.6 8.6 a2 2 0 0 1 0 2.8 z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

/** Docs — an open book. */
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M2 4 h6 a4 4 0 0 1 4 4 v12 a3 3 0 0 0 -3 -3 H2 z" />
      <path d="M22 4 h-6 a4 4 0 0 0 -4 4 v12 a3 3 0 0 1 3 -3 h7 z" />
    </svg>
  );
}

/** Support tickets — a headset. */
function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M3.5 17 v-5 a8.5 8.5 0 0 1 17 0 v5" />
      <path d="M20.5 18 a2 2 0 0 1 -2 2 h-1.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-2 a1.5 1.5 0 0 1 1.5 -1.5 h3.5 z" />
      <path d="M3.5 18 a2 2 0 0 0 2 2 h0.5 a1.5 1.5 0 0 0 1.5 -1.5 v-2 a1.5 1.5 0 0 0 -1.5 -1.5 H3.5 z" />
    </svg>
  );
}

/** Observability links — a connected line chart. */
function ObservabilityIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M3 16 L8.5 10.5 L12.5 14 L21 5.5" />
      <circle cx="3" cy="16" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="10.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="14" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="21" cy="5.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOURCE_GLYPHS = {
  jira: JiraIcon,
  pr: PrIcon,
  spec: DocIcon,
  release: TagIcon,
  docs: BookIcon,
  support: HeadsetIcon,
  observability: ObservabilityIcon,
} satisfies Record<string, ComponentType>;

export type RagSourceGlyph = keyof typeof SOURCE_GLYPHS;

export function RagSourceIcon({ icon }: { icon: RagSourceGlyph }) {
  const Glyph = SOURCE_GLYPHS[icon];
  return <Glyph />;
}

/* ---- Pipeline node marks ---- */

/** Database cylinder — the SDLC sources panel header. */
export function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <ellipse cx="12" cy="6" rx="6.5" ry="2.5" />
      <path d="M5.5 6 V18 c0 1.4 2.9 2.5 6.5 2.5 s6.5 -1.1 6.5 -2.5 V6" />
      <path d="M18.5 12 c0 1.4 -2.9 2.5 -6.5 2.5 s-6.5 -1.1 -6.5 -2.5" />
    </svg>
  );
}

/** Stacked layers / vector cubes — the Vector DB node. */
export function VectorCubesIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M12 2 L22 7 L12 12 L2 7 Z" />
      <path d="M2 12 L12 17 L22 12" />
      <path d="M2 17 L12 22 L22 17" />
    </svg>
  );
}

/** Small ruled document — a retrieved chunk. */
export function ChunkDocIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M13 3 H7 a1 1 0 0 0 -1 1 V20 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V8 Z" />
      <path d="M13 3 V8 H18" />
    </svg>
  );
}

/** Dotted node cluster — the LLM. */
export function LlmClusterIcon() {
  const ring = [
    [12, 5.4],
    [12, 18.6],
    [5.4, 12],
    [18.6, 12],
    [7.4, 7.4],
    [16.6, 7.4],
    [7.4, 16.6],
    [16.6, 16.6],
  ];
  const inner = [
    [12, 9],
    [12, 15],
    [9, 12],
    [15, 12],
  ];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="1.3" />
      {ring.map(([cx, cy]) => (
        <circle key={`r${cx}-${cy}`} cx={cx} cy={cy} r="1.05" />
      ))}
      {inner.map(([cx, cy]) => (
        <circle key={`i${cx}-${cy}`} cx={cx} cy={cy} r="0.8" />
      ))}
    </svg>
  );
}

/** Chat bubble with a checkmark — the grounded response output. */
export function GroundedCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M5 5 H19 a2 2 0 0 1 2 2 V14 a2 2 0 0 1 -2 2 H11 L7 19.5 V16 H5 a2 2 0 0 1 -2 -2 V7 a2 2 0 0 1 2 -2 Z" />
      <path d="M8.5 10.6 L11 13.1 L15.5 8.4" />
    </svg>
  );
}

/** Twilio-style mark — the footer principle bullet. */
export function TwilioMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <g fill="currentColor" stroke="none">
        <circle cx="9.2" cy="9.2" r="1.7" />
        <circle cx="14.8" cy="14.8" r="1.7" />
        <circle cx="14.8" cy="9.2" r="1.7" />
        <circle cx="9.2" cy="14.8" r="1.7" />
      </g>
    </svg>
  );
}

/** Horizontal connector arrow between pipeline stages. */
export function PipelineArrow() {
  return (
    <svg width="48" height="24" viewBox="0 0 48 24" {...STROKE} strokeWidth="2">
      <path d="M2 12 H40" />
      <path d="M33 6 L41 12 L33 18" />
    </svg>
  );
}
