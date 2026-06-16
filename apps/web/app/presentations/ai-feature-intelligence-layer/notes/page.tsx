import type { Metadata } from 'next';

import { deckMeta } from '@/app/presentations/ai-feature-intelligence-layer/data';

import { SpeakerNotesView } from './SpeakerNotesView';

export const metadata: Metadata = {
  title: `Speaker notes — ${deckMeta.title}`,
  description: 'Presenter notes that follow the live deck in lock-step.',
  robots: { index: false, follow: false },
};

export default function SpeakerNotesPage() {
  return <SpeakerNotesView />;
}
