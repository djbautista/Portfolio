import { Fragment, useEffect, useState } from 'react';

import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import {
  ARCH_STAGE,
  ArchitectureFlow,
} from '@/app/presentations/ai-feature-intelligence-layer/components/ArchitectureFlow';
import { VectorizeOverlay } from '@/app/presentations/ai-feature-intelligence-layer/components/VectorizeOverlay';
import {
  archBoxes,
  architectureSlide,
  capabilityLanes,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

/** Highest in-slide reveal stage; the deck steps 0..MAX before falling through. */
export const MAX_ARCH_STAGE = ARCH_STAGE.feedback;

/** resting `top` of the capability-chip row and the phase-chip row (from CSS). */
const CAP_TOP = 142;
const PHR_TOP = 214;

/**
 * Prezi camera push-in for the `vectorize` sub-step. We treat `.arch-camera`
 * (the whole diagram) as the canvas and the viewport as a fixed camera: to pull
 * the database icon to screen-center and fill the frame at scale S, the canvas
 * runs the *inverse* transform — `translate(vw/2 − S·cx, vh/2 − S·cy) scale(S)`
 * about origin 0 0 (cx,cy = the database center, derived from data). The result
 * is the camera flying into the store's red core. */
const PLANE_W = 1920;
const PLANE_H = 1080;
const CAM_SCALE = 36;
const dbBox = archBoxes.find((b) => b.variant === 'db')!;
const DB_CX = dbBox.x + dbBox.w / 2;
const DB_CY = dbBox.y + dbBox.h / 2;
const CAMERA_ZOOM = `translate(${PLANE_W / 2 - CAM_SCALE * DB_CX}px, ${
  PLANE_H / 2 - CAM_SCALE * DB_CY
}px) scale(${CAM_SCALE})`;
/** per-column vertical stagger while the chips are isolated (stage 0). */
const STAIR_STEP = 96;

interface ArchitectureSlideProps {
  /** reveal stage 0..8, owned by PresentationDeck (like the persona slide) */
  stage: number;
}

/**
 * Slide 6: the proposed system design — three indexed capability chips
 * organize the canvas into columns (Feature Memory → AI Triage Assistant →
 * Feedback Loop); below, the component diagram with the dashed red loop
 * closing the cycle. Purely presentational: the deck owns the stage; CSS
 * opacity/transform transitions (with within-stage staggers) drive the
 * reveal, mirroring the prototype's cadence.
 */
export function ArchitectureSlide({ stage }: ArchitectureSlideProps) {
  // The chip layers are resting state (stage 0), so they'd otherwise mount
  // already-revealed and skip their entrance. Flip `entered` after first paint
  // (double rAF lets the hidden state paint first) so the CSS transition fires
  // and the chips stagger in on entry — independent of the presenter stage.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const chipLayerCls = `arch-layer arch-reveal${entered ? ' revealed' : ''}`;

  // At rest (stage 0, diagram hidden) the chips sit vertically centered on the
  // canvas; stepping into stage 1 lifts both layers to their home position at
  // the top while the diagram reveals below. The shift is a block-level
  // transform on each layer, so the per-chip entrance transforms still apply.
  const chipRestShift =
    stage === ARCH_STAGE.chips ? { transform: 'translateY(346px)' } : undefined;

  // While isolated (stage 0) the three columns fan out into a staircase — 03
  // above 02 above 01, centered on the middle column — then collapse back to a
  // flat row when stepping into stage 1 as the diagram begins to reveal. The
  // per-column offset rides each chip's `top` (transitioned in CSS) so it
  // composes with the layer lift and the per-chip entrance transform instead of
  // clobbering them. Arrows sit at the midpoint between the chips they bridge.
  const isolated = stage === ARCH_STAGE.chips;
  const stairOffset = (i: number) => (isolated ? (1 - i) * STAIR_STEP : 0);

  // Across the vectorize sub-slide the camera (the whole diagram) flies into the
  // database and stays parked there while the red overlay cross-fades through
  // its sub-steps; otherwise it rests at identity. `vzStep` is the 0..4 sub-step
  // within the overlay (0/1 are the two halves of the "why" beat — guess, then
  // the product panel lights up; 3/4 are the RAG pipeline's two reveal steps).
  // The red sub-slide sits outside the camera so it stays full-frame as the
  // diagram zooms beneath it.
  const inVectorize = stage >= ARCH_STAGE.vectorize && stage <= ARCH_STAGE.vectorizeRagFull;
  const vzStep = stage - ARCH_STAGE.vectorize;
  const cameraStyle = inVectorize ? { transform: CAMERA_ZOOM } : undefined;

  return (
    <SlideFrame variant="architecture" className="staged">
      <div className={`arch-camera${inVectorize ? ' zoomed' : ''}`} style={cameraStyle}>
        <p className="eyebrow">
          <span className="dot" />
          <span>{architectureSlide.eyebrow}</span>
        </p>
        <p className="note">
          {architectureSlide.note.map((quality, i) => (
            <Fragment key={quality}>
              {i > 0 && <span className="nd"> &middot; </span>}
              <span>{quality}</span>
            </Fragment>
          ))}
        </p>

        <div className={chipLayerCls} style={chipRestShift}>
          {capabilityLanes.map((lane, i) => (
            <Fragment key={lane.id}>
              {i > 0 && (
                <div
                  className={`cap-arr r${i - 1}`}
                  style={{
                    left: lane.left - 40,
                    top: CAP_TOP + (stairOffset(i - 1) + stairOffset(i)) / 2,
                  }}
                >
                  &rarr;
                </div>
              )}
              <div
                className={`cap c${i}`}
                style={{ left: lane.left, top: CAP_TOP + stairOffset(i) }}
              >
                <span className="idx">{lane.index}</span>
                <span>{lane.label}</span>
              </div>
            </Fragment>
          ))}
        </div>

        <div className={chipLayerCls} style={chipRestShift}>
          {capabilityLanes.map((lane, i) => (
            <div
              key={lane.id}
              className={`phr p${i}`}
              style={{ left: lane.left, top: PHR_TOP + stairOffset(i) }}
            >
              {lane.phases.map((phase) => (
                <span key={phase} className="phc">
                  {phase}
                </span>
              ))}
            </div>
          ))}
        </div>

        <ArchitectureFlow stage={stage} />

        <div className="footer">
          <span className="bar" />
          <span>{architectureSlide.footer}</span>
        </div>
      </div>

      <VectorizeOverlay active={inVectorize} step={vzStep} />
    </SlideFrame>
  );
}
