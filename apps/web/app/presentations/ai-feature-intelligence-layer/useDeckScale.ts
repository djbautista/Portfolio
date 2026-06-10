import { useEffect, useState } from 'react';

const DECK_WIDTH = 1920;
const DECK_HEIGHT = 1080;

/**
 * Fits the fixed 1920×1080 deck plane into the current viewport, preserving the
 * 16:9 proportions (letterboxed). Replaces the prototype's custom `deck-stage`
 * scaling. Returns the scale factor to apply via `transform: scale(...)`.
 */
export function useDeckScale(): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const next = Math.min(
        window.innerWidth / DECK_WIDTH,
        window.innerHeight / DECK_HEIGHT,
      );
      setScale(next > 0 ? next : 1);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}
