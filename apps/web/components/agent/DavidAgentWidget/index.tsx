'use client';

import {
  Root as DialogRoot,
  Trigger as DialogTrigger,
  Portal as DialogPortal,
} from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import { contact } from '@portfolio/content';

import type { SlashCommand } from '@/model/slashCommands';
import { AgentClientError, sendAgentMessage } from '@/utils/agentClient';

import { ChatLauncher } from './ChatLauncher';
import { ChatPanel } from './ChatPanel';
import { dispatchSlashCommand } from './dispatchSlashCommand';
import { useGlobalSlashShortcut } from './useGlobalSlashShortcut';
import type { ChatMessage } from './types';

const WA_HREF = `https://wa.me/${contact.whatsappNumber.replace(/^\+/, '')}`;

function nextId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `msg_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function DavidAgentWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  // Refs (not state) for values the send closure needs to read without
  // re-deriving its identity: a fresh conversationId per request, and the
  // in-flight guard against double sends.
  const conversationIdRef = useRef<string | undefined>(undefined);
  const inflightRef = useRef(false);

  // Optimistic user append + agent round-trip. On `conversation_not_found`,
  // silently drops the stale id and retries once — the user's intent was to
  // keep talking, not to see a server-truth error. The in-flight guard is
  // claimed on the outer call only; the recursive retry runs under the same
  // claim so a fast second click during the retry can't slip past.
  const send = useCallback(
    async (text: string, attempt = 0): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (attempt === 0) {
        if (inflightRef.current) return;
        inflightRef.current = true;
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'user',
            text: trimmed,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setStatus('sending');

      try {
        const response = await sendAgentMessage({
          message: trimmed,
          channel: 'web',
          conversationId: conversationIdRef.current,
        });
        conversationIdRef.current = response.conversationId;
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            text: response.answer,
            createdAt: new Date().toISOString(),
          },
        ]);
        setStatus('idle');
      } catch (err) {
        if (err instanceof AgentClientError) {
          if (err.code === 'conversation_not_found' && attempt === 0) {
            conversationIdRef.current = undefined;
            await send(trimmed, attempt + 1);
            return;
          }
          setStatus('error');
        } else {
          setStatus('error');
        }
      } finally {
        if (attempt === 0) inflightRef.current = false;
      }
    },
    [],
  );

  const closePanel = useCallback(() => setOpen(false), []);

  const dispatch = useCallback(
    (command: SlashCommand) => {
      dispatchSlashCommand(command, {
        router,
        send: (text) => {
          void send(text);
        },
        closePanel,
      });
    },
    [router, send, closePanel],
  );

  const retry = useCallback(() => {
    setStatus('idle');
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) void send(lastUser.text);
  }, [messages, send]);

  useGlobalSlashShortcut(useCallback(() => setOpen(true), []));

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      {/* Trigger stays mounted across open/closed so Radix can restore focus
          to it when the dialog closes. Visibility/pointer-events are toggled
          instead of unmount; aria-hidden keeps it off the a11y tree while the
          panel is showing. */}
      <div
        aria-hidden={open ? 'true' : undefined}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 50,
          visibility: open ? 'hidden' : 'visible',
          pointerEvents: open ? 'none' : 'auto',
        }}
      >
        <DialogTrigger asChild>
          <ChatLauncher />
        </DialogTrigger>
      </div>
      <DialogPortal>
        <ChatPanel
          messages={messages}
          sending={status === 'sending'}
          error={status === 'error'}
          whatsappHref={WA_HREF}
          onSendText={(text) => {
            void send(text);
          }}
          onSelectCommand={dispatch}
          onRetry={retry}
          onClose={closePanel}
        />
      </DialogPortal>
    </DialogRoot>
  );
}
