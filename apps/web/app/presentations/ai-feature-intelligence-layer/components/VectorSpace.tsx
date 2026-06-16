import { Fragment, useEffect, useState, type CSSProperties } from 'react';

import {
  vectorItems,
  vectorLegend,
  vectorMatrixHeaders,
  vectorStages,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

interface VectorSpaceProps {
  /** the vector beat is the active beat — drives the left→right entrance cascade. */
  active: boolean;
}

/** Speech-bubble glyph for the input cards (color comes from `currentColor`). */
function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5 H20 a1 1 0 0 1 1 1 V15 a1 1 0 0 1 -1 1 H10 L6 19 V16 H4 a1 1 0 0 1 -1 -1 V6 a1 1 0 0 1 1 -1 Z" />
      <circle cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Thin pipeline arrow between two stages (matches the deck's other connectors). */
function StageArrow() {
  return (
    <svg width="56" height="24" viewBox="0 0 56 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 H46" />
      <path d="M38 5 L48 12 L38 19" />
    </svg>
  );
}

/**
 * The "Text becomes vectors" beat, drawn as a three-stage infographic on the
 * 1920×1080 plane:
 *
 *   TEXT INPUT  →  VECTORIZATION  →  SEMANTIC SPACE (2D)
 *   (support phrases)  (embedding matrix)   (points; near = similar meaning)
 *
 * The two operational phrases share near-identical embeddings and land in one
 * dashed cluster; the billing phrase is a different topic and sits far away —
 * the bottom legend states the takeaway. Content (phrases, vectors, point
 * positions) is data-driven from `data.ts`; geometry + entrance transitions live
 * in `presentation.css`.
 *
 * Reveal mirrors <RagPipeline/>: the beat stays mounted (hidden) across earlier
 * beats, so we flip `entered` a couple of frames after it becomes active and let
 * the staggered left→right cascade transition in (reset on exit so re-entry
 * replays it). Resting state is fully visible — the global reduced-motion rule
 * snaps each element in instead of sliding it.
 */
export function VectorSpace({ active }: VectorSpaceProps) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!active) {
      setEntered(false);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [active]);

  // className + staggered transition-delay for a revealing element. Delay applies
  // only while shown, so stepping back collapses with no reverse-stagger.
  const reveal = (
    base: string,
    delay: number,
    extraStyle?: CSSProperties,
  ): { className: string; style: CSSProperties } => ({
    className: `${base} rag-anim${entered ? ' in' : ''}`,
    style: { transitionDelay: entered ? `${delay}s` : '0s', ...extraStyle },
  });

  return (
    <div className="vec-stage">
      {/* ---- stage heads: numbered badge + uppercase label per column ---- */}
      {vectorStages.map((label, i) => (
        <div key={label} {...reveal(`vec-head h${i}`, 0.04 + i * 0.06)}>
          <span className="vec-badge">{i + 1}</span>
          <span className="vec-head-label">{label}</span>
        </div>
      ))}

      {/* ---- Stage 1: text input cards ---- */}
      {vectorItems.map((item, i) => (
        <div
          key={item.id}
          {...reveal(`vec-card from-l vec-${item.accent}`, 0.16 + i * 0.08, { top: 356 + i * 128 })}
        >
          <span className="vec-card-icon">
            <ChatBubbleIcon />
          </span>
          <span className="vec-card-text">
            {item.lines[0]}
            <br />
            {item.lines[1]}
          </span>
        </div>
      ))}

      <span {...reveal('vec-arrow pop a1', 0.42)}>
        <StageArrow />
      </span>

      {/* ---- Stage 2: the embedding matrix ---- */}
      <div {...reveal('vec-matrix pop', 0.5)}>
        <span className="vec-bracket l" aria-hidden />
        <span className="vec-bracket r" aria-hidden />
        <div className="vec-grid">
          <span className="vec-cell vec-corner" aria-hidden />
          {vectorMatrixHeaders.map((h, i) => (
            <span key={h} className={`vec-cell vec-colh${i === 2 ? ' dots' : ''}`}>
              {h}
            </span>
          ))}
          {vectorItems.map((item) => (
            <Fragment key={item.id}>
              <span className={`vec-cell vec-rowdot vec-${item.accent}`}>
                <span className="vec-dot" />
              </span>
              {item.vector.map((v, i) => (
                <span key={i} className={`vec-cell vec-num${v === '⋯' ? ' dots' : ''}`}>
                  {v}
                </span>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <span {...reveal('vec-arrow pop a2', 0.58)}>
        <StageArrow />
      </span>

      {/* ---- Stage 3: the 2-D semantic space ---- */}
      <svg className={`vec-plot rag-anim${entered ? ' in' : ''}`} style={{ transitionDelay: entered ? '0.66s' : '0s' }} viewBox="0 0 1920 1080" aria-hidden="true">
        <defs>
          <marker id="vecAxis" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 4.5 L0 9 Z" fill="rgba(255,255,255,.55)" />
          </marker>
        </defs>

        {/* dashed quadrant guides */}
        <line className="vec-guide" x1={1600} y1={372} x2={1600} y2={732} />
        <line className="vec-guide" x1={1336} y1={560} x2={1836} y2={560} />

        {/* axes with arrowheads + italic x / y ticks */}
        <line className="vec-axis" x1={1340} y1={742} x2={1340} y2={368} markerEnd="url(#vecAxis)" />
        <line className="vec-axis" x1={1336} y1={740} x2={1840} y2={740} markerEnd="url(#vecAxis)" />

        {/* the cluster oval around the two near-identical phrases */}
        <ellipse
          className="vec-cluster"
          cx={1716}
          cy={490}
          rx={172}
          ry={94}
          transform="rotate(-9 1716 490)"
        />

        {vectorItems.map((item) => (
          <circle
            key={item.id}
            className={`vec-pt vec-${item.accent}`}
            cx={item.point.x}
            cy={item.point.y}
            r={10}
          />
        ))}
      </svg>

      {/* axis letters + point labels (text as positioned divs, plane coords) */}
      <span className={`vec-axis-tick y rag-anim${entered ? ' in' : ''}`} style={{ transitionDelay: entered ? '0.66s' : '0s', left: 1306, top: 348 }}>
        y
      </span>
      <span className={`vec-axis-tick x rag-anim${entered ? ' in' : ''}`} style={{ transitionDelay: entered ? '0.66s' : '0s', left: 1852, top: 726 }}>
        x
      </span>
      {vectorItems.map((item, i) => (
        <span
          key={item.id}
          {...reveal(`vec-pt-label vec-${item.accent}`, 0.74 + i * 0.07, {
            left: item.point.x + 22,
            top: item.point.y - 24,
          })}
        >
          {item.lines[0]}
          <br />
          {item.lines[1]}
        </span>
      ))}

      {/* ---- bottom legend pill ---- */}
      <div {...reveal('vec-legend', 0.96)}>
        <span className="vec-legend-icon" aria-hidden>
          <span className="vec-dot vec-violet" />
          <span className="vec-legend-link" />
          <span className="vec-dot vec-purple" />
        </span>
        <span className="vec-legend-text">{vectorLegend}</span>
      </div>
    </div>
  );
}
