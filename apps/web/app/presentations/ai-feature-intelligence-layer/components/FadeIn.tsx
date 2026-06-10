import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Subtle entrance polish for a single slide element: fades from opacity 0 to its
 * resting state. Resting state is fully visible — when `prefers-reduced-motion`
 * is set, `initial={false}` skips straight to it. Uses the deck's `--ease` curve
 * so it matches the slide-level crossfade in `PresentationDeck`. Stagger siblings
 * by passing increasing `delay` values.
 *
 * Opacity ONLY — no transform. Every slide lives on the absolutely-positioned
 * 1920×1080 plane, and a `transform` on this wrapper would make it the containing
 * block for its absolutely-positioned child, breaking that child's `top`/`bottom`
 * coordinates. Opacity has no such side effect and multiplies through the wrapper
 * (so e.g. the 0.3-opacity question labels still land at 0.3).
 */
export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
