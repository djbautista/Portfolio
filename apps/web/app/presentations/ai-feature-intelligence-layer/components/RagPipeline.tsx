import { Fragment, useEffect, useState, type CSSProperties } from 'react';

import { ragPipeline, ragSources } from '@/app/presentations/ai-feature-intelligence-layer/data';
import {
  ChunkDocIcon,
  DatabaseIcon,
  GroundedCheckIcon,
  LlmClusterIcon,
  PipelineArrow,
  RagSourceIcon,
  TwilioMark,
  VectorCubesIcon,
} from '@/app/presentations/ai-feature-intelligence-layer/components/RagIcons';

interface RagPipelineProps {
  /** the RAG beat is the active beat — drives the Step 1 entrance cascade. */
  active: boolean;
  /** in-beat reveal step: 0 = Step 1 (indexing) only, 1 = + Step 2 (retrieval). */
  step: number;
}

/**
 * The RAG beat, drawn as a corporate pipeline diagram on the 1920×1080 plane:
 *
 *   SDLC Knowledge Sources → Vector DB → Top-K relevant chunks → LLM → Grounded response
 *                                ↑
 *                          User Question
 *
 * It reveals in two presenter steps, split by the bottom rail:
 *   Step 1 — Knowledge Indexing (sources → Vector DB)
 *   Step 2 — Retrieval + Grounded Generation (question → chunks → LLM → response)
 *
 * Each component animates in on a staggered cascade when its step is reached.
 * Copy comes from `data.ts`; geometry + the entrance transitions live in
 * `presentation.css`. Resting (revealed) state is fully visible — the
 * `.in` class is toggled from React state, so the global reduced-motion rule
 * just snaps each element in instead of sliding it.
 */
