'use client';

import {
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowUp, Slash } from 'react-feather';

import type { SlashCommand } from '@/model/slashCommands';

import { CommandSuggestions } from './CommandSuggestions';

interface ChatComposerProps {
  disabled: boolean;
  onSendText: (text: string) => void;
  onSelectCommand: (command: SlashCommand) => void;
}

export function ChatComposer({
  disabled,
  onSendText,
  onSelectCommand,
}: ChatComposerProps) {
  const [draft, setDraft] = useState('');
  const [slashOpen, setSlashOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && !disabled;

  const submit = () => {
    if (!canSubmit) return;
    onSendText(trimmed);
    setDraft('');
    setSlashOpen(false);
  };

  const selectCommand = (command: SlashCommand) => {
    setDraft('');
    setSlashOpen(false);
    onSelectCommand(command);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape' && slashOpen) {
      setSlashOpen(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderTop: '1px solid var(--border-subtle)',
        padding: '10px 10px 10px',
        background: 'rgba(255,255,255,0.015)',
        flex: '0 0 auto',
      }}
    >
      {slashOpen && (
        <CommandSuggestions
          filter={draft.startsWith('/') ? draft : ''}
          onSelect={selectCommand}
        />
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 6px 6px 8px',
          background: 'var(--color-neutral-950)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
      >
        <button
          type="button"
          aria-label="Open commands"
          onClick={() => {
            setSlashOpen((v) => !v);
            inputRef.current?.focus();
          }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'transparent',
            border: '1px solid transparent',
            color: slashOpen ? 'var(--color-secondary-400)' : 'var(--fg-3)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            transition: 'all 150ms',
          }}
        >
          <Slash size={15} strokeWidth={1.75} />
        </button>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            setSlashOpen(v.trimStart().startsWith('/'));
          }}
          onKeyDown={onKeyDown}
          placeholder="Ask David anything…  (try / for skills)"
          aria-label="Message"
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--fg-1)',
            fontFamily: 'var(--font-body)',
            fontSize: 13.5,
            fontWeight: 300,
            padding: '6px 4px',
          }}
        />
        <button
          type="button"
          aria-label="Send message"
          onClick={submit}
          disabled={!canSubmit}
          style={{
            width: 32,
            height: 32,
            flex: '0 0 auto',
            borderRadius: 8,
            background: 'var(--color-primary-500)',
            border: '1px solid var(--color-primary-700)',
            borderBottomWidth: 3,
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
            opacity: !canSubmit ? 0.4 : 1,
            cursor: !canSubmit ? 'not-allowed' : 'pointer',
          }}
        >
          <ArrowUp size={16} strokeWidth={2} />
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 10,
          letterSpacing: '0.04em',
          color: 'var(--fg-4)',
          padding: '8px 6px 2px',
          textTransform: 'lowercase',
        }}
      >
        <span>Enter to send · Shift+Enter for newline</span>
        <span
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }}
          />
          <span>agent online</span>
        </span>
      </div>
    </div>
  );
}
