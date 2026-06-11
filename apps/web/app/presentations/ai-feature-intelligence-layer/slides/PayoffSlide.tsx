import { Fragment } from 'react';
import Image from 'next/image';

import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { FadeIn } from '@/app/presentations/ai-feature-intelligence-layer/components/FadeIn';
import { SDLCFlow } from '@/app/presentations/ai-feature-intelligence-layer/components/SDLCFlow';
import {
  FlowArrow,
  LayerMark,
  LayerOutputIcon,
  ReconstructIcon,
  ResolveIcon,
} from '@/app/presentations/ai-feature-intelligence-layer/components/PayoffIcons';
import {
  payoffAfter,
  payoffBefore,
  payoffSlide,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * The `?` pill that opens each section — the incoming ticket / question. `side`
 * keys both its position and (for `before`) the red-accented treatment.
 */
function Ticket({ label, side }: { label: string; side: 'before' | 'after' }) {
  return (
    <div className={`ticket ${side}`}>
      <span className="ticket-mark">?</span>
      <span className="ticket-label">{label}</span>
    </div>
  );
}

interface PayoffSlideProps {
  /**
   * 0 — the "Before" section alone; 1 — crossfade to the "After" section,
   * centered; 2 — slide "After" into the left half (compact layer card) and
   * fade the SDLC diagram in on the right.
   */
  stage: number;
}

/**
 * Slide 7 — The Payoff. A before/after thesis told in two beats. Both sections
 * are stacked in the center of the plane and crossfade: stage 0 shows BEFORE
 * (a ticket drops into the fragmented-sources fog, out to a human-dependent
 * outcome); advancing to stage 1 fades BEFORE out and fades AFTER in (the ticket
 * enters the Feature Intelligence Layer and returns answer + evidence + next
 * step). The deck owns the beat; this component toggles `.is-active` and the
 * crossfade lives in CSS transitions.
 */
export function PayoffSlide({ stage }: PayoffSlideProps) {
  const showAfter = stage >= 1;
  const showDiagram = stage >= 2;

  return (
    <SlideFrame variant="payoff">
      {/* ---- header ---- */}
      <FadeIn>
        <p className="eyebrow">
          <span className="dot" />
          <span>{payoffSlide.eyebrow}</span>
        </p>
      </FadeIn>

      {/* ---- BEFORE section (stage 0) ---- */}
      <div className={`payoff-section before${showAfter ? '' : ' is-active'}`}>
        <div className="column-head before">
          <p className="column-title">{payoffBefore.head.title}</p>
          <p className="column-sub">{payoffBefore.head.subtitle}</p>
        </div>
        <Ticket label={payoffBefore.ticket} side="before" />
        <Image
          className="context-image"
          src={payoffBefore.image.src}
          alt={payoffBefore.image.alt}
          width={640}
          height={640}
        />
        <div className="outcome before">
          <span className="outcome-icon">
            <ReconstructIcon />
          </span>
          <span className="outcome-text">
            {payoffBefore.outcomeLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </span>
        </div>
      </div>

      {/* ---- AFTER section (stage 1; slides left + compact at stage 2) ---- */}
      <div
        className={`payoff-section after${showAfter ? ' is-active' : ''}${
          showDiagram ? ' compact' : ''
        }`}
      >
        <div className="column-head after">
          <p className="column-title">{payoffAfter.head.title}</p>
          <p className="column-sub">{payoffAfter.head.subtitle}</p>
        </div>
        <Ticket label={payoffAfter.ticket} side="after" />
        <div className="flow-arrow">
          <FlowArrow />
        </div>
        <div className="layer-card">
          <div className="layer-header">
            <div className="layer-mark">
              <LayerMark />
            </div>
            <p className="layer-name">{payoffAfter.layerName}</p>
          </div>
          <div className="layer-rule" />
          <div className="layer-outputs">
            {payoffAfter.outputs.map((output) => (
              <div key={output.id} className="layer-output">
                <LayerOutputIcon icon={output.icon} />
                <span>{output.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flow-arrow">
          <FlowArrow />
        </div>
        <div className="outcome after">
          <span className="outcome-icon">
            <ResolveIcon />
          </span>
          <span className="outcome-text">{payoffAfter.outcome}</span>
        </div>
      </div>

      {/* ---- SDLC diagram (reused from the Title slide), right half of stage 2.
          The `afil-title focus-graph reveal-layer` classes re-apply the diagram's
          own scoped styles (full-brightness, red AI-layer spine + caption). ---- */}
      <div
        className={`payoff-diagram afil-title focus-graph reveal-layer${
          showDiagram ? ' is-active' : ''
        }`}
      >
        <SDLCFlow activeNode={-1} />
      </div>

      {/* ---- footer ---- */}
      <FadeIn delay={0.28}>
        <div className="footer">
          <span className="bar" />
          <span>{payoffSlide.footer}</span>
        </div>
      </FadeIn>
    </SlideFrame>
  );
}
