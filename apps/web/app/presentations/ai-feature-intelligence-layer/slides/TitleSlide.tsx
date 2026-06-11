import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { SDLCFlow } from '@/app/presentations/ai-feature-intelligence-layer/components/SDLCFlow';
import { titleSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

interface TitleSlideProps {
  /**
   * 0 = resting (header front, diagram faint, "AI Layer" caption hidden);
   * 1 = focus the diagram + dim the header;
   * 2–9 = spotlight one post-release bullet at a time (activeNode = stage - 2);
   * 10 = restore all bullets to their normal style (no spotlight);
   * 11 = reveal the red "AI Layer" caption + spine + release hand-off.
   */
  stage?: number;
}

export function TitleSlide({ stage = 0 }: TitleSlideProps) {
  // stages 2–9 walk the 8 post-release bullets one at a time; stage 10 ends the
  // walk (bullets back to normal) before the AI layer is revealed at stage 11.
  const activeNode = stage >= 2 && stage <= 9 ? stage - 2 : -1;
  const stageClass = [
    stage >= 1 ? 'focus-graph' : '',
    activeNode >= 0 ? 'walking' : '',
    stage >= 11 ? 'reveal-layer' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SlideFrame variant="title" className={stageClass || undefined}>
      <div className="header">
        <p className="eyebrow">
          <span className="dot" />
          <span>{titleSlide.eyebrow}</span>
        </p>
        <h1 className="title">
          {titleSlide.titleLead}
          <span className="accent">{titleSlide.titleAccent}</span>
          {titleSlide.titleTrail}
        </h1>
        <p className="subtitle">{titleSlide.subtitle}</p>
      </div>

      <SDLCFlow activeNode={activeNode} />

      <div className="footer">
        <span className="bar" />
        <span>{titleSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