export function RagPipeline({ active, step }: RagPipelineProps) {
  // Mirror the ArchitectureSlide entrance trick: the rag beat stays mounted
  // (hidden) across the earlier beats, so we can't animate on mount. Instead,
  // flip `entered` a couple of frames after the beat becomes active — the hidden
  // state paints first, then the Step 1 cascade transitions in. Reset on exit so
  // re-entering the beat replays it.
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

  const showStep1 = entered;
  const showStep2 = entered && step >= 1;

  // className + staggered transition-delay for a revealing element. The delay
  // applies only while shown, so hiding (stepping back) collapses with no
  // reverse-stagger — same idea as ArchitectureFlow's staggerStyle.
  const reveal = (
    base: string,
    shown: boolean,
    delay: number,
    extraStyle?: CSSProperties,
  ): { className: string; style: CSSProperties } => ({
    className: `${base} rag-anim${shown ? ' in' : ''}`,
    style: { transitionDelay: shown ? `${delay}s` : '0s', ...extraStyle },
  });

  return (
    <div className="rag-stage">
      <h2 {...reveal('rag-title', showStep1, 0)}>{ragPipeline.title}</h2>
      <span className={`rag-underline${showStep1 ? ' in' : ''}`} aria-hidden />

      {/* ---- Step 1: Knowledge Indexing — sources → Vector DB ---- */}
      <section {...reveal('rag-sources from-l', showStep1, 0.12)}>
        <header className="rag-sources-head">
          <span className="rag-icon red">
            <DatabaseIcon />
          </span>
          <span>{ragPipeline.sourcesLabel}</span>
        </header>
        <ul className="rag-source-list">
          {ragSources.map((source) => (
            <li key={source.id} className="rag-source">
              <span className="rag-icon red">
                <RagSourceIcon icon={source.icon} />
              </span>
              <span>{source.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <span {...reveal('rag-arrow pop', showStep1, 0.3, { left: 527, top: 480 })}>
        <PipelineArrow />
      </span>

      <div {...reveal('rag-box vdb pop', showStep1, 0.4)}>
        <span className="rag-icon red rag-box-icon">
          <VectorCubesIcon />
        </span>
        <span className="rag-box-label">{ragPipeline.vectorDbLabel}</span>
      </div>

      {/* ---- Step 2: Retrieval + Grounded Generation ---- */}
      {/* user question, feeding down into the Vector DB */}
      <p {...reveal('rag-q-label drop', showStep2, 0)}>{ragPipeline.questionLabel}</p>
      <div {...reveal('rag-q-bubble drop', showStep2, 0.06)}>
        <span>{ragPipeline.question}</span>
      </div>
      <svg
        {...reveal('rag-q-wire', showStep2, 0.18)}
        viewBox="0 0 20 88"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="ragQArrow"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0 0 L4 6 L8 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </marker>
        </defs>
        <line
          x1="10"
          y1="2"
          x2="10"
          y2="78"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 6"
          markerEnd="url(#ragQArrow)"
        />
      </svg>

      <span {...reveal('rag-arrow pop', showStep2, 0.14, { left: 820, top: 480 })}>
        <PipelineArrow />
      </span>

      {/* Top-K relevant chunks — three retrieved evidence pills */}
      <p {...reveal('rag-chunks-label', showStep2, 0.22)}>{ragPipeline.chunksLabel}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} {...reveal('rag-chunk from-r', showStep2, 0.28 + i * 0.08, { top: 392 + i * 78 })}>
          <span className="rag-icon red">
            <ChunkDocIcon />
          </span>
          <span className="rag-chunk-lines" aria-hidden>
            <span className="rag-bar long" />
            <span className="rag-bar short" />
          </span>
        </div>
      ))}

      <span {...reveal('rag-arrow pop', showStep2, 0.52, { left: 1180, top: 480 })}>
        <PipelineArrow />
      </span>

      <div {...reveal('rag-box llm pop', showStep2, 0.6)}>
        <span className="rag-icon red rag-box-icon">
          <LlmClusterIcon />
        </span>
        <span className="rag-box-label">
          {ragPipeline.llmLabel}
          <span className="rag-box-sub">{ragPipeline.llmSub}</span>
        </span>
      </div>

      <span {...reveal('rag-arrow pop', showStep2, 0.72, { left: 1476, top: 480 })}>
        <PipelineArrow />
      </span>

      {/* Grounded response — the green, evidence-backed output */}
      <div {...reveal('rag-box response pop', showStep2, 0.8)}>
        <span className="rag-icon green rag-box-icon">
          <GroundedCheckIcon />
        </span>
        <span className="rag-box-label">
          {ragPipeline.responseLabel.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </span>
      </div>

      {/* step rail: Step 1 (indexing) reveals first, Step 2 (retrieval) next */}
      <span {...reveal('rag-rail s1', showStep1, 0.55)}>
        <span className="rag-rail-node" />
      </span>
      <p {...reveal('rag-step s1', showStep1, 0.6)}>
        <span className="rag-step-prefix">{ragPipeline.steps[0].prefix}</span>{' '}
        <span className="rag-step-label">{ragPipeline.steps[0].label}</span>
      </p>

      <span {...reveal('rag-rail s2', showStep2, 0.9)}>
        <span className="rag-rail-node" />
      </span>
      <p {...reveal('rag-step s2', showStep2, 0.95)}>
        <span className="rag-step-prefix">{ragPipeline.steps[1].prefix}</span>{' '}
        <span className="rag-step-label">{ragPipeline.steps[1].label}</span>
      </p>

      {/* footer principle — the punchline, landing once the full pipeline is up */}
      <p {...reveal('rag-principle', showStep2, 1.05)}>
        <span className="rag-icon red rag-twilio">
          <TwilioMark />
        </span>
        <span className="rag-principle-text">
          {ragPipeline.principle.map((word, i) => (
            <span key={i} className={word.strong ? 'strong' : 'soft'}>
              {word.text}
              {i < ragPipeline.principle.length - 1 ? ' ' : ''}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}
