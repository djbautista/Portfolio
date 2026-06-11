import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { FadeIn } from '@/app/presentations/ai-feature-intelligence-layer/components/FadeIn';
import { demoSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 8 — "Demo time." A single-beat interstitial that hands the room off to
 * the live demo (run outside the deck). No internal stages: it's the closing
 * wow moment, so the visual work is all motion — a "going live" pulse radiating
 * from behind the title and a blinking terminal cursor — over a centered title.
 * Both animations are pure CSS keyframes, so the global reduced-motion rule in
 * `presentation.css` freezes them to their resting state automatically.
 */
export function DemoSlide() {
  return (
    <SlideFrame variant="demo">
      {/* radiating "going live" signal behind the title */}
      <div className="d-pulse" aria-hidden>
        <span className="ring" />
        <span className="ring" />
        <span className="ring" />
      </div>

      <div className="d-center">
        <FadeIn>
          <p className="d-eyebrow">
            <span className="dot" />
            <span>{demoSlide.eyebrow}</span>
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="d-title">
            {demoSlide.titleLead}
            <span className="accent">{demoSlide.titleAccent}</span>
            <span className="d-cursor" aria-hidden />
          </h2>
        </FadeIn>
        <FadeIn delay={0.22}>
          <p className="d-subtitle">{demoSlide.subtitle}</p>
        </FadeIn>
      </div>

      <FadeIn delay={0.34}>
        <div className="d-footer">
          <span className="bar" />
          <span>{demoSlide.footer}</span>
        </div>
      </FadeIn>
    </SlideFrame>
  );
}
