import type { Metadata } from 'next';

import { deckMeta } from '@/app/presentations/ai-feature-intelligence-layer/data';

import { PostArticle } from './PostArticle';

export const metadata: Metadata = {
  title: `Read — ${deckMeta.title}`,
  description: 'The AI Feature Intelligence Layer deck as a read-anywhere article.',
  robots: { index: false, follow: false },
};

export default function PostPage() {
  return <PostArticle />;
}
