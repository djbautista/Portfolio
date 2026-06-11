import { useEffect, useState } from 'react';

import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { SolutionFlow } from '@/app/presentations/ai-feature-intelligence-layer/components/SolutionFlow';
import { solutionSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 5: the systematic solution — an AI Feature Intelligence Layer that turns
 * fragmented SDLC artifacts into reusable operational knowledge.
 *
 * Mirror of the Insight slide's reveal: it OPENS on the thesis centered in the
 * window over the slide's standing chrome (eyebrow, title, footer), with only the
 * diagram held back (the `lead` modifier, stage 0). Advancing settles the thesis
 * into its header slot and reveals the diagram — driven by CSS transitions on the
 * staged elements, so the deck-level crossfade covers the initial entrance and no
 * per-element FadeIn cascade is needed here.
 */
export function SystematicSolutionSlide({ stage }: { stage: number }) {
  const lead = stage < 1;

  // Fire the centered "wow" entrance reliably on slide entry. The slide renders
  // the lead state hidden first, then flips `enter` on the next frame so the CSS
  // keyframes (re)start every time — a freshly-mounted element whose class
  // already names the animation doesn't dependably restart it under the deck's
  // crossfade remount, which left the statement stranded invisible. Returning to
  // stage 0 from stage 1 replays it too (enter→lead.enter re-adds the name).
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!lead) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [lead]);

  const className =
    [lead ? 'lead' : '', lead && entered ? 'enter' : ''].filter(Boolean).join(' ') || undefined;

  return (
    <SlideFrame variant="solution" className={className}>
      <p className="eyebrow">
        <span className="dot" />
        <span>{solutionSlide.eyebrow}</span>
      </p>

      <h2 className="title">
        {solutionSlide.titleLead}
        <span className="hl">{solutionSlide.titleHl}</span>
      </h2>

      <p className="thesis">
        {solutionSlide.thesisLead}
        <span className="hl">{solutionSlide.thesisHl}</span>
        {solutionSlide.thesisTrail}
      </p>

      <SolutionFlow />

      <div className="footer">
        <span className="bar" />
        <span>{solutionSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
