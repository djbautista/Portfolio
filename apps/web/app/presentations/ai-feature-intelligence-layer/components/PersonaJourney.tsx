import Image from 'next/image';

import type { Persona } from '@/app/presentations/ai-feature-intelligence-layer/data';
import { MetricCallout } from './MetricCallout';

interface PersonaJourneyProps {
  persona: Persona;
  /** row position class: `r0` | `r1` | `r2` */
  rowClass: string;
  /** staged-reveal state classes (e.g. `revealed dim` / `revealed focus`) */
  stateClass: string;
}

/**
 * One horizontal persona journey: avatar + identity, a five-step timeline, and
 * (Peter only) a trailing metric callout. Staged-reveal classes are supplied by
 * the parent slide so the 1/3 → 3/3 progression stays a single source of truth.
 */
export function PersonaJourney({ persona, rowClass, stateClass }: PersonaJourneyProps) {
  const lastIndex = persona.steps.length - 1;

  return (
    <div className={`p-row ${rowClass} ${stateClass}`.trim()}>
      <span className="p-bar" />

      <div className="p-persona">
        <div className="p-avatar">
          <Image src={persona.avatar.src} alt={persona.avatar.alt} width={124} height={124} />
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
        <div className="line" />
        <div className="fill" />
        <div className="p-nodes">
          {persona.steps.map((step, i) => (
            <div key={step} className={`p-node n${i}${i === lastIndex ? ' end' : ''}`}>
              <span className="p-dot" />
              <span className="p-step">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {persona.metric ? <MetricCallout {...persona.metric} /> : null}
    </div>
  );
}
