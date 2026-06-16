/**
 * Plain-text ↔ {@link SpeakerNote} conversion for the in-app note editor.
 *
 * A note is edited as a small, forgiving line format instead of a structured
 * widget — fewer moving parts, and quick to type:
 *
 *   # Optional headline
 *   - the key idea to land on this beat
 *   > a simple way to say it out loud
 *   > another way to say it
 *   - the next key idea
 *   > …
 *
 * Rules: a `# ` line sets the headline (first one wins). A `- ` line starts a new
 * bullet (its idea). A `> ` line adds a spoken variant to the current bullet. A
 * bare non-empty line is treated as a new idea, so half-typed notes still parse.
 * Blank lines are ignored. {@link serializeNote} is the exact inverse for any
 * note this round-trips.
 */
import type { SpeakerNote } from '@/app/presentations/ai-feature-intelligence-layer/speakerNotes';

/** Render a note as the editable line format. */
export function serializeNote(note: SpeakerNote): string {
  const lines: string[] = [];
  if (note.headline) lines.push(`# ${note.headline}`);
  for (const bullet of note.bullets) {
    lines.push(`- ${bullet.idea}`);
    for (const say of bullet.say) lines.push(`> ${say}`);
  }
  return lines.join('\n');
}

/** Parse the editable line format back into a note (forgiving; never throws). */
export function parseNote(text: string): SpeakerNote {
  let headline: string | undefined;
  const bullets: SpeakerNote['bullets'] = [];
  let current: SpeakerNote['bullets'][number] | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('# ')) {
      if (headline === undefined) headline = line.slice(2).trim();
      continue;
    }
    if (line.startsWith('> ')) {
      const say = line.slice(2).trim();
      if (current) current.say.push(say);
      else bullets.push((current = { idea: say, say: [] }));
      continue;
    }
    // "- idea", or any bare line, opens a new bullet
    const idea = line.startsWith('- ') ? line.slice(2).trim() : line;
    bullets.push((current = { idea, say: [] }));
  }

  return { headline: headline || undefined, bullets };
}
