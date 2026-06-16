// Speaker-notes SSE stream.
// A notes view opens an EventSource here; on connect it immediately receives the
// room's current beat (so a late/reconnecting client snaps into sync), then a
// `data:` event for every subsequent navigation the presenter broadcasts.
import {
  normalizeRoom,
  type DeckState,
} from '@/app/presentations/ai-feature-intelligence-layer/_sync/constants';
import {
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
      const send = (state: DeckState) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
      };

      // Opening comment flushes headers so the client fires `onopen` promptly.
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Replay the current beat (if the presenter has already navigated).
      const current = getState(room);
      if (current) send(current);

      unsubscribe = subscribe(room, send);

      pingTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          // controller already closed — cleanup runs via cancel()/abort
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
