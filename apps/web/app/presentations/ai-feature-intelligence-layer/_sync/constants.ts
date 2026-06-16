/**
 * Shared contract for presenter ↔ speaker-notes sync. Imported by both the
 * client (the live deck broadcasts, the notes view listens) and the server
 * route handlers, so it must stay free of any server-only or client-only deps.
 */

/** The beat the presenter is currently on. `global` is the flat index. */
export interface DeckState {
  slide: number;
  stage: number;
  global: number;
  /** server clock at publish time (ms) — used only for debugging/ordering */
  ts: number;
}

/**
 * Single-presenter personal deck → one fixed room is enough; the `?room=`
 * query param can override it if two talks ever run at once.
 */
export const DEFAULT_ROOM = 'afil';

export const STREAM_PATH = '/api/presentation/stream';
export const NAVIGATE_PATH = '/api/presentation/navigate';
/** Where the notes view PUTs an edited (or reset) note for a `slide:stage` beat. */
export const NOTES_PATH = '/api/presentation/notes';

/** Clamp/normalize a room id from a URL param to the fixed default. */
export function normalizeRoom(raw: string | null | undefined): string {
  const trimmed = (raw ?? '').trim();
  // keep it short + URL-safe; fall back to the default for anything odd
  return /^[A-Za-z0-9_-]{1,32}$/.test(trimmed) ? trimmed : DEFAULT_ROOM;
}
