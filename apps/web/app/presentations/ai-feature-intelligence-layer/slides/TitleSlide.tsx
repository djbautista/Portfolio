import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { SDLCFlow } from '@/app/presentations/ai-feature-intelligence-layer/components/SDLCFlow';
import { titleSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

export function TitleSlide() {
  return (
    <SlideFrame variant="title">
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

      <SDLCFlow />

      <div className="footer">
        <span className="bar" />
        <span>{titleSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
