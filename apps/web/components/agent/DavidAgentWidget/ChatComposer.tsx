'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowUp, Slash } from 'react-feather';

import type { SlashCommand } from '@/model/slashCommands';

import {
  CommandSuggestions,
  filterSlashCommands,
  optionIdFor,
} from './CommandSuggestions';

interface ChatComposerProps {
  disabled: boolean;
  onSendText: (text: string) => void;
  onSelectCommand: (command: SlashCommand) => void;
}

const MAX_ROWS = 4;
const OPTION_ID_PREFIX = 'cw-cmd';

export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(
  function ChatComposer(
    { disabled, onSendText, onSelectCommand }: ChatComposerProps,
    externalRef,
  ) {
    const [draft, setDraft] = useState('');
    const [slashOpen, setSlashOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(
      externalRef,
      () => textareaRef.current as HTMLTextAreaElement,
      [],
    );

    const trimmed = draft.trim();
    const canSubmit = trimmed.length > 0 && !disabled;

    const filter = draft.startsWith('/') ? draft : '';
    const filtered = useMemo(() => filterSlashCommands(filter), [filter]);

    // Keep the highlight in-range when the filtered list shrinks (e.g. user
    // narrows from `/` to `/wha`). Functional setter so the effect only
    // depends on the length, not the index it might overwrite.
    useEffect(() => {
      setHighlightedIndex((i) => (i >= filtered.length ? 0 : i));
    }, [filtered.length]);

    // Auto-grow textarea between 1 and MAX_ROWS rows.
    useLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      const styles = getComputedStyle(el);
      const lineHeight = parseFloat(styles.lineHeight) || 20;
      const paddingY =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const max = lineHeight * MAX_ROWS + paddingY;
      const next = Math.min(el.scrollHeight, max);
      el.style.height = next + 'px';
      el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
    }, [draft]);

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
      textareaRef.current?.focus();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // When the slash popover is open, arrow/enter/escape navigate the list
      // rather than acting on the textarea. Shift+Enter still always inserts
      // a newline (default textarea behavior) so it works both inside and
      // outside the popover.
      if (slashOpen && filtered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % filtered.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(
            (i) => (i - 1 + filtered.length) % filtered.length,
          );
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const next = filtered[highlightedIndex] ?? filtered[0];
          if (next) selectCommand(next);
          return;
        }
        if (e.key === 'Escape') {
          // Close the popover but not the dialog. Stop propagation so Radix
          // Dialog's Escape handler does not also fire.
          e.preventDefault();
          e.stopPropagation();
          setSlashOpen(false);
          return;
        }
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    };

    const popoverVisible = slashOpen && filtered.length > 0;
    const activeOptionId = popoverVisible
      ? optionIdFor(OPTION_ID_PREFIX, highlightedIndex)
      : undefined;

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
            filtered={filtered}
            highlightedIndex={highlightedIndex}
            onHighlight={setHighlightedIndex}
            onSelect={selectCommand}
            optionIdPrefix={OPTION_ID_PREFIX}
          />
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
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
            aria-expanded={slashOpen}
            className="cw-focus-ring"
            onClick={() => {
              setSlashOpen((v) => !v);
              textareaRef.current?.focus();
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
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              const v = e.target.value;
              setDraft(v);
              setSlashOpen(v.trimStart().startsWith('/'));
            }}
            onKeyDown={onKeyDown}
            placeholder="Ask David anything…  (try / for skills)"
            aria-label="Message David Agent"
            aria-autocomplete={popoverVisible ? 'list' : undefined}
            aria-controls={
              popoverVisible ? `${OPTION_ID_PREFIX}-listbox` : undefined
            }
            aria-activedescendant={activeOptionId}
            disabled={disabled}
            rows={1}
            className="cw-composer-textarea"
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--fg-1)',
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              padding: '6px 4px',
              resize: 'none',
              overflowY: 'hidden',
            }}
          />
          <button
            type="button"
            aria-label="Send message"
            className="cw-focus-ring"
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
  },
);
