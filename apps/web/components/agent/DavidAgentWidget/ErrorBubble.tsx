'use client';

import { AlertCircle, RefreshCw } from 'react-feather';
import { contact } from '@portfolio/content';

interface ErrorBubbleProps {
  onRetry: () => void;
}

export function ErrorBubble({ onRetry }: ErrorBubbleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        paddingRight: 32,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          overflow: 'hidden',
          flex: '0 0 auto',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.35)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={16} color="#ef4444" strokeWidth={1.75} />
      </div>
      <div
        style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.32)',
          borderRadius: 14,
          borderBottomLeftRadius: 6,
          padding: '10px 13px',
          fontSize: 13.5,
          lineHeight: 1.55,
          color: 'var(--fg-2)',
          fontWeight: 300,
        }}
      >
        <div
          style={{
            fontWeight: 500,
            color: 'var(--fg-1)',
            marginBottom: 2,
          }}
        >
          The agent took a coffee break.
        </div>
        <div style={{ color: 'var(--fg-3)' }}>
          Couldn&apos;t reach David&apos;s brain just now — that&apos;s on me, not you.
          Try again, or just email{' '}
          <a
            href={`mailto:${contact.email}`}
            style={{ color: 'var(--color-primary-300)' }}
          >
            {contact.email}
          </a>
          .
        </div>
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 6,
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.45)',
            borderBottomWidth: 3,
            color: '#fca5a5',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} strokeWidth={1.75} />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}
