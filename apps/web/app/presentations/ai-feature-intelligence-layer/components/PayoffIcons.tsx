/**
 * Inline SVG glyphs for the Payoff slide, translated 1:1 from the prototype.
 * Each stroke uses `currentColor`, so the color is set by the surrounding CSS
 * (red marks/outputs, neutral connector arrows) — no hard-coded fills here
 * except the chevron, whose red gradient + glow are intrinsic to its look.
 */

/** Layered-diamond mark for the Feature Intelligence Layer card. */
export function LayerMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 L20 7.5 L12 11.5 L4 7.5 Z" />
      <path d="M4 12 L12 16 L20 12" />
      <path d="M4 16.4 L12 20.4 L20 16.4" />
    </svg>
  );
}

/** Chat bubble — the layer's "Answer" output. */
function AnswerGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 5 H19 a2 2 0 0 1 2 2 V14 a2 2 0 0 1 -2 2 H11 L7 19.5 V16 H5 a2 2 0 0 1 -2 -2 V7 a2 2 0 0 1 2 -2 Z" />
      <circle cx="9" cy="10.5" r="0.6" fill="currentColor" />
      <circle cx="12" cy="10.5" r="0.6" fill="currentColor" />
      <circle cx="15" cy="10.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/** Document — the layer's "Evidence" output. */
function EvidenceGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3 H14 L18 7 V21 H7 Z" />
      <path d="M14 3 V7 H18" />
      <path d="M10 12 H15" />
      <path d="M10 15.5 H15" />
    </svg>
  );
}

/** Forward arrow — the layer's "Next step" output. */
function NextStepGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12 H19" />
      <path d="M13 6 L19 12 L13 18" />
    </svg>
  );
}

const LAYER_OUTPUT_GLYPHS = {
  answer: AnswerGlyph,
  evidence: EvidenceGlyph,
  nextStep: NextStepGlyph,
} as const;

export function LayerOutputIcon({ icon }: { icon: keyof typeof LAYER_OUTPUT_GLYPHS }) {
  const Glyph = LAYER_OUTPUT_GLYPHS[icon];
  return <Glyph />;
}

/** Person-in-circle — the Before outcome (lean on a human). */
export function ReconstructIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" />
      <circle cx="12" cy="10" r="2.7" />
      <path d="M6.6 17.6 a5.6 5.6 0 0 1 10.8 0" />
    </svg>
  );
}

/** Check-in-circle — the After outcome (confident resolution). */
export function ResolveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M7.8 12.4 L10.8 15.4 L16.4 9" />
    </svg>
  );
}

/** Neutral downward connector arrow (ticket → layer → outcome). */
export function FlowArrow() {
  return (
    <svg width="18" height="50" viewBox="0 0 18 50" fill="none" aria-hidden="true">
      <line x1="9" y1="0" x2="9" y2="42" stroke="currentColor" strokeWidth="2" />
      <path d="M3.5 36 L9 47 L14.5 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The red gradient chevron that carries the eye from Before to After. */
export function PayoffChevron() {
  return (
    <svg width="152" height="168" viewBox="0 0 152 168" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="payoffChevronFill" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#7A1320" />
          <stop offset="55%" stopColor="#D2243A" />
          <stop offset="100%" stopColor="#FF3D54" />
        </linearGradient>
        <filter id="payoffChevronGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <path d="M34 32 L120 84 L34 136 L34 104 L70 84 L34 64 Z" fill="#F22F46" opacity="0.28" filter="url(#payoffChevronGlow)" />
      <path d="M34 32 L120 84 L34 136 L34 104 L70 84 L34 64 Z" fill="url(#payoffChevronFill)" />
    </svg>
  );
}
