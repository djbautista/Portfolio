'use client';

import { useEffect, useRef, useState } from 'react';

import { manrope, spaceGrotesk } from '@/utils/fonts';
import {
  STREAM_PATH,
  normalizeRoom,
  type DeckState,
} from '@/app/presentations/ai-feature-intelligence-layer/_sync/constants';
import {
  TOTAL_STEPS,
  fromGlobal,
} from '@/app/presentations/ai-feature-intelligence-layer/steps';
import { getNote } from '@/app/presentations/ai-feature-intelligence-layer/speakerNotes';

import './notes.css';

type Status = 'connecting' | 'waiting' | 'live' | 'reconnecting';

const STATUS_LABEL: Record<Status, string> = {
  connecting: 'Connecting…',
  waiting: 'Waiting for presenter',
  live: 'Live',
  reconnecting: 'Reconnecting…',
};

/**
 * Presenter-only notes screen, built for a 12" iPad on the same network. It
 * opens an SSE stream and passively mirrors the live deck — no controls that
 * could move the presentation (follow-only by design). On (re)connect the
 * server replays the current beat, so it always snaps back into sync.
 */
export function SpeakerNotesView() {
  const [beat, setBeat] = useState<DeckState | null>(null);
  const [status, setStatus] = useState<Status>('connecting');
  // ref mirrors `beat` so the SSE open handler can decide live-vs-waiting
  // without re-subscribing every time the beat changes.
  const beatRef = useRef<DeckState | null>(null);
  beatRef.current = beat;

  // --- SSE subscription (open once on mount) ---
  useEffect(() => {
    const room = normalizeRoom(new URLSearchParams(window.location.search).get('room'));
    const source = new EventSource(`${STREAM_PATH}?room=${encodeURIComponent(room)}`);

    source.onopen = () => setStatus(beatRef.current ? 'live' : 'waiting');
    source.onmessage = (event: MessageEvent<string>) => {
      try {
        const next = JSON.parse(event.data) as DeckState;
        setBeat(next);
        setStatus('live');
      } catch {
        // ignore malformed frames (e.g. a stray keep-alive that slipped through)
      }
    };
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

  const rootClass = `afil-notes ${spaceGrotesk.variable} ${manrope.variable}`;

  if (!beat) {
    return (
      <div className={rootClass}>
        <div className="afil-notes-wait">
          <span className={`afil-notes-status is-${status}`}>
            <span className="afil-notes-dot" />
            {STATUS_LABEL[status]}
          </span>
          <p className="afil-notes-wait-msg">
            Open the deck with <code>?present</code> on the presenting device, then
            navigate — these notes follow along automatically.
          </p>
        </div>
      </div>
    );
  }

  const current = fromGlobal(beat.global);
  const note = getNote(beat.slide, beat.stage);
  const hasNext = beat.global + 1 < TOTAL_STEPS;
  const nextStep = hasNext ? fromGlobal(beat.global + 1) : null;
  const nextNote = nextStep ? getNote(nextStep.slide, nextStep.stage) : null;
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
        <span className={`afil-notes-status is-${status}`}>
          <span className="afil-notes-dot" />
          {STATUS_LABEL[status]}
        </span>
      </header>

      <div className="afil-notes-progress">
        <div className="afil-notes-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <main className="afil-notes-current">
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
