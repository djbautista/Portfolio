'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { ChatMessageBubble } from './ChatMessageBubble';
import { ErrorBubble } from './ErrorBubble';
import { TypingBubble } from './TypingBubble';
import type { ChatMessage } from './types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  sending: boolean;
  error: boolean;
  onRetry: () => void;
  emptyState: ReactNode;
}

export function ChatMessageList({
  messages,
  sending,
  error,
  onRetry,
  emptyState,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, sending, error]);

  const empty = messages.length === 0 && !sending && !error;

  return (
    <div
      ref={scrollRef}
      style={{
        flex: '1 1 auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '18px 16px 16px',
      }}
    >
      {empty ? (
        emptyState
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const firstOfRun = !prev || prev.role !== m.role;
            return (
              <ChatMessageBubble
                key={m.id}
                role={m.role}
                text={m.text}
                first={firstOfRun}
              />
            );
          })}
          {sending && <TypingBubble />}
          {error && <ErrorBubble onRetry={onRetry} />}
        </div>
      )}
    </div>
  );
}
