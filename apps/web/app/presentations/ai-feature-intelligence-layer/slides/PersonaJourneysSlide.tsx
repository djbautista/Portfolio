import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { PersonaJourney } from '@/app/presentations/ai-feature-intelligence-layer/components/PersonaJourney';
import { GhostCrowd } from '@/app/presentations/ai-feature-intelligence-layer/components/GhostCrowd';
import { ChevronLeft, ChevronRight } from '@/app/presentations/ai-feature-intelligence-layer/icons';
import {
  personaSlide,
  personas,
  personaStageCount,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

interface PersonaJourneysSlideProps {
  /**
   * Global beat: 0..personaStageCount-1 reveal the journeys one element at a
   * time; the final beat (personaStageCount) is the synthesis moment.
   */
  stage: number;
  onStagePrev: () => void;
  onStageNext: () => void;
}

const ROW_CLASSES = ['r0', 'r1', 'r2'];

interface RowReveal {
  /** identity (avatar + name + role) is shown */
  started: boolean;
  /** this persona is the one currently being revealed */
  active: boolean;
  /** this persona is fully revealed and an later one is now active */
  done: boolean;
  /** how many timeline steps are shown (0..steps.length) */
  revealedSteps: number;
  /** Peter's trailing metric callout is shown (its last step has landed) */
  metricRevealed: boolean;
  /** progress-line fill fraction (0..1) up to the latest revealed step */
  fillFrac: number;
}

/**
 * Map the global beat index onto each persona row. Each persona owns one
 * identity beat (local 0) followed by one beat per step (local 1..steps.length),
 * so the journeys build one element at a time, left to right, top to bottom.
 * On the synthesis beat all three are forced fully revealed and equal (no
 * dim/focus) — the canvas's `.synthesis` class then fades the journeys out and
 * recenters the profiles.
 */
function buildRows(stage: number, synthesis: boolean): RowReveal[] {
  let start = 0;
  return personas.map((persona) => {
    if (synthesis) {
      return {
        started: true,
        active: false,
        done: false,
        revealedSteps: persona.steps.length,
        metricRevealed: true,
        fillFrac: 1,
      };
    }

    const beats = 1 + persona.steps.length;
    const local = stage - start;
    start += beats;

    const revealedSteps = Math.max(0, Math.min(local, persona.steps.length));
    return {
      started: local >= 0,
      active: local >= 0 && local < beats,
      done: local >= beats,
      revealedSteps,
      metricRevealed: revealedSteps === persona.steps.length,
      fillFrac:
        revealedSteps <= 1 ? 0 : (revealedSteps - 1) / (persona.steps.length - 1),
    };
  });
}

/**
 * Slide 3: three stacked persona journeys revealed one element at a time. The
 * deck owns the beat (so ArrowLeft/Right hands off to slide navigation at the
 * boundaries); this component renders it. The active persona is focused, fully
 * revealed earlier ones are dimmed, and not-yet-reached ones stay hidden.
 */
export function PersonaJourneysSlide({ stage, onStagePrev, onStageNext }: PersonaJourneysSlideProps) {
  const maxStage = personaStageCount;
  const synthesis = stage >= personaStageCount;
  const rows = buildRows(stage, synthesis);
  const activeIndex = synthesis
    ? personas.length - 1
    : Math.max(0, rows.findIndex((r) => r.active));

  return (
    <SlideFrame variant="persona" className={`staged${synthesis ? ' synthesis' : ''}`}>
      <GhostCrowd />
      <p className="p-eyebrow">
        <span className="dot" />
        <span>{personaSlide.eyebrow}</span>
      </p>
      <h2 className="p-title">
        {personaSlide.titleLead}
        <span className="hl">{personaSlide.titleHl}</span>
      </h2>

      {personas.map((persona, i) => {
        const row = rows[i]!;
        const stateClass = [
          row.started ? 'revealed' : '',
          row.done ? 'dim' : '',
          row.active ? 'focus' : '',
          row.metricRevealed ? 'show-metric' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <PersonaJourney
            key={persona.id}
            persona={persona}
            rowClass={ROW_CLASSES[i]!}
            stateClass={stateClass}
            revealedSteps={row.revealedSteps}
            fillFrac={row.fillFrac}
          />
        );
      })}

      <div className="p-progress">
        <button
          className="p-nav"
          type="button"
          aria-label="Previous step"
          onClick={onStagePrev}
          disabled={stage === 0}
        >
          <ChevronLeft />
        </button>
        <div className="p-segs">
          {personas.map((persona, i) => (
            <span key={persona.id} className={`p-seg${rows[i]!.started ? ' on' : ''}`} />
          ))}
        </div>
        <span className="p-count">
          <span className="now">{activeIndex + 1}</span> / <span className="tot">{personas.length}</span>
        </span>
        <button
          className="p-nav"
          type="button"
          aria-label="Next step"
          onClick={onStageNext}
          disabled={stage === maxStage}
        >
          <ChevronRight />
        </button>
      </div>

      <div className="p-footer">
        <span className="bar" />
        <span>{personaSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
