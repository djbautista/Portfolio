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

// Inline visually-hidden style — avoids a Tailwind dependency on this one
// span and keeps the component self-contained.
const srOnlyStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

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
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-busy={sending || undefined}
      aria-label="Conversation with David Agent"
      style={{
        flex: '1 1 auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '18px 16px 16px',
      }}
    >
      {/* The typing bubble is decorative for screen readers (the dots aren't
          announced). This node carries the announcement so assistive tech
          hears that David Agent is thinking, parallel to the visual state. */}
      <span style={srOnlyStyle} aria-live="polite" role="status">
        {sending ? 'David Agent is thinking…' : ''}
      </span>
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
