import type { ReactNode } from 'react';

export type SlideVariant = 'title' | 'about' | 'persona' | 'insight' | 'solution';

interface SlideFrameProps {
  variant: SlideVariant;
  children: ReactNode;
  /** extra classes on the canvas (e.g. `staged` for the persona slide) */
  className?: string;
}

/**
 * A single slide on the fixed 1920×1080 plane. The outer `.afil-slide` carries
 * the per-slide background wash; the inner `.afil-canvas` is the coordinate
 * plane that the slide's absolutely-positioned content lives in.
 */
export function SlideFrame({ variant, children, className }: SlideFrameProps) {
  return (
    <div className={`afil-slide ${variant}`}>
      <div className={`afil-canvas afil-${variant}${className ? ` ${className}` : ''}`}>
        {children}
      </div>
    </div>
  );
}
