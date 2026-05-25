'use client';

import { Content, Description, Title } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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

  return (
    <Content
      onOpenAutoFocus={(e) => e.preventDefault()}
      // Force the panel out of the document flow into a bottom-right anchor
      // instead of the Radix default centered modal.
      style={{
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
      }}
    >
      <VisuallyHidden>
        <Title>David Agent</Title>
        <Description>
          Ask David about his projects, stack, experience, or leadership.
        </Description>
      </VisuallyHidden>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 15,
          background: 'var(--cw-gradient-surface)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
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
          disabled={sending}
          onSendText={onSendText}
          onSelectCommand={onSelectCommand}
        />
      </div>
    </Content>
  );
}

