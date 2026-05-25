import type { Metadata } from 'next';

import { TwilioInterviewClient } from './TwilioInterviewClient';

export const metadata: Metadata = {
  title: 'Twilio Interview Room — David Bautista',
  description:
    'A focused view of the systems, stories, and technical decisions I’d love to discuss today.',
  robots: { index: false, follow: false },
};

export default function TwilioInterviewPage() {
  return <TwilioInterviewClient />;
}
