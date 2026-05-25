'use client';

import {
  Content,
  Description,
  Overlay,
  Title,
} from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import type { SlashCommand } from '@/model/slashCommands';

import { ChatComposer } from './ChatComposer';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { SuggestedPrompts } from './SuggestedPrompts';
import { WhatsAppLine } from './WhatsAppLine';
import type { ChatMessage } from './types';

interface ChatPanelProps {
  messages: ChatMessage[];
  sending: boolean;
  error: boolean;
  whatsappHref: string;
  onSendText: (text: string) => void;
  onSelectCommand: (command: SlashCommand) => void;
  onRetry: () => void;
  onClose: () => void;
}

// Sub-`sm` breakpoint matches Tailwind's default (`min-width: 640px`).
// Lazy-initialized so the first paint after the dialog opens is already
// correct — the Portal does not render until `open === true`, so there is no
// SSR markup to mismatch.
function useIsMobile(): boolean {
  const query = '(max-width: 639px)';
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function ChatPanel({
  messages,
  sending,
  error,
  whatsappHref,
  onSendText,
  onSelectCommand,
  onRetry,
  onClose,
}: ChatPanelProps) {
  const hasMessages = messages.length > 0 || sending || error;
  const isMobile = useIsMobile();
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const desktopFrameStyle: CSSProperties = {
    position: 'fixed',
    right: 24,
    bottom: 24,
    zIndex: 50,
    width: 380,
    height: 580,
    borderRadius: 16,
    padding: 1,
    background: 'var(--cw-gradient-frame)',
    boxShadow: 'var(--cw-shadow-panel)',
    animation: 'var(--animate-cwPop)',
    fontFamily: 'var(--font-body)',
    color: 'var(--fg-1)',
  };

  // dvh (dynamic viewport height) keeps the composer above the iOS URL bar
  // when it expands; vh would clip.
  const mobileFrameStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    width: '100%',
    maxHeight: '90dvh',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 1,
    background: 'var(--cw-gradient-frame)',
    animation: 'var(--animate-cwSheet)',
    fontFamily: 'var(--font-body)',
    color: 'var(--fg-1)',
  };

  const desktopInnerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 15,
    background: 'var(--cw-gradient-surface)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const mobileInnerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    background: 'var(--cw-gradient-surface)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 540,
  };

  return (
    <>
      {isMobile && (
        <Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
      )}
      <Content
        onOpenAutoFocus={(e) => {
          // Default Radix focus would land on the first focusable child
          // (the WhatsApp icon in the header). On desktop, redirect to the
          // composer — it's the obvious primary action. On mobile, skip
          // auto-focus entirely so iOS/Android don't pop the soft keyboard
          // the instant the bottom sheet opens.
          e.preventDefault();
          if (!isMobile) composerRef.current?.focus();
        }}
        style={isMobile ? mobileFrameStyle : desktopFrameStyle}
      >
        <VisuallyHidden>
          <Title>David Agent</Title>
          <Description>
            Ask David about his projects, stack, experience, or leadership.
          </Description>
        </VisuallyHidden>
        <div style={isMobile ? mobileInnerStyle : desktopInnerStyle}>
          {isMobile && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 36,
                height: 4,
                borderRadius: 99,
                background: 'var(--color-neutral-700)',
                zIndex: 2,
              }}
            />
          )}
          <ChatHeader
            hasMessages={hasMessages}
            whatsappHref={whatsappHref}
            onClose={onClose}
          />
          <ChatMessageList
            messages={messages}
            sending={sending}
            error={error}
            onRetry={onRetry}
            emptyState={
              <SuggestedPrompts
                onSendText={onSendText}
                onDispatchCommand={onSelectCommand}
              />
            }
          />
          <WhatsAppLine hasMessages={hasMessages} href={whatsappHref} />
          <ChatComposer
            ref={composerRef}
            disabled={sending}
            onSendText={onSendText}
            onSelectCommand={onSelectCommand}
          />
        </div>
      </Content>
    </>
  );
}
