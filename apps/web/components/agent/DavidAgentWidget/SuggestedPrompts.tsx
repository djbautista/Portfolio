'use client';

import { useState } from 'react';

import { slashCommands, type SlashCommand } from '@/model/slashCommands';
import { suggestedPrompts } from '@/model/suggestedPrompts';

interface SuggestedPromptsProps {
  onSendText: (text: string) => void;
  onDispatchCommand: (command: SlashCommand) => void;
}

interface ChipProps {
  label: string;
  commandHint?: string;
  onClick: () => void;
}

function Chip({ label, commandHint, onClick }: ChipProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '11px 12px',
        borderRadius: 10,
        border: '1px solid',
        borderColor: hover
          ? 'var(--color-secondary-700)'
          : 'var(--border-subtle)',
        background: 'rgba(255,255,255,0.02)',
        color: hover ? 'var(--fg-1)' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontWeight: 300,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 150ms',
        textAlign: 'left',
      }}
    >
      <span>{label}</span>
      {commandHint && (
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(217,70,239,0.10)',
            color: 'var(--color-secondary-300)',
            border: '1px solid var(--color-secondary-800)',
            flex: '0 0 auto',
          }}
        >
          {commandHint}
        </code>
      )}
    </button>
  );
}

export function SuggestedPrompts({
  onSendText,
  onDispatchCommand,
}: SuggestedPromptsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        paddingTop: 8,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize: 18,
          color: 'var(--fg-1)',
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}
      >
        <span style={{ color: 'var(--color-secondary-400)' }}>—</span>
        <span> Hi, I&apos;m David&apos;s agent </span>
        <span style={{ color: 'var(--color-secondary-400)' }}>—</span>
      </div>
      <p
        style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 13.5,
          lineHeight: 1.6,
          color: 'var(--fg-2)',
          fontWeight: 300,
          padding: '0 6px',
        }}
      >
        I&apos;ve read every line of his portfolio. Ask me about his{' '}
        <span className="hl-primary">stack</span>,{' '}
        <span className="hl-primary">projects</span>, or{' '}
        <span className="hl-secondary">leadership</span> — or fire off a slash
        command.
      </p>
      <div
        style={{
          marginTop: 4,
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--fg-4)',
        }}
      >
        <span
          style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}
        />
        <span>try one of these</span>
        <span
          style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestedPrompts.map((p) => {
          const referenced = p.commandRef
            ? slashCommands.find((c) => c.command === p.commandRef)
            : undefined;
          return (
            <Chip
              key={p.label}
              label={p.label}
              commandHint={referenced?.command}
              onClick={() => {
                if (referenced) {
                  onDispatchCommand(referenced);
                } else {
                  onSendText(p.label);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
