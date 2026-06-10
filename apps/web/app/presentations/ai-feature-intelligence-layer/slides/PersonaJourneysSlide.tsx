import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { PersonaJourney } from '@/app/presentations/ai-feature-intelligence-layer/components/PersonaJourney';
import { ChevronLeft, ChevronRight } from '@/app/presentations/ai-feature-intelligence-layer/icons';
import { personaSlide, personas } from '@/app/presentations/ai-feature-intelligence-layer/data';

interface PersonaJourneysSlideProps {
  /** active journey index (0..2); also the 1/3 → 3/3 reveal stage */
  stage: number;
  onStagePrev: () => void;
  onStageNext: () => void;
}

const ROW_CLASSES = ['r0', 'r1', 'r2'];

/**
 * Slide 3: three stacked persona journeys with an in-slide 1/3 → 3/3 reveal.
 * Reveal state is owned by the deck (so ArrowLeft/Right can hand off to slide
 * navigation at the boundaries); this component renders it. Rows at or before
 * the stage are revealed, earlier ones dimmed, and the current one focused.
 */
export function PersonaJourneysSlide({ stage, onStagePrev, onStageNext }: PersonaJourneysSlideProps) {
  const maxStage = personas.length - 1;

  return (
    <SlideFrame variant="persona" className="staged">
      <p className="p-eyebrow">
        <span className="dot" />
        <span>{personaSlide.eyebrow}</span>
      </p>
      <h2 className="p-title">
        {personaSlide.titleLead}
        <span className="hl">{personaSlide.titleHl}</span>
      </h2>

      {personas.map((persona, i) => {
        const revealed = i <= stage;
        const stateClass = [
          revealed ? 'revealed' : '',
          i < stage ? 'dim' : '',
          i === stage ? 'focus' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <PersonaJourney
            key={persona.id}
            persona={persona}
            rowClass={ROW_CLASSES[i]!}
            stateClass={stateClass}
          />
        );
      })}

      <div className="p-progress">
        <button
          className="p-nav"
          type="button"
          aria-label="Previous perspective"
          onClick={onStagePrev}
          disabled={stage === 0}
        >
          <ChevronLeft />
        </button>
        <div className="p-segs">
          {personas.map((persona, i) => (
            <span key={persona.id} className={`p-seg${i <= stage ? ' on' : ''}`} />
          ))}
        </div>
        <span className="p-count">
          <span className="now">{stage + 1}</span> / <span className="tot">{personas.length}</span>
        </span>
        <button
          className="p-nav"
          type="button"
          aria-label="Next perspective"
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
