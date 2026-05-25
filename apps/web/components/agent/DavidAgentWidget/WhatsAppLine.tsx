'use client';

import { ArrowUpRight } from 'react-feather';

import { WhatsAppGlyph } from './WhatsAppGlyph';

interface WhatsAppLineProps {
  hasMessages: boolean;
  href: string | undefined;
}

// Persistent side-door between scroll region and composer. Always visible
// regardless of state so reach-the-human is one click away without competing
// with the composer for attention.
//
// Returns null when no WhatsApp number is configured — see contact.ts.
export function WhatsAppLine({ hasMessages, href }: WhatsAppLineProps) {
  if (!href) return null;
  return (
    <div
      style={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 14px 8px',
        borderTop: '1px solid var(--border-subtle)',
        background:
          'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(37,211,102,0.025) 100%)',
        fontSize: 11.5,
        color: 'var(--fg-4)',
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--fg-4)',
        }}
      >
        <WhatsAppGlyph size={11} />
        <span>Prefer WhatsApp?</span>
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          hasMessages
            ? 'Continue this conversation on WhatsApp'
            : 'Open a new WhatsApp conversation with David'
        }
        className="cw-focus-ring"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: 'var(--fg-2)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 11.5,
          fontWeight: 500,
          textDecoration: 'underline',
          textDecorationColor: 'rgba(37,211,102,0.5)',
          textUnderlineOffset: 3,
        }}
      >
        <span>{hasMessages ? 'Continue this chat there' : 'Continue there'}</span>
        <ArrowUpRight size={11} strokeWidth={1.75} />
      </a>
    </div>
  );
}
