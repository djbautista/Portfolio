'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { manrope, spaceGrotesk } from '@/utils/fonts';
import {
  NOTES_PATH,
  STREAM_PATH,
  normalizeRoom,
  type DeckState,
} from '@/app/presentations/ai-feature-intelligence-layer/_sync/constants';
import {
  TOTAL_STEPS,
  fromGlobal,
} from '@/app/presentations/ai-feature-intelligence-layer/steps';
import {
  getNote,
  type SpeakerNote,
} from '@/app/presentations/ai-feature-intelligence-layer/speakerNotes';

import { parseNote, serializeNote } from './noteFormat';
import './notes.css';

type Status = 'connecting' | 'waiting' | 'live' | 'reconnecting';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const STATUS_LABEL: Record<Status, string> = {
  connecting: 'Connecting…',
  waiting: 'Waiting for presenter',
  live: 'Live',
  reconnecting: 'Reconnecting…',
};

const noteKey = (slide: number, stage: number) => `${slide}:${stage}`;

/** Renders a note's headline + bullets — shared by the live view and the editor preview. */
function NoteBody({ note }: { note: SpeakerNote }) {
  return (
    <>
      {note.headline && <h1 className="afil-notes-headline">{note.headline}</h1>}
      {note.bullets.length > 0 ? (
        <ul className="afil-notes-bullets">
          {note.bullets.map((b, i) => (
            <li key={i}>
              <span className="afil-notes-idea">{b.idea}</span>
              {b.say.length > 0 && (
                <ul className="afil-notes-say">
                  {b.say.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="afil-notes-empty">No notes for this beat.</p>
      )}
    </>
  );
}

/**
 * Presenter-only notes screen, built for a 12" iPad on the same network. It
 * opens an SSE stream and passively mirrors the live deck (follow-only by
 * design); on (re)connect the server replays the current beat and a snapshot of
 * any edited notes, so it always snaps back into sync.
 *
 * It also has an Edit mode: notes are an override layer over the static defaults
 * in {@link ../speakerNotes}. Editing walks every beat independently of the live
 * deck and saves through the sync backend, so edits persist and fan out to every
 * connected device.
 */
export function SpeakerNotesView() {
  const [beat, setBeat] = useState<DeckState | null>(null);
  const [status, setStatus] = useState<Status>('connecting');
  const [overrides, setOverrides] = useState<Record<string, SpeakerNote>>({});

  // --- edit mode ---
  const [editing, setEditing] = useState(false);
  const [editGlobal, setEditGlobal] = useState(0);
  const [draft, setDraft] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  // refs so the SSE/handlers read the latest without re-subscribing
  const beatRef = useRef<DeckState | null>(null);
  beatRef.current = beat;
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;
  const roomRef = useRef('');

  /** Effective note for a beat: an edited override, else the static default. */
  const effectiveNote = useCallback(
    (slide: number, stage: number): SpeakerNote =>
      overridesRef.current[noteKey(slide, stage)] ?? getNote(slide, stage),
    [],
  );

  // --- SSE subscription (open once on mount) ---
  useEffect(() => {
    const room = normalizeRoom(new URLSearchParams(window.location.search).get('room'));
    roomRef.current = room;
    const source = new EventSource(`${STREAM_PATH}?room=${encodeURIComponent(room)}`);

    const onEvent = (name: string, handle: (data: string) => void) =>
      source.addEventListener(name, (event) => handle((event as MessageEvent<string>).data));

    source.onopen = () => setStatus(beatRef.current ? 'live' : 'waiting');
    onEvent('beat', (data) => {
      try {
        setBeat(JSON.parse(data) as DeckState);
        setStatus('live');
      } catch {
        // ignore a malformed frame
      }
    });
    onEvent('notes', (data) => {
      try {
        setOverrides(JSON.parse(data) as Record<string, SpeakerNote>);
      } catch {
        // ignore a malformed snapshot
      }
    });
    onEvent('note', (data) => {
      try {
        const { key, note } = JSON.parse(data) as { key: string; note: SpeakerNote | null };
        setOverrides((prev) => {
          const next = { ...prev };
          if (note) next[key] = note;
          else delete next[key];
          return next;
        });
      } catch {
        // ignore a malformed edit frame
      }
    });
    source.onerror = () => setStatus('reconnecting'); // EventSource auto-retries

    return () => source.close();
  }, []);

  // --- keep the iPad awake during the talk ---
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    // typed loosely: WakeLockSentinel isn't in every TS DOM lib target
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await nav.wakeLock!.request('screen');
        if (cancelled) {
          void next.release();
        } else {
          sentinel = next;
        }
      } catch {
        // user can keep the screen on manually; not fatal
      }
    };

    void acquire();
    // iOS drops the lock when the tab is backgrounded — re-acquire on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, []);

  // --- edit-mode actions ---
  const loadDraftFor = useCallback(
    (global: number) => {
      const { slide, stage } = fromGlobal(global);
      setDraft(serializeNote(effectiveNote(slide, stage)));
      setDirty(false);
      setSaveState('idle');
    },
    [effectiveNote],
  );

  const enterEdit = useCallback(() => {
    const start = beatRef.current?.global ?? 0;
    setEditGlobal(start);
    loadDraftFor(start);
    setEditing(true);
  }, [loadDraftFor]);

  const confirmLeave = useCallback(
    () => !dirty || window.confirm('Discard unsaved changes to this note?'),
    [dirty],
  );

  const goToBeat = useCallback(
    (global: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, global));
      if (clamped === editGlobal) return;
      if (!confirmLeave()) return;
      setEditGlobal(clamped);
      loadDraftFor(clamped);
    },
    [editGlobal, confirmLeave, loadDraftFor],
  );

  const exitEdit = useCallback(() => {
    if (!confirmLeave()) return;
    setEditing(false);
  }, [confirmLeave]);

  const putNote = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch(NOTES_PATH, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room: roomRef.current, ...body }),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
    },
    [],
  );

  const save = useCallback(async () => {
    const { slide, stage } = fromGlobal(editGlobal);
    const key = noteKey(slide, stage);
    const note = parseNote(draft);
    setSaveState('saving');
    try {
      await putNote({ key, note });
      // optimistic: the broadcast will also arrive, but update locally now
      setOverrides((prev) => ({ ...prev, [key]: note }));
      setDirty(false);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [editGlobal, draft, putNote]);

  const revertToDefault = useCallback(async () => {
    const { slide, stage } = fromGlobal(editGlobal);
    const key = noteKey(slide, stage);
    setSaveState('saving');
    try {
      await putNote({ key, reset: true });
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setDraft(serializeNote(getNote(slide, stage)));
      setDirty(false);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [editGlobal, putNote]);

  const rootClass = `afil-notes ${spaceGrotesk.variable} ${manrope.variable}`;

  // ---------- Edit mode ----------
  if (editing) {
    const step = fromGlobal(editGlobal);
    const key = noteKey(step.slide, step.stage);
    const isOverridden = key in overrides;
    const preview = parseNote(draft);
    const saveLabel =
      saveState === 'saving'
        ? 'Saving…'
        : saveState === 'saved' && !dirty
          ? 'Saved'
          : saveState === 'error'
            ? 'Retry save'
            : 'Save';

    return (
      <div className={`${rootClass} is-editing`}>
        <header className="afil-notes-bar">
          <div className="afil-notes-loc">
            <span className="afil-notes-slide">{step.slideName}</span>
            <span className="afil-notes-step">
              step {step.stepInSlide} / {step.totalInSlide}
            </span>
            {isOverridden && <span className="afil-notes-badge">edited</span>}
          </div>
          <button type="button" className="afil-notes-btn" onClick={exitEdit}>
            Done
          </button>
        </header>

        <div className="afil-notes-editnav">
          <button
            type="button"
            className="afil-notes-btn"
            onClick={() => goToBeat(editGlobal - 1)}
            disabled={editGlobal === 0}
          >
            ‹ Prev
          </button>
          <span className="afil-notes-editnav-loc">
            {editGlobal + 1} / {TOTAL_STEPS}
          </span>
          <button
            type="button"
            className="afil-notes-btn"
            onClick={() => goToBeat(editGlobal + 1)}
            disabled={editGlobal === TOTAL_STEPS - 1}
          >
            Next ›
          </button>
        </div>

        <div className="afil-notes-editor">
          <textarea
            className="afil-notes-textarea"
            value={draft}
            spellCheck
            onChange={(e) => {
              setDraft(e.target.value);
              setDirty(true);
              setSaveState('idle');
            }}
          />
          <div className="afil-notes-preview">
            <span className="afil-notes-preview-label">Preview</span>
            <NoteBody note={preview} />
          </div>
        </div>

        <footer className="afil-notes-editbar">
          <span className="afil-notes-hint">
            <code>#</code> headline · <code>-</code> idea · <code>&gt;</code> say it out loud
          </span>
          <div className="afil-notes-editbar-actions">
            {isOverridden && (
              <button
                type="button"
                className="afil-notes-btn is-ghost"
                onClick={revertToDefault}
                disabled={saveState === 'saving'}
              >
                Revert to default
              </button>
            )}
            <button
              type="button"
              className="afil-notes-btn is-primary"
              onClick={save}
              disabled={saveState === 'saving' || (!dirty && saveState !== 'error')}
            >
              {saveLabel}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ---------- Waiting (no beat yet) ----------
  if (!beat) {
    return (
      <div className={rootClass}>
        <header className="afil-notes-bar">
          <span className={`afil-notes-status is-${status}`}>
            <span className="afil-notes-dot" />
            {STATUS_LABEL[status]}
          </span>
          <button type="button" className="afil-notes-btn" onClick={enterEdit}>
            Edit notes
          </button>
        </header>
        <div className="afil-notes-wait">
          <p className="afil-notes-wait-msg">
            Open the deck with <code>?present</code> on the presenting device, then
            navigate — these notes follow along automatically. Or tap{' '}
            <code>Edit notes</code> to write them now.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Follow mode (live) ----------
  const current = fromGlobal(beat.global);
  const note = effectiveNote(beat.slide, beat.stage);
  const hasNext = beat.global + 1 < TOTAL_STEPS;
  const nextStep = hasNext ? fromGlobal(beat.global + 1) : null;
  const nextNote = nextStep ? effectiveNote(nextStep.slide, nextStep.stage) : null;
  const progress = ((beat.global + 1) / TOTAL_STEPS) * 100;

  return (
    <div className={rootClass}>
      <header className="afil-notes-bar">
        <div className="afil-notes-loc">
          <span className="afil-notes-slide">{current.slideName}</span>
          <span className="afil-notes-step">
            step {current.stepInSlide} / {current.totalInSlide}
          </span>
        </div>
        <div className="afil-notes-bar-right">
          <span className={`afil-notes-status is-${status}`}>
            <span className="afil-notes-dot" />
            {STATUS_LABEL[status]}
          </span>
          <button type="button" className="afil-notes-btn" onClick={enterEdit}>
            Edit
          </button>
        </div>
      </header>

      <div className="afil-notes-progress">
        <div className="afil-notes-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <main className="afil-notes-current">
        <NoteBody note={note} />
      </main>

      <footer className="afil-notes-next">
        <span className="afil-notes-next-label">Next</span>
        {nextStep && nextNote ? (
          <div className="afil-notes-next-body">
            <span className="afil-notes-next-loc">
              {nextStep.slideName} · step {nextStep.stepInSlide} / {nextStep.totalInSlide}
            </span>
            <span className="afil-notes-next-text">
              {nextNote.headline ?? nextNote.bullets[0]?.idea ?? '—'}
            </span>
          </div>
        ) : (
          <span className="afil-notes-next-text">End of deck</span>
        )}
        <span className="afil-notes-count">
          {beat.global + 1} / {TOTAL_STEPS}
        </span>
      </footer>
    </div>
  );
}
