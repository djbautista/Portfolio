'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  text: string;
  // True when this bubble is the first of a contiguous assistant run; controls
  // whether the avatar slot is rendered or replaced with an invisible spacer
  // (matching the design's AssistantBubble.first logic).
  first?: boolean;
}

const inlineCmdStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11.5,
  padding: '1px 5px',
  borderRadius: 3,
  background: 'rgba(14,165,233,0.10)',
  color: 'var(--color-primary-200)',
  border: '1px solid var(--color-primary-800)',
  margin: '0 1px',
};

export function ChatMessageBubble({
  role,
  text,
  first = true,
}: ChatMessageBubbleProps) {
  if (role === 'user') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingLeft: 36,
        }}
      >
        <div
          style={{
            maxWidth: '88%',
            background: 'var(--color-primary-500)',
            border: '1px solid var(--color-primary-600)',
            borderBottomWidth: 3,
            borderRadius: 14,
            borderBottomRightRadius: 6,
            padding: '10px 13px',
            fontSize: 13.5,
            lineHeight: 1.5,
            fontWeight: 400,
            color: '#fafafa',
            boxShadow: '0 4px 14px -6px rgba(14,165,233,0.55)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        paddingRight: 32,
      }}
    >
      {first ? (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            overflow: 'hidden',
            flex: '0 0 auto',
            border: '1px solid var(--color-secondary-800)',
            background: 'var(--bg-surface-2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/profile.jpg"
            alt=""
            width={26}
            height={26}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{ width: 26, height: 1, flex: '0 0 auto' }}
        />
      )}
      <div
        style={{
          maxWidth: '100%',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          borderBottomLeftRadius: 6,
          padding: '10px 13px',
          fontSize: 13.5,
          lineHeight: 1.55,
          color: 'var(--fg-2)',
          fontWeight: 300,
          whiteSpace: 'pre-wrap',
        }}
      >
        <ReactMarkdown
          // Inline-only renderer: paragraphs collapse to plain children,
          // headings/lists/images degrade to plain text. The assistant should
          // read as conversational, not as docs.
          components={{
            p: ({ children }) => <>{children}</>,
            strong: ({ children }) => (
              <strong style={{ color: 'var(--fg-1)', fontWeight: 600 }}>
                {children}
              </strong>
            ),
            em: ({ children }) => <em>{children}</em>,
            code: ({ children }) => (
              <code style={inlineCmdStyle}>{children}</code>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary-300)' }}
              >
                {children}
              </a>
            ),
            h1: ({ children }) => <>{children}</>,
            h2: ({ children }) => <>{children}</>,
            h3: ({ children }) => <>{children}</>,
            h4: ({ children }) => <>{children}</>,
            h5: ({ children }) => <>{children}</>,
            h6: ({ children }) => <>{children}</>,
            ul: ({ children }) => <>{children}</>,
            ol: ({ children }) => <>{children}</>,
            li: ({ children }) => <>{children} </>,
            pre: ({ children }) => <>{children}</>,
            img: () => null,
            hr: () => null,
            blockquote: ({ children }) => <>{children}</>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
