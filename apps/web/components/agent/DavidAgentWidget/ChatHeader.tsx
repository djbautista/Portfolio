'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { X } from 'react-feather';

import { silkscreen } from '@/utils/fonts';

import { WhatsAppGlyph } from './WhatsAppGlyph';

interface ChatHeaderProps {
  hasMessages: boolean;
  whatsappHref: string;
  onClose: () => void;
}

const iconButtonStyle: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid var(--border-subtle)',
  background: 'transparent',
  color: 'var(--fg-3)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 150ms',
};

export function ChatHeader({
  hasMessages,
  whatsappHref,
  onClose,
}: ChatHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 14px 14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(217,70,239,0.04)',
        flex: '0 0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minWidth: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 34,
            height: 34,
            flex: '0 0 auto',
          }}
        >
          <Image
            src="/profile.jpg"
            alt=""
            width={34}
            height={34}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              objectFit: 'cover',
              border: '1px solid var(--color-secondary-700)',
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #0a0a0a',
              boxShadow: '0 0 6px rgba(34,197,94,0.7)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              className={silkscreen.className}
              style={{
                fontSize: 14,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--fg-1)',
                whiteSpace: 'nowrap',
              }}
            >
              David Agent
            </span>
            <span
              style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: 4,
                color: 'var(--color-secondary-300)',
                background: 'rgba(217,70,239,0.10)',
                border: '1px solid var(--color-secondary-800)',
              }}
            >
              BETA
            </span>
          </div>
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--fg-3)',
              fontWeight: 300,
              lineHeight: 1.35,
              marginTop: 1,
            }}
          >
            Ask about my projects, stack, experience, or leadership.
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flex: '0 0 auto',
        }}
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            hasMessages
              ? 'Continue this conversation on WhatsApp'
              : 'Start this conversation on WhatsApp'
          }
          title="Continue on WhatsApp"
          className="cw-focus-ring"
          style={iconButtonStyle}
        >
          <WhatsAppGlyph size={14} />
        </a>
        <button
          type="button"
          aria-label="Close chat"
          onClick={onClose}
          className="cw-focus-ring"
          style={iconButtonStyle}
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
