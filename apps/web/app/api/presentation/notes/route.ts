// Speaker-notes edit endpoint.
// The notes view PUTs an edited note for a beat here; the value is validated,
// persisted, and broadcast to every device subscribed on /api/presentation/stream.
//   PUT { room?, key: "<slide>:<stage>", note: SpeakerNote }   → save an override
//   PUT { room?, key: "<slide>:<stage>", reset: true }         → drop the override
import { normalizeRoom } from '@/app/presentations/ai-feature-intelligence-layer/_sync/constants';
import { setNote } from '@/app/presentations/ai-feature-intelligence-layer/_sync/store';
import type { SpeakerNote } from '@/app/presentations/ai-feature-intelligence-layer/speakerNotes';
import { SLIDE_STEPS } from '@/app/presentations/ai-feature-intelligence-layer/steps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEY_RE = /^\d+:\d+$/;

/** True only if `key` addresses a real (slide, stage) beat in the deck geometry. */
function isValidKey(key: string): boolean {
  if (!KEY_RE.test(key)) return false;
  const [slideStr, stageStr] = key.split(':');
  const slide = Number(slideStr);
  const stage = Number(stageStr);
  const meta = SLIDE_STEPS[slide];
  return Boolean(meta) && stage >= 0 && stage < meta!.stepCount;
}

/** Validate + normalize an untrusted note payload into a clean SpeakerNote. */
function coerceNote(value: unknown): SpeakerNote | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.bullets)) return null;

  const bullets: SpeakerNote['bullets'] = [];
  for (const raw of obj.bullets) {
    if (!raw || typeof raw !== 'object') return null;
    const b = raw as Record<string, unknown>;
    if (typeof b.idea !== 'string') return null;
    const say = Array.isArray(b.say)
      ? b.say.filter((s): s is string => typeof s === 'string')
      : [];
    bullets.push({ idea: b.idea, say });
  }

  const headline =
    typeof obj.headline === 'string' && obj.headline.trim() ? obj.headline : undefined;
  return { headline, bullets };
}

export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const key = typeof body.key === 'string' ? body.key : '';
  if (!isValidKey(key)) {
    return Response.json({ error: 'key must be a valid "slide:stage"' }, { status: 400 });
  }

  const room = normalizeRoom(typeof body.room === 'string' ? body.room : null);

  if (body.reset === true) {
    setNote(room, key, null);
    return new Response(null, { status: 204 });
  }

  const note = coerceNote(body.note);
  if (!note) {
    return Response.json(
      { error: 'note must be { headline?: string, bullets: { idea: string, say: string[] }[] }' },
      { status: 400 },
    );
  }

  setNote(room, key, note);
  return new Response(null, { status: 204 });
}
