import Image from 'next/image';

import type { Persona } from '@/app/presentations/ai-feature-intelligence-layer/data';
import { MetricCallout } from './MetricCallout';

interface PersonaJourneyProps {
  persona: Persona;
  /** row position class: `r0` | `r1` | `r2` */
  rowClass: string;
  /** staged-reveal state classes (e.g. `revealed dim` / `revealed focus`) */
  stateClass: string;
  /** how many timeline steps are currently revealed (0..steps.length) */
  revealedSteps: number;
  /** progress-line fill fraction (0..1) up to the latest revealed step */
  fillFrac: number;
}

/**
 * One horizontal persona journey: avatar + identity, a five-step timeline, and
 * (Peter only) a trailing metric callout. The parent slide drives the reveal —
 * identity via `revealed`, then each step in turn via `revealedSteps` — so the
 * beat sequence stays a single source of truth.
 */
export function PersonaJourney({
  persona,
  rowClass,
  stateClass,
  revealedSteps,
  fillFrac,
}: PersonaJourneyProps) {
  const lastIndex = persona.steps.length - 1;

  return (
    <div className={`p-row ${rowClass} ${stateClass}`.trim()}>
      <span className="p-bar" />

      <div className="p-persona">
        <div className="p-avatar">
          <Image src={persona.avatar.src} alt={persona.avatar.alt} width={156} height={156} />
        </div>
        <div className="p-id">
          <p className="p-name">{persona.name}</p>
          <p className="p-role">
            <span className="tick" />
            {persona.role}
          </p>
          {persona.sub ? <p className="p-sub">{persona.sub}</p> : null}
        </div>
      </div>

      <div className="p-track">
        <div className="line" style={{ transform: `scaleX(${fillFrac})` }} />
        <div className="fill" style={{ transform: `scaleX(${fillFrac})` }} />
        <div className="p-nodes">
          {persona.steps.map((step, i) => {
            const cls = `p-node n${i}${i === lastIndex ? ' end' : ''}${
              i < revealedSteps ? ' shown' : ''
            }`;
            return (
              <div key={step} className={cls}>
                <span className="p-dot" />
                <span className="p-step">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {persona.metric ? <MetricCallout {...persona.metric} /> : null}
    </div>
  );
}
