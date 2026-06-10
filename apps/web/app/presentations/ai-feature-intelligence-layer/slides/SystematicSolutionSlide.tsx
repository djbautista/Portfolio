import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { FadeIn } from '@/app/presentations/ai-feature-intelligence-layer/components/FadeIn';
import { SolutionFlow } from '@/app/presentations/ai-feature-intelligence-layer/components/SolutionFlow';
import { solutionSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 5: the systematic solution — an AI Feature Intelligence Layer that turns
 * fragmented SDLC artifacts into reusable operational knowledge. The prototype is
 * static; entrance is a subtle FadeIn cascade (eyebrow → title → thesis → diagram
 * → footer), opacity-only so the absolutely-positioned children keep their
 * coordinates.
 */
export function SystematicSolutionSlide() {
  return (
    <SlideFrame variant="solution">
      <FadeIn>
        <p className="eyebrow">
          <span className="dot" />
          <span>{solutionSlide.eyebrow}</span>
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <h2 className="title">
          {solutionSlide.titleLead}
          <span className="hl">{solutionSlide.titleHl}</span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.16}>
        <p className="thesis">
          {solutionSlide.thesisLead}
          <span className="hl">{solutionSlide.thesisHl}</span>
          {solutionSlide.thesisTrail}
        </p>
      </FadeIn>

      <FadeIn delay={0.24}>
        <SolutionFlow />
      </FadeIn>

      <FadeIn delay={0.34}>
        <div className="footer">
          <span className="bar" />
          <span>{solutionSlide.footer}</span>
        </div>
      </FadeIn>
    </SlideFrame>
  );
}
