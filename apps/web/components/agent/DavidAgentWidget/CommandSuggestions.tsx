'use client';

import { useState, type CSSProperties } from 'react';
import { Slash } from 'react-feather';

import {
  slashCommands,
  type SlashCommand,
} from '@/model/slashCommands';

interface CommandSuggestionsProps {
  filter: string;
  onSelect: (command: SlashCommand) => void;
}

const itemStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '92px 1fr auto',
  alignItems: 'center',
  gap: 10,
  padding: '8px 10px',
  border: '1px solid transparent',
  borderRadius: 8,
  background: 'transparent',
  color: 'var(--fg-2)',
  fontFamily: 'var(--font-body)',
  fontSize: 12.5,
  fontWeight: 300,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 120ms',
};

function CommandRow({
  command,
  onSelect,
}: {
  command: SlashCommand;
  onSelect: (c: SlashCommand) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onSelect(command)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...itemStyle,
        background: hover ? 'rgba(217,70,239,0.08)' : 'transparent',
        borderColor: hover ? 'var(--color-secondary-700)' : 'transparent',
      }}
    >
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-secondary-300)',
          background: 'rgba(217,70,239,0.08)',
          border: '1px solid var(--color-secondary-800)',
          padding: '2px 6px',
          borderRadius: 4,
          justifySelf: 'start',
        }}
      >
        {command.command}
      </code>
      <span style={{ color: 'var(--fg-2)' }}>{command.description}</span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--fg-4)',
          letterSpacing: '0.04em',
        }}
      >
        {command.kind}
      </span>
    </button>
  );
}

export function CommandSuggestions({
  filter,
  onSelect,
}: CommandSuggestionsProps) {
  const needle = filter.trim().toLowerCase();
  const filtered = needle
    ? slashCommands.filter(
        (c) =>
          c.command.toLowerCase().includes(needle) ||
          c.label.toLowerCase().includes(needle),
      )
    : slashCommands;

  if (filtered.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Slash commands"
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 'calc(100% - 4px)',
        background: 'linear-gradient(180deg, #111114 0%, #0c0c0e 100%)',
        border: '1px solid var(--color-secondary-800)',
        borderRadius: 12,
        padding: 6,
        boxShadow:
          '0 24px 48px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(217,70,239,0.10)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        animation: 'var(--animate-cwPop)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px 8px',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--fg-4)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 4,
        }}
      >
        <Slash size={12} strokeWidth={1.75} />
        <span>Skills · pick one to run a command</span>
      </div>
      {filtered.map((c) => (
        <CommandRow key={c.command} command={c} onSelect={onSelect} />
      ))}
    </div>
  );
}
