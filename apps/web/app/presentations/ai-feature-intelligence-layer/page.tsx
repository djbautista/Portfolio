import type { Metadata } from 'next';

import { deckMeta } from './data';
import { PresentationDeck } from './PresentationDeck';

export const metadata: Metadata = {
  title: `${deckMeta.title} — David Bautista`,
  description: deckMeta.description,
  robots: { index: false, follow: false },
};

export default function AiFeatureIntelligenceLayerPage() {
  return <PresentationDeck />;
}
