import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { FadeIn } from '@/app/presentations/ai-feature-intelligence-layer/components/FadeIn';
import { insightQuestions, insightSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * stage 0 — resting: the central insight reads first, questions sit dim around it.
 * stage 1 — `questions` modifier brings the scattered question symptoms forward
 * (full opacity, a touch larger) and dims the central insight + support behind
 * them, so they can be talked through.
 * stage 2 — `focus` modifier fades the questions out entirely and restores the
 * central insight + support, clean on its own, before advancing to the next slide.
 */
export function InsightSlide({ stage }: { stage: number }) {
  const className = stage >= 2 ? 'focus' : stage >= 1 ? 'questions' : undefined;
  return (
    <SlideFrame variant="insight" className={className}>
      <FadeIn>
        <p className="i-eyebrow">
          <span className="dot" />
          <span>{insightSlide.eyebrow}</span>
        </p>
      </FadeIn>
      <FadeIn delay={0.08}>
        <h2 className="i-title">
          {insightSlide.titleLead}
          <span className="hl">{insightSlide.titleHl}</span>
        </h2>
      </FadeIn>

      {/* central insight (the visual anchor) — arrives before the symptoms */}
      <FadeIn delay={0.2}>
        <div className="i-core">
          <p className="i-main">
            {insightSlide.mainLead}
            <span className="hl">{insightSlide.mainHl}</span>
            {insightSlide.mainTrail}
          </p>
          <p className="i-support">{insightSlide.support}</p>
        </div>
      </FadeIn>

      {/* orbiting question symptoms (visually secondary) — trickle in after, staggered */}
      {insightQuestions.map((q, i) => (
        <FadeIn key={q.id} delay={0.4 + i * 0.06}>
          <div className="i-q" style={{ left: q.x, top: q.y }}>
            <span className="qd" />
            {q.label}
          </div>
        </FadeIn>
      ))}

      <FadeIn delay={0.5}>
        <div className="i-footer">
          <span className="bar" />
          <span>{insightSlide.footer}</span>
        </div>
      </FadeIn>
    </SlideFrame>
  );
}
