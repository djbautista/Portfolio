import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { FadeIn } from '@/app/presentations/ai-feature-intelligence-layer/components/FadeIn';
import { insightQuestions, insightSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

export function InsightSlide() {
  return (
    <SlideFrame variant="insight">
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
