// Speaker-notes SSE stream.
// A notes view opens an EventSource here; on connect it immediately receives the
// room's current beat plus a snapshot of all note overrides (so a late/
// reconnecting client snaps into sync), then a named event for every subsequent
// navigation the presenter broadcasts and every note edit anyone saves:
//   event: beat   data: <DeckState>
//   event: notes  data: <{ "<slide>:<stage>": SpeakerNote }>   (full snapshot, on connect)
//   event: note   data: <{ key, note }>                        (single edit/reset; note=null resets)
import { normalizeRoom } from '@/app/presentations/ai-feature-intelligence-layer/_sync/constants';
import {
  getNotes,
  getState,
  subscribe,
} from '@/app/presentations/ai-feature-intelligence-layer/_sync/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Keep-alive comment cadence — well under typical 60s proxy idle timeouts.
const PING_MS = 25_000;

export async function GET(request: Request) {
  const room = normalizeRoom(new URL(request.url).searchParams.get('room'));
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      // Opening comment flushes headers so the client fires `onopen` promptly.
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Replay the current beat (if the presenter has already navigated) and a
      // full snapshot of note overrides, so a fresh client is immediately in sync.
      const current = getState(room);
      if (current) sendEvent('beat', current);
      sendEvent('notes', getNotes(room));

      unsubscribe = subscribe(room, (message) => {
        if (message.type === 'beat') {
          sendEvent('beat', message.state);
        } else {
          sendEvent('note', { key: message.key, note: message.note });
        }
      });

      pingTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          // The write failed, so the client is gone but we never saw an `abort`
          // (e.g. iOS Safari dropping the socket on refresh). Reap the listener
          // now instead of leaking it — otherwise a refreshing iPad accretes
          // ghost subscriptions in the room.
          cleanup();
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      }, PING_MS);

      // Client navigated away / network dropped: tear down promptly.
      request.signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      cleanup();
    },
  });

  function cleanup() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      // disable proxy buffering (nginx) so events flush immediately
      'x-accel-buffering': 'no',
    },
  });
}
