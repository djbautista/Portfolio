/**
 * In-memory pub/sub for presenter ↔ speaker-notes sync, plus persisted note edits.
 *
 * One long-running Next server holds the rooms in module memory: the live deck
 * POSTs its current beat (→ {@link publish}), and each connected notes view
 * holds an SSE subscription (→ {@link subscribe}). The last-known beat per room
 * is retained so a late or reconnecting listener snaps straight to where the
 * presenter is.
 *
 * The notes view can also EDIT a note for a beat (→ {@link setNote}); unlike the
 * ephemeral beat, those edits are an *override layer* over the static defaults
 * in {@link ../speakerNotes} and are persisted to disk per room, so they survive
 * restarts and are shared across every connected device. Edits broadcast over
 * the same listener channel so other notes views update live.
 *
 * Caveat: this assumes a single, long-lived process (this repo's self-hosted
 * setup). On serverless/multi-instance hosting it would need a shared backplane
 * (the long-running Fastify backend or Redis) — that swap is isolated to this
 * file. The beat state is intentionally ephemeral; the note overrides are the
 * durable part, kept in `.afil-notes/<room>.json`.
 */
import fs from 'node:fs';
import path from 'node:path';

import type { SpeakerNote } from '@/app/presentations/ai-feature-intelligence-layer/speakerNotes';

import type { DeckState } from './constants';

/** What a listener receives: a beat move, or a single note edit/reset. */
export type SyncMessage =
  | { type: 'beat'; state: DeckState }
  | { type: 'note'; key: string; note: SpeakerNote | null };

type Listener = (message: SyncMessage) => void;

interface Room {
  state: DeckState | null;
  /** override map keyed by `"<slide>:<stage>"`; overlays the static defaults */
  notes: Record<string, SpeakerNote>;
  listeners: Set<Listener>;
}

// Survive Next.js dev hot-reload (which re-evaluates modules) by stashing the
// registry on globalThis, so a reconnecting client doesn't lose the room.
const globalForSync = globalThis as typeof globalThis & {
  __afilSyncRooms?: Map<string, Room>;
};
const rooms: Map<string, Room> = (globalForSync.__afilSyncRooms ??= new Map());

// --- disk persistence for note overrides (best-effort, single process) ---
const DATA_DIR = path.join(process.cwd(), '.afil-notes');
const fileFor = (roomId: string) => path.join(DATA_DIR, `${roomId}.json`);

function loadNotes(roomId: string): Record<string, SpeakerNote> {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(fileFor(roomId), 'utf8'));
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, SpeakerNote>)
      : {};
  } catch {
    // missing/corrupt file → start from the static defaults (empty override map)
    return {};
  }
}

function persistNotes(roomId: string, notes: Record<string, SpeakerNote>): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(fileFor(roomId), `${JSON.stringify(notes, null, 2)}\n`, 'utf8');
  } catch {
    // persistence is best-effort; the in-memory copy still serves this process
  }
}

function getRoom(roomId: string): Room {
  let room = rooms.get(roomId);
  if (!room) {
    room = { state: null, notes: loadNotes(roomId), listeners: new Set() };
    rooms.set(roomId, room);
  }
  return room;
}

function broadcast(room: Room, message: SyncMessage): void {
  for (const listener of room.listeners) {
    try {
      listener(message);
    } catch {
      // a broken listener must not stop the others from updating
    }
  }
}

/** Update a room's current beat and notify every connected listener. */
export function publish(roomId: string, state: DeckState): void {
  const room = getRoom(roomId);
  room.state = state;
  broadcast(room, { type: 'beat', state });
}

/** The room's last-known beat, or null if nothing has been published yet. */
export function getState(roomId: string): DeckState | null {
  return rooms.get(roomId)?.state ?? null;
}

/** A copy of the room's note overrides (keyed by `"<slide>:<stage>"`). */
export function getNotes(roomId: string): Record<string, SpeakerNote> {
  return { ...getRoom(roomId).notes };
}

/**
 * Save a note override for a beat (or reset to the static default when
 * `note === null`). Persists to disk and broadcasts to connected listeners.
 */
export function setNote(roomId: string, key: string, note: SpeakerNote | null): void {
  const room = getRoom(roomId);
  if (note) {
    room.notes[key] = note;
  } else {
    delete room.notes[key];
  }
  persistNotes(roomId, room.notes);
  broadcast(room, { type: 'note', key, note });
}

/** Subscribe to a room's beats and note edits. Returns an unsubscribe fn. */
export function subscribe(roomId: string, listener: Listener): () => void {
  const room = getRoom(roomId);
  room.listeners.add(listener);
  return () => {
    room.listeners.delete(listener);
    // drop fully idle rooms so the registry can't grow without bound; a room
    // with persisted notes just reloads from disk on its next access.
    if (
      room.listeners.size === 0 &&
      room.state === null &&
      Object.keys(room.notes).length === 0
    ) {
      rooms.delete(roomId);
    }
  };
}
