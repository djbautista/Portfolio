import { Fragment } from 'react';
import type { CSSProperties } from 'react';

import {
  archBoxes,
  archConnections,
  archSourcesGroup,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 6 diagram: three component columns — the memory pipeline (left), the
 * triage runtime (center), and feedback analytics (right). Same-column flows
 * are muted vertical wires; the Knowledge Layer ⇄ Triage Runtime RAG hop is
 * red with arrowheads both ends; the dashed red loop closes the cycle back
 * into the SDLC sources.
 *
 * Reveal is per-capability-phase: every box and connection carries a `group`
 * (1 Feature Memory · 2 AI Triage · 3 Feedback Loop) and a `delay`. An element
 * shows once `stage >= group`, and its stagger `delay` is applied inline only
 * while shown — so stepping a stage in cascades its boxes + wires, and stepping
 * back hides them together with no delay.
 *
 * Wire endpoints derive from the box rects in `data.ts`; only the loop path
 * and the on-line label anchors are hand-tuned against the prototype.
 */

/**
 * Reveal-stage thresholds (deck-owned `archStage`). Stage 0 is the resting
 * state: header/footer plus both chip layers. Stage 1 reveals the Feature
 * Memory column; stages 2–5 are the `vectorize` detour — the camera zooms into
 * the knowledge store and a full-screen explainer sub-slide opens (see
 * VectorizeOverlay), cross-fading through its beats while the camera stays
 * parked: `vectorize` (the model guesses) → `vectorizeMiss` (its product panel
 * lights up — it never trained on your docs) → `vectorizeMap` (documents →
 * searchable memory) → `vectorizeVectors` (text → vectors → semantic space:
 * similar meaning sits closer) → `vectorizeRag` (the RAG pipeline, Step 1 —
 * Knowledge Indexing) → `vectorizeRagFull` (the same pipeline with Step 2 —
 * Retrieval + Grounded Generation revealed). The `restored` stage is the
 * zoom-out: the
 * sub-slide closes and the camera returns to the base diagram (still just the
 * Feature Memory column) before anything new reveals — a deliberate beat so the
 * push-out isn't entangled with the next column. Stages 8–9 then reveal the
 * Triage and Feedback columns.
 */
export const ARCH_STAGE = {
  chips: 0,
  featureMemory: 1,
  vectorize: 2,
  vectorizeMiss: 3,
  vectorizeMap: 4,
  vectorizeVectors: 5,
  vectorizeRag: 6,
  vectorizeRagFull: 7,
  restored: 8,
  triage: 9,
  feedback: 10,
} as const;

/**
 * Capability group (1 Feature Memory · 2 AI Triage · 3 Feedback Loop) → the
 * deck stage at which its boxes/connections reveal. The `vectorize` sub-step is
 * inserted after group 1, so groups 2/3 reveal a stage later than their index —
 * this map keeps the data's `group` values semantic (lanes, not stage numbers).
 */
const GROUP_REVEAL_STAGE: Record<number, number> = {
  1: ARCH_STAGE.featureMemory,
  2: ARCH_STAGE.triage,
  3: ARCH_STAGE.feedback,
};

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const RECTS: Record<string, Rect> = Object.fromEntries(
  [archSourcesGroup, ...archBoxes].map((b) => [b.id, { x: b.x, y: b.y, w: b.w, h: b.h }]),
);

const rectById = (id: string) => RECTS[id]!;
const centerX = (r: Rect) => r.x + r.w / 2;
const centerY = (r: Rect) => r.y + r.h / 2;

/** gap between an arrowhead tip and the box edge it points at */
const ARROW_GAP = 5;

/** prototype wire gray (brighter than --line-bright so arrows read at distance) */
const WIRE = '#4A5364';

// The loop: Feedback Analytics (top) → across the diagram → SDLC Sources (top).
// Hand-tuned against the prototype; anchors match the rects in data.ts.
const LOOP_PATH =
  'M1570 575 C 1570 459, 1558 306, 1478 306 L 500 306 C 420 306, 400 322, 400 352';

/** anchors + extra classes for the labels that sit on a curve (not beside a rail) */
const ON_LINE_LABELS: Record<string, { x: number; y: number; cls: string }> = {
  'knowledge-runtime': { x: 623, y: 726, cls: ' on-line is-red' },
  'evidence-analytics': { x: 1265, y: 694, cls: ' on-line' },
  loop: { x: 960, y: 306, cls: ' on-line is-red' },
};

/** horizontal cross-column curve between two box edge midpoints */
const crossPath = (from: Rect, to: Rect, reach: number) => {
  const fx = from.x + from.w;
  const fy = centerY(from);
  const tx = to.x - 4;
  const ty = centerY(to);
  return `M${fx} ${fy} C ${fx + reach} ${fy}, ${tx - reach + 14} ${ty}, ${tx} ${ty}`;
};

interface ArchitectureFlowProps {
  /** reveal stage 0..8, owned by PresentationDeck */
  stage: number;
}

export function ArchitectureFlow({ stage }: ArchitectureFlowProps) {
  // An element reveals once its capability phase is reached; the stagger delay
  // applies on the forward (shown) direction only, so backward hides instantly.
  const shownAt = (group: number) => stage >= GROUP_REVEAL_STAGE[group]!;
  const staggerStyle = (group: number, delay: number): CSSProperties => ({
    transitionDelay: shownAt(group) ? `${delay}s` : '0s',
  });
  const shownCls = (group: number) => (shownAt(group) ? ' shown' : '');

  return (
    <>
      {/* component columns: dashed sources group + service boxes */}
      <div className="arch-layer">
        <div
          className={`a-grp${shownCls(archSourcesGroup.group)}`}
          style={{
            left: archSourcesGroup.x,
            top: archSourcesGroup.y,
            width: archSourcesGroup.w,
            height: archSourcesGroup.h,
            ...staggerStyle(archSourcesGroup.group, archSourcesGroup.delay),
          }}
        >
          <p className="g-title">{archSourcesGroup.title}</p>
          <div className="g-chips">
            {archSourcesGroup.chips.map((chip) => (
              <span key={chip} className="g-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>

        {archBoxes.map((box) => {
          const stagger = staggerStyle(box.group, box.delay);

          // the knowledge store renders as a database icon with its label as a
          // caption below the figure (rather than text inside a box)
          if (box.variant === 'db') {
            return (
              <Fragment key={box.id}>
                <div
                  className={`a-db${shownCls(box.group)}`}
                  style={{ left: box.x, top: box.y, width: box.w, height: box.h, ...stagger }}
                >
                  <svg
                    viewBox="0 0 105.07 122.88"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M52.53,0c28.87,0,52.27,10.96,52.27,24.46c0,13.51-23.41,24.46-52.27,24.46c-28.86,0-52.27-10.96-52.27-24.46 C0.26,10.96,23.67,0,52.53,0L52.53,0z M0.26,81.83v18.78c9.3,33.03,101.18,26.65,104.55-1.69V80.16 C100.22,111.27,7.61,113.51,0.26,81.83L0.26,81.83L0.26,81.83z M0,32.94v18.34c9.3,32.26,101.69,27.9,105.07,0.23V33.18 C100.47,63.57,7.35,63.88,0,32.94L0,32.94z M0,56.64v18.78c9.3,33.03,101.69,28.57,105.07,0.23V56.89C100.47,88,7.35,88.32,0,56.64 L0,56.64z"
                    />
                  </svg>
                </div>
                <div
                  className={`a-db-cap${shownCls(box.group)}`}
                  style={{ left: centerX(rectById(box.id)), top: box.y + box.h + 10, ...stagger }}
                >
                  <p className="b-name">{box.label}</p>
                  <p className="b-tags">{box.tags}</p>
                </div>
              </Fragment>
            );
          }

          return (
            <div
              key={box.id}
              className={`a-box${box.variant ? ` ${box.variant}` : ''}${shownCls(box.group)}`}
              style={{
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
                ...stagger,
              }}
            >
              <p className="b-name">{box.label}</p>
              <p className="b-tags">{box.tags}</p>
            </div>
          );
        })}
      </div>

      <svg
        className="wires"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="archArr"
            viewBox="0 0 10 10"
            refX="7.5"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={WIRE} />
          </marker>
          <marker
            id="archArrRed"
            viewBox="0 0 10 10"
            refX="7.5"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="var(--red)" />
          </marker>
        </defs>

        {archConnections.map((conn) => {
          const style = staggerStyle(conn.group, conn.delay);

          // the loop closes: learnings re-enter the SDLC sources
          if (conn.kind === 'feedback') {
            return (
              <path
                key={conn.id}
                className={`a-loop${shownCls(conn.group)}`}
                style={style}
                d={LOOP_PATH}
                stroke="var(--red)"
                strokeWidth="2"
                strokeOpacity="0.55"
                strokeDasharray="7 6"
                markerEnd="url(#archArrRed)"
              />
            );
          }

          const from = rectById(conn.from);
          const to = rectById(conn.to);
          const cls = `a-ln${shownCls(conn.group)}`;

          if (conn.kind === 'bi') {
            // Knowledge Layer ⇄ Triage Runtime: the RAG hop, arrows both ends
            return (
              <path
                key={conn.id}
                className={cls}
                style={style}
                d={crossPath(from, to, 140)}
                stroke="var(--red)"
                strokeWidth="2"
                strokeOpacity="0.85"
                markerStart="url(#archArrRed)"
                markerEnd="url(#archArrRed)"
              />
            );
          }
          if (centerX(from) !== centerX(to)) {
            // cross-column handoff (Evidence Output → Feedback Analytics)
            return (
              <path
                key={conn.id}
                className={cls}
                style={style}
                d={crossPath(from, to, 76)}
                stroke={WIRE}
                strokeWidth="2"
                markerEnd="url(#archArr)"
              />
            );
          }
          return (
            <line
              key={conn.id}
              className={cls}
              style={style}
              x1={centerX(from)}
              y1={from.y + from.h}
              x2={centerX(to)}
              y2={to.y - ARROW_GAP}
              stroke={WIRE}
              strokeWidth="2"
              markerEnd="url(#archArr)"
            />
          );
        })}
      </svg>

      {/* connector labels: beside the vertical rails, or masked onto a curve */}
      <div className="arch-layer">
        {archConnections.map((conn) => {
          if (!conn.label) return null;
          const style = staggerStyle(conn.group, conn.delay);
          const onLine = ON_LINE_LABELS[conn.id];
          if (onLine) {
            return (
              <div
                key={conn.id}
                className={`c-lbl${onLine.cls}${shownCls(conn.group)}`}
                style={{ left: onLine.x, top: onLine.y, ...style }}
              >
                {conn.label}
              </div>
            );
          }
          const from = rectById(conn.from);
          const to = rectById(conn.to);
          return (
            <div
              key={conn.id}
              className={`c-lbl${shownCls(conn.group)}`}
              style={{ left: centerX(from) + 22, top: (from.y + from.h + to.y) / 2, ...style }}
            >
              {conn.label}
            </div>
          );
        })}
      </div>
    </>
  );
}
