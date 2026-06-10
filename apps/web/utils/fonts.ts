import { Manrope, Silkscreen, Space_Grotesk } from 'next/font/google';

export const silkscreen = Silkscreen({ weight: ['700'], subsets: ['latin'] });

/**
 * Display + body fonts for the "AI Feature Intelligence Layer" presentation deck.
 * Exposed as CSS variables so the deck's scoped CSS can reference them via
 * `font-family: var(--font-space-grotesk)` (display) / `var(--font-manrope)` (body),
 * mirroring the prototype's Space Grotesk + Manrope pairing.
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-manrope',
});
