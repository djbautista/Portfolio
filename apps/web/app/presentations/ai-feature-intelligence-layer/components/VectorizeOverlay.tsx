import Image from 'next/image';

import {
  vectorizeBeats,
  vectorizeDocs,
  vectorizeMapImage,
} from '@/app/presentations/ai-feature-intelligence-layer/data';
import { RagPipeline } from '@/app/presentations/ai-feature-intelligence-layer/components/RagPipeline';
import { VectorSpace } from '@/app/presentations/ai-feature-intelligence-layer/components/VectorSpace';

interface VectorizeOverlayProps {
  /** true across the whole vectorize range: the red sub-slide is shown. */
  active: boolean;
  /**
   * The 0..5 sub-step within the overlay. The "why" beat spans two sub-steps:
   * 0 — the model guesses (product panel dim, in shadow); 1 — the panel lights
   * up (it never trained on your docs). 2 → map beat. 3 → vector beat (text →
   * vectors → semantic space). The RAG beat spans the last two: 4 — pipeline
   * Step 1 (Knowledge Indexing); 5 — Step 2 (Retrieval + Grounded Generation)
   * revealed on top.
   */
  step: number;
}

/**
 * Full-window red sub-slide inserted between the Feature Memory column and the
 * Triage column. It is the *destination* of the Prezi camera push-in: the
 * diagram (wrapped in `.arch-camera` in ArchitectureSlide) zooms into the
 * database icon, and this solid-red panel fades in over the back half of that
 * zoom so the camera lands cleanly on full red.
 *
 * Three beats cross-fade in place while the camera stays parked, telling the
 * "why RAG, then how" story for a non-technical room:
 *   0 — why not just ask the model? (it never saw your product; it guesses)
 *   1 — documents become a searchable map of meaning (chunk + embed)
 *   2 — text → vectors → semantic space (similar meaning sits closer)
 *   3 — RAG: retrieve the few relevant passages, answer grounded with citations
 *
 * Purely presentational — the deck owns the stage; the headers + repeated nodes
 * (docs, map dots) are data-driven from `data.ts`, and the timing lives in CSS.
 */
export function VectorizeOverlay({ active, step }: VectorizeOverlayProps) {
  // The "why" beat owns sub-steps 0 and 1; within it the product panel lights up
  // at step ≥ 1. Then step 2 → map (beat 1), step 3 → vector (beat 2), and the
  // RAG beat (index 3) owns the last two sub-steps (4, 5), so clamp there.
  const beatIndex = step <= 1 ? 0 : Math.min(step - 1, 3);
  const panelLit = step >= 1;
  // Within the RAG pipeline: 0 reveals Step 1 only, 1 adds Step 2.
  const ragStep = step >= 5 ? 1 : 0;
  const theme = vectorizeBeats[beatIndex]?.theme;

  return (
    <div className={`arch-vectorize${active ? ' active' : ''}`} aria-hidden={!active}>
      <div className="vz-content">
        {/* per-beat background field, painted over the landing red (transparent
            on red beats, deep Twilio blue on the map beat) */}
        <div className={`vz-bg${theme ? ` ${theme}` : ''}`} />

        {/* headers cross-fade per beat at a fixed top anchor. The vector + RAG
            beats are skipped — each renders its own in-figure labels. */}
        {vectorizeBeats.map((beat, i) =>
          beat.key === 'rag' || beat.key === 'vector' ? null : (
            <div key={beat.key} className={`vz-head${beatIndex === i ? ' is-on' : ''}`}>
              <p className="vz-eyebrow">{beat.eyebrow}</p>
              <h2 className="vz-title">{beat.title}</h2>
            </div>
          ),
        )}

        {/* ---- Beat 0: why not just ask the AI? ---- */}
        <div className={`vz-beat${beatIndex === 0 ? ' is-on' : ''}`}>
          <svg className="vz-wires" viewBox="0 0 1920 1080" aria-hidden="true">
            <defs>
              <marker
                id="vzArrow0"
                markerWidth="9"
                markerHeight="9"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0 0 L7 3 L0 6 Z" fill="rgba(255,255,255,.7)" />
              </marker>
            </defs>
            {/* a single vertical axis: question → model → guessed answer */}
            <path className="w" d="M640 430 L640 466" />
            <path className="w" d="M640 662 L640 762" markerEnd="url(#vzArrow0)" />
          </svg>

          <div className="vz-card vz-q vz-stacked" style={{ left: 450, top: 312, width: 380 }}>
            <span>&ldquo;Why did checkout break for Peter?&rdquo;</span>
          </div>

          <div className="vz-orb" style={{ left: 546, top: 472 }}>
            <span>AI</span>
          </div>

          <div className="vz-card warn vz-stacked" style={{ left: 448, top: 768, width: 384 }}>
            <span>&ldquo;&hellip;probably a caching bug?&rdquo;</span>
            <span className="vz-flag">&#9888; guessed &middot; no sources</span>
          </div>

          <div
            className={`vz-panel${panelLit ? ' lit' : ''}`}
            style={{ left: 1140, top: 392, width: 520 }}
          >
            <p className="vz-panel-h">Your product</p>
            <div className="vz-panel-docs">
              {vectorizeDocs.map((doc) => (
                <span key={doc} className="vz-doc">
                  {doc}
                </span>
              ))}
            </div>
            <p className="vz-panel-sub">The model never trained on it.</p>
          </div>

          <p className="vz-turn" style={{ left: 360, top: 936, width: 1200 }}>
            Don&rsquo;t make it guess &mdash; fetch the answer first.{' '}
            <span className="rag">That&rsquo;s RAG.</span>
          </p>
        </div>

        {/* ---- Beat 1: documents become searchable memory ---- */}
        <div className={`vz-beat${beatIndex === 1 ? ' is-on' : ''}`}>
          <Image
            className="vz-vectors"
            src={vectorizeMapImage.src}
            alt={vectorizeMapImage.alt}
            width={vectorizeMapImage.width}
            height={vectorizeMapImage.height}
            priority
            style={{ left: 235, top: 250, width: 1450 }}
          />

          <p className="vz-note" style={{ left: 360, top: 858, width: 1200 }}>
            Every passage becomes a point in &ldquo;meaning space&rdquo;{' '}
            <strong>similar ideas sit close to each other</strong>.
          </p>
        </div>

        {/* ---- Beat 2: text → vectors → semantic space ---- */}
        <div className={`vz-beat${beatIndex === 2 ? ' is-on' : ''}`}>
          <VectorSpace active={active && beatIndex === 2} />
        </div>

        {/* ---- Beat 3: the RAG pipeline diagram (reveals in two steps) ---- */}
        <div className={`vz-beat${beatIndex === 3 ? ' is-on' : ''}`}>
          <RagPipeline active={active && beatIndex === 3} step={ragStep} />
        </div>
      </div>
    </div>
  );
}
