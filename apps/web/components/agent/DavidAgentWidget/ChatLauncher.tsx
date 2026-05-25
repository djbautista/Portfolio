'use client';

import Image from 'next/image';
import { forwardRef, useState, type CSSProperties } from 'react';

import { silkscreen } from '@/utils/fonts';

interface ChatLauncherProps {
  mobile?: boolean;
}

// Literal port of cwStyles.trigger family from the design (chat-widget.jsx:113).
// Always rendered via <DialogTrigger asChild>; the click handler arrives via
// Radix's cloneElement (captured by `...rest`). Hover state lives here so the
// pill animates correctly regardless of who owns the click.
export const ChatLauncher = forwardRef<HTMLButtonElement, ChatLauncherProps>(
  function ChatLauncher({ mobile = false, ...rest }, ref) {
    const [hover, setHover] = useState(false);

    const triggerStyle: CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px 10px 12px',
      borderRadius: 999,
      border: '1px solid var(--color-secondary-700)',
      borderBottomWidth: 4,
      background: hover ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.78)',
      borderColor: hover
        ? 'var(--color-secondary-500)'
        : 'var(--color-secondary-700)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'var(--fg-1)',
      cursor: 'pointer',
      boxShadow: 'var(--cw-shadow-trigger)',
      transition: 'transform 200ms var(--ease-soft), background 200ms, border-color 200ms',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      fontFamily: 'var(--font-body)',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Open David Agent — Ask David anything about David Bautista"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={triggerStyle}
        {...rest}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 999,
            pointerEvents: 'none',
            boxShadow: 'var(--cw-shadow-trigger-halo)',
            opacity: 0.9,
          }}
        />
        <span
          style={{
            position: 'relative',
            width: 32,
            height: 32,
            borderRadius: '50%',
            overflow: 'visible',
            flex: '0 0 auto',
          }}
        >
          <Image
            src="/profile.jpg"
            alt=""
            width={32}
            height={32}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid var(--color-secondary-500)',
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -1,
              bottom: -1,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid var(--bg-page)',
              boxShadow: '0 0 8px rgba(34,197,94,0.7)',
            }}
          />
        </span>
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            lineHeight: 1.05,
            gap: 2,
          }}
        >
          <span
            className={silkscreen.className}
            style={{
              fontSize: 14,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--fg-1)',
            }}
          >
            Ask David
          </span>
          <span
            style={{
              fontSize: 10.5,
              color: 'var(--fg-3)',
              fontWeight: 300,
              letterSpacing: '0.04em',
              textTransform: 'lowercase',
            }}
          >
            {mobile ? 'tap to chat' : 'David Agent · online'}
          </span>
        </span>
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '2px 7px',
            borderRadius: 5,
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--fg-3)',
          }}
        >
          /
        </span>
      </button>
    );
  },
);
