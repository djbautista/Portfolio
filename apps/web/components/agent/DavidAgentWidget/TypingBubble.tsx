'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';

const dotStyle: CSSProperties = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: 999,
  background: 'var(--color-secondary-400)',
  boxShadow: 'var(--cw-dot-glow)',
  animation: 'var(--animate-cwBlink)',
};

export function TypingBubble() {
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
      <div
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          borderBottomLeftRadius: 6,
          padding: '14px 16px',
          display: 'inline-flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        <span style={{ ...dotStyle, animationDelay: '0ms' }} />
        <span style={{ ...dotStyle, animationDelay: '140ms' }} />
        <span style={{ ...dotStyle, animationDelay: '280ms' }} />
        <span
          style={{
            marginLeft: 8,
            fontSize: 12,
            color: 'var(--fg-4)',
            letterSpacing: '0.02em',
          }}
        >
          thinking…
        </span>
      </div>
    </div>
  );
}
