/**
 * In-memory pub/sub for presenter → speaker-notes sync.
 *
 * One long-running Next server holds the rooms in module memory: the live deck
 * POSTs its current beat (→ {@link publish}), and each connected notes view
 * holds an SSE subscription (→ {@link subscribe}). The last-known state per room
 * is retained so a late or reconnecting listener snaps straight to where the
 * presenter is.
 *
 * Caveat: this assumes a single, long-lived process (this repo's self-hosted
 * setup). On serverless/multi-instance hosting it would need a shared backplane
 * (the long-running Fastify backend or Redis) — that swap is isolated to this
 * file. The state is intentionally ephemeral; losing it on restart just means
 * the next navigation re-seeds it.
 */
import type { DeckState } from './constants';

type Listener = (state: DeckState) => void;

interface Room {
  state: DeckState | null;
  listeners: Set<Listener>;
}

// Survive Next.js dev hot-reload (which re-evaluates modules) by stashing the
// registry on globalThis, so a reconnecting client doesn't lose the room.
const globalForSync = globalThis as typeof globalThis & {
  __afilSyncRooms?: Map<string, Room>;
};
const rooms: Map<string, Room> = (globalForSync.__afilSyncRooms ??= new Map());

function getRoom(roomId: string): Room {
  let room = rooms.get(roomId);
  if (!room) {
    room = { state: null, listeners: new Set() };
    rooms.set(roomId, room);
  }
  return room;
}

/** Update a room's current beat and notify every connected listener. */
export function publish(roomId: string, state: DeckState): void {
  const room = getRoom(roomId);
  room.state = state;
  for (const listener of room.listeners) {
    try {
      listener(state);
    } catch {
      // a broken listener must not stop the others from updating
    }
  }
}

/** The room's last-known beat, or null if nothing has been published yet. */
export function getState(roomId: string): DeckState | null {
  return rooms.get(roomId)?.state ?? null;
}

/** Subscribe to a room's beats. Returns an unsubscribe fn. */
export function subscribe(roomId: string, listener: Listener): () => void {
  const room = getRoom(roomId);
  room.listeners.add(listener);
  return () => {
    room.listeners.delete(listener);
    // drop fully idle rooms so the registry can't grow without bound
    if (room.listeners.size === 0 && room.state === null) {
      rooms.delete(roomId);
    }
  };
}
