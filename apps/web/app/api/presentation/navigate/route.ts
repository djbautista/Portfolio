// Presenter → speaker-notes broadcast endpoint.
// The live deck POSTs its current beat here on every navigation; the value is
// stored and pushed to everyone subscribed on /api/presentation/stream.
import {
  normalizeRoom,
  type DeckState,
} from '@/app/presentations/ai-feature-intelligence-layer/_sync/constants';
import { publish } from '@/app/presentations/ai-feature-intelligence-layer/_sync/store';
import {
  SLIDE_STEPS,
  toGlobal,
} from '@/app/presentations/ai-feature-intelligence-layer/steps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const slideRaw = body.slide;
  const stageRaw = body.stage;
  if (typeof slideRaw !== 'number' || typeof stageRaw !== 'number') {
    return Response.json(
      { error: 'slide and stage must be numbers' },
      { status: 400 },
    );
  }

  // Clamp to the real deck geometry so a bad client can't poison the room.
  const slideMeta = SLIDE_STEPS[clamp(Math.trunc(slideRaw), 0, SLIDE_STEPS.length - 1)];
  if (!slideMeta) {
    return Response.json({ error: 'no slides registered' }, { status: 500 });
  }
  const slide = slideMeta.index;
  const stage = clamp(Math.trunc(stageRaw), 0, slideMeta.stepCount - 1);

  const state: DeckState = {
    slide,
    stage,
    global: toGlobal(slide, stage),
    ts: Date.now(),
  };

  publish(normalizeRoom(typeof body.room === 'string' ? body.room : null), state);

  return new Response(null, { status: 204 });
}
