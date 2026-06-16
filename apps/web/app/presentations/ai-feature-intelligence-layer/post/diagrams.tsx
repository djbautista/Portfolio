/**
 * Simplified, mobile-first re-drawings of the deck's diagrams for the blog post.
 *
 * The live slides paint these on a fixed 1920×1080 SVG plane — great on a
 * projector, unreadable on a phone. Here each diagram is plain flow layout
 * (flexbox/grid) that stacks vertically on small screens and spreads out on
 * wider ones. There's no animation: everything is in its resting, fully-visible
 * state, which is exactly what a reader wants.
 *
 * All copy/labels come from the same {@link ../data} arrays the deck uses, so the
 * post can't drift out of sync with the presentation.
 */
import Image from 'next/image';

import {
  aboutSlide,
  archBoxes,
  archConnections,
  archSourcesGroup,
  capabilityLanes,
  insightQuestions,
  payoffAfter,
  payoffBefore,
  postReleaseNodes,
  ragPipeline,
  ragSources,
  sdlcStages,
  solutionInputs,
  solutionOutputs,
  solutionZones,
  vectorItems,
  vectorLegend,
  type Persona,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

/* -------------------------------------------------------------------------- */
/* Title — the SDLC pipeline that fans out after release                       */
/* -------------------------------------------------------------------------- */

export function PipelineFan() {
  return (
    <figure className="afil-post-fig afil-post-pipeline">
      <div className="afil-post-pipeline-row">
        {sdlcStages.map((stage, i) => (
          <span key={stage.id} className="afil-post-pipeline-stage-wrap">
            {i > 0 && <span className="afil-post-arrow">→</span>}
            <span className={`afil-post-chip${stage.emphasized ? ' is-release' : ''}`}>
              {stage.label}
            </span>
          </span>
        ))}
      </div>

      <div className="afil-post-pipeline-drop">
        <span className="afil-post-drop-line" aria-hidden />
        <span className="afil-post-drop-label">then it ships — and the work fans out</span>
        <span className="afil-post-drop-line" aria-hidden />
      </div>

      <ul className="afil-post-fan">
        {postReleaseNodes.map((node) => (
          <li key={node.id} className="afil-post-fan-item">
            {node.label}
          </li>
        ))}
      </ul>

      <figcaption className="afil-post-cap">
        Eight post-release jobs, all hungry for the same context the build already
        created.
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* About — the little formula                                                  */
/* -------------------------------------------------------------------------- */

export function FormulaLine() {
  return (
    <p className="afil-post-formula">
      {aboutSlide.formulaInputs.map((term, i) => (
        <span key={term} className="afil-post-formula-term-wrap">
          {i > 0 && <span className="afil-post-formula-op">+</span>}
          <span className="afil-post-formula-term">{term}</span>
        </span>
      ))}
      <span className="afil-post-formula-op">=</span>
      <span className="afil-post-formula-out">{aboutSlide.formulaOutput}</span>
    </p>
  );
}

export function Portrait() {
  const { src, alt, caption } = aboutSlide.portrait;
  return (
    <figure className="afil-post-portrait">
      <div className="afil-post-portrait-frame">
        <Image src={src} alt={alt} fill sizes="(min-width: 700px) 320px, 90vw" />
      </div>
      <figcaption className="afil-post-cap">
        <strong>{caption.date}</strong> · {caption.context}. {caption.detail}
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Personas — one journey as a numbered timeline                               */
/* -------------------------------------------------------------------------- */

export function PersonaJourney({ persona }: { persona: Persona }) {
  return (
    <figure className="afil-post-persona">
      <header className="afil-post-persona-head">
        <span className="afil-post-avatar">
          <Image src={persona.avatar.src} alt={persona.avatar.alt} fill sizes="64px" />
        </span>
        <span className="afil-post-persona-id">
          <span className="afil-post-persona-name">{persona.name}</span>
          <span className="afil-post-persona-role">
            {persona.role}
            {persona.sub ? ` · ${persona.sub}` : ''}
          </span>
        </span>
      </header>

      <ol className="afil-post-steps">
        {persona.steps.map((step, i) => (
          <li key={step} className="afil-post-step">
            <span className="afil-post-step-num">{i + 1}</span>
            <span className="afil-post-step-label">{step}</span>
          </li>
        ))}
      </ol>

      {persona.metric && (
        <div className="afil-post-metric">
          <span className="afil-post-metric-label">{persona.metric.label}</span>
          <strong className="afil-post-metric-value">{persona.metric.value}</strong>
          <span className="afil-post-metric-cap">{persona.metric.caption}</span>
        </div>
      )}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Insight — the questions teams ask, as a cloud of pills                       */
/* -------------------------------------------------------------------------- */

export function QuestionCluster() {
  const questions = [...insightQuestions].sort((a, b) => a.order - b.order);
  return (
    <figure className="afil-post-fig afil-post-questions">
      {questions.map((q) => (
        <span key={q.id} className="afil-post-q">
          {q.label}
        </span>
      ))}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Solution — fragmented artifacts → the layer → reusable knowledge            */
/* -------------------------------------------------------------------------- */

export function Funnel() {
  const [inZone, layerZone, outZone] = solutionZones;
  return (
    <figure className="afil-post-fig afil-post-funnel">
      <div className="afil-post-funnel-col">
        <span className="afil-post-funnel-label">{inZone?.label}</span>
        <div className="afil-post-funnel-nodes">
          {solutionInputs.map((n) => (
            <span key={n.label} className="afil-post-node">
              {n.label}
            </span>
          ))}
        </div>
      </div>

      <div className="afil-post-funnel-core" aria-hidden>
        <span className="afil-post-funnel-arrow">→</span>
        <span className="afil-post-funnel-orb" />
        <span className="afil-post-funnel-arrow">→</span>
      </div>

      <div className="afil-post-funnel-col">
        <span className="afil-post-funnel-label is-layer">{layerZone?.label}</span>
        <div className="afil-post-funnel-nodes">
          {solutionOutputs.map((n) => (
            <span key={n.label} className="afil-post-node is-out">
              {n.label}
            </span>
          ))}
        </div>
        <span className="afil-post-funnel-label">{outZone?.label}</span>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Architecture — three capability lanes + the cross-lane wiring               */
/* -------------------------------------------------------------------------- */

const boxById = (id: string) => archBoxes.find((b) => b.id === id);
const connLabel = (from: string, to: string) =>
  archConnections.find((c) => c.from === from && c.to === to)?.label;

interface FlowNode {
  label: string;
  tags?: string;
  variant?: string;
}

function Lane({
  index,
  label,
  phases,
  nodes,
  links,
}: {
  index: string;
  label: string;
  phases: readonly string[];
  nodes: FlowNode[];
  links: (string | undefined)[];
}) {
  return (
    <div className="afil-post-lane">
      <div className="afil-post-lane-head">
        <span className="afil-post-lane-idx">{index}</span>
        <h4 className="afil-post-lane-title">{label}</h4>
      </div>
      <div className="afil-post-lane-phases">
        {phases.map((p) => (
          <span key={p} className="afil-post-phase">
            {p}
          </span>
        ))}
      </div>
      <ol className="afil-post-lane-flow">
        {nodes.map((node, i) => (
          <li key={node.label} className="afil-post-lane-step">
            {i > 0 && (
              <span className="afil-post-lane-link">
                <span className="afil-post-lane-link-arrow" aria-hidden>
                  ↓
                </span>
                {links[i - 1] && (
                  <span className="afil-post-lane-link-label">{links[i - 1]}</span>
                )}
              </span>
            )}
            <span className={`afil-post-box${node.variant ? ` is-${node.variant}` : ''}`}>
              <strong className="afil-post-box-label">{node.label}</strong>
              {node.tags && <span className="afil-post-box-tags">{node.tags}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CapabilityFlow() {
  const [memory, triage, feedback] = capabilityLanes;

  // map an arch box id to a flow node (label/tags/variant only)
  const toNodes = (ids: string[]): FlowNode[] =>
    ids
      .map(boxById)
      .filter((b): b is NonNullable<typeof b> => Boolean(b))
      .map((b) => ({ label: b.label, tags: b.tags, variant: b.variant }));

  const memoryNodes: FlowNode[] = [
    { label: archSourcesGroup.title, tags: archSourcesGroup.chips.join(' · '), variant: 'input' },
    ...toNodes(['ingestion', 'context-builder', 'knowledge-layer']),
  ];
  const memoryLinks = [
    connLabel('sdlc-sources', 'ingestion'),
    connLabel('ingestion', 'context-builder'),
    connLabel('context-builder', 'knowledge-layer'),
  ];

  const triageNodes = toNodes(['question-input', 'triage-runtime', 'evidence-output']);
  const triageLinks = [
    connLabel('question-input', 'triage-runtime'),
    connLabel('triage-runtime', 'evidence-output'),
  ];

  const feedbackNodes = toNodes(['feedback-analytics']);

  return (
    <figure className="afil-post-fig afil-post-arch">
      <div className="afil-post-lanes">
        {memory && (
          <Lane
            index={memory.index}
            label={memory.label}
            phases={memory.phases}
            nodes={memoryNodes}
            links={memoryLinks}
          />
        )}
        {triage && (
          <Lane
            index={triage.index}
            label={triage.label}
            phases={triage.phases}
            nodes={triageNodes}
            links={triageLinks}
          />
        )}
        {feedback && (
          <Lane
            index={feedback.index}
            label={feedback.label}
            phases={feedback.phases}
            nodes={feedbackNodes}
            links={[]}
          />
        )}
      </div>

      <ul className="afil-post-wiring">
        <li>
          <span className="afil-post-wire-kind is-bi">retrieval</span>
          {boxById('knowledge-layer')?.label} ⇄ {boxById('triage-runtime')?.label} —{' '}
          {connLabel('knowledge-layer', 'triage-runtime')}
        </li>
        <li>
          <span className="afil-post-wire-kind">hand-off</span>
          {boxById('evidence-output')?.label} → {boxById('feedback-analytics')?.label} —{' '}
          {connLabel('evidence-output', 'feedback-analytics')}
        </li>
        <li>
          <span className="afil-post-wire-kind is-loop">loop</span>
          {boxById('feedback-analytics')?.label} → {archSourcesGroup.title} —{' '}
          {connLabel('feedback-analytics', 'sdlc-sources')}
        </li>
      </ul>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* RAG — retrieve first, answer second                                         */
/* -------------------------------------------------------------------------- */

export function RagFlow() {
  const [step1, step2] = ragPipeline.steps;
  return (
    <figure className="afil-post-fig afil-post-rag">
      <div className="afil-post-rag-step">
        <span className="afil-post-rag-step-label">
          <strong>{step1?.prefix}</strong> {step1?.label}
        </span>
        <div className="afil-post-rag-row">
          <div className="afil-post-rag-sources">
            <span className="afil-post-rag-cap">{ragPipeline.sourcesLabel}</span>
            <div className="afil-post-rag-chips">
              {ragSources.map((s) => (
                <span key={s.id} className="afil-post-rag-chip">
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <span className="afil-post-arrow">→</span>
          <div className="afil-post-rag-db">{ragPipeline.vectorDbLabel}</div>
        </div>
      </div>

      <div className="afil-post-rag-step">
        <span className="afil-post-rag-step-label">
          <strong>{step2?.prefix}</strong> {step2?.label}
        </span>
        <div className="afil-post-rag-row is-wrap">
          <div className="afil-post-rag-pill is-q">
            <span className="afil-post-rag-cap">{ragPipeline.questionLabel}</span>
            {ragPipeline.question}
          </div>
          <span className="afil-post-arrow">→</span>
          <div className="afil-post-rag-pill">{ragPipeline.chunksLabel}</div>
          <span className="afil-post-arrow">→</span>
          <div className="afil-post-rag-pill is-ai">
            {ragPipeline.llmLabel}
            <span className="afil-post-rag-sub">{ragPipeline.llmSub}</span>
          </div>
          <span className="afil-post-arrow">→</span>
          <div className="afil-post-rag-pill is-out">{ragPipeline.responseLabel.join(' ')}</div>
        </div>
      </div>

      <p className="afil-post-rag-principle">
        {ragPipeline.principle.map((p, i) => (
          <span key={i} className={p.strong ? 'is-strong' : undefined}>
            {p.text}{' '}
          </span>
        ))}
      </p>
    </figure>
  );
}

export function VectorCluster() {
  const similar = vectorItems.filter((v) => v.id !== 'billing');
  const outlier = vectorItems.find((v) => v.id === 'billing');

  const Dot = ({ item }: { item: (typeof vectorItems)[number] }) => (
    <span className={`afil-post-vec-item is-${item.accent}`}>
      <span className="afil-post-vec-dot" aria-hidden />
      <span className="afil-post-vec-text">
        <span className="afil-post-vec-phrase">{item.lines.join(' ')}</span>
        <span className="afil-post-vec-nums">[{item.vector.join(', ')}]</span>
      </span>
    </span>
  );

  return (
    <figure className="afil-post-fig afil-post-vectors">
      <div className="afil-post-vec-group is-cluster">
        <span className="afil-post-vec-group-label">Same idea → land together</span>
        {similar.map((item) => (
          <Dot key={item.id} item={item} />
        ))}
      </div>
      {outlier && (
        <div className="afil-post-vec-group is-far">
          <span className="afil-post-vec-group-label">Different topic → sits apart</span>
          <Dot item={outlier} />
        </div>
      )}
      <figcaption className="afil-post-cap is-center">{vectorLegend}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Payoff — before vs after                                                    */
/* -------------------------------------------------------------------------- */

// The "Before" fog labels are baked into a dark PNG on the slide; rebuilt here
// as light chips so they fit the post's theme (kept in sync with that art).
const FOG_SOURCES = ['PRs', 'Docs', 'Slack', 'Tickets', 'Logs', 'Release notes'];

export function BeforeAfter() {
  return (
    <figure className="afil-post-fig afil-post-beforeafter">
      <div className="afil-post-ba-card is-before">
        <header className="afil-post-ba-head">
          <span className="afil-post-ba-title">{payoffBefore.head.title}</span>
          <span className="afil-post-ba-sub">{payoffBefore.head.subtitle}</span>
        </header>
        <span className="afil-post-ba-ticket">? {payoffBefore.ticket}</span>
        <div className="afil-post-ba-fog">
          {FOG_SOURCES.map((s) => (
            <span key={s} className="afil-post-ba-fog-chip">
              {s}
            </span>
          ))}
        </div>
        <div className="afil-post-ba-outcome is-bad">
          {payoffBefore.outcomeLines.join(' ')}
        </div>
      </div>

      <div className="afil-post-ba-card is-after">
        <header className="afil-post-ba-head">
          <span className="afil-post-ba-title">{payoffAfter.head.title}</span>
          <span className="afil-post-ba-sub">{payoffAfter.head.subtitle}</span>
        </header>
        <span className="afil-post-ba-ticket">? {payoffAfter.ticket}</span>
        <span className="afil-post-arrow is-down">↓</span>
        <div className="afil-post-ba-layer">
          <span className="afil-post-ba-layer-name">{payoffAfter.layerName}</span>
          <ul className="afil-post-ba-outputs">
            {payoffAfter.outputs.map((o) => (
              <li key={o.id}>{o.label}</li>
            ))}
          </ul>
        </div>
        <span className="afil-post-arrow is-down">↓</span>
        <div className="afil-post-ba-outcome is-good">{payoffAfter.outcome}</div>
      </div>
    </figure>
  );
}
