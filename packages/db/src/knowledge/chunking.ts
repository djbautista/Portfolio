export interface ChunkOptions {
  targetChars?: number;
  overlapChars?: number;
}

export interface TextChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

const DEFAULT_TARGET = 1500;
const DEFAULT_OVERLAP = 150;

export function chunkText(content: string, opts: ChunkOptions = {}): TextChunk[] {
  const targetChars = opts.targetChars ?? DEFAULT_TARGET;
  const overlapChars = opts.overlapChars ?? DEFAULT_OVERLAP;

  if (targetChars <= 0) {
    throw new Error("chunkText: targetChars must be positive.");
  }
  if (overlapChars < 0 || overlapChars >= targetChars) {
    throw new Error("chunkText: overlapChars must be >= 0 and strictly less than targetChars.");
  }

  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (normalized.length === 0) return [];

  if (normalized.length <= targetChars) {
    return [
      {
        chunkIndex: 0,
        content: normalized,
        tokenCount: estimateTokens(normalized)
      }
    ];
  }

  const chunks: TextChunk[] = [];
  let cursor = 0;
  let chunkIndex = 0;

  while (cursor < normalized.length) {
    const end = Math.min(cursor + targetChars, normalized.length);
    const slice = normalized.slice(cursor, end);

    let breakAt = slice.length;
    if (end < normalized.length) {
      breakAt = findBreakpoint(slice);
    }

    const piece = slice.slice(0, breakAt).trim();
    if (piece.length > 0) {
      chunks.push({
        chunkIndex,
        content: piece,
        tokenCount: estimateTokens(piece)
      });
      chunkIndex += 1;
    }

    if (end >= normalized.length) break;

    const advance = Math.max(breakAt - overlapChars, 1);
    cursor += advance;
  }

  return chunks;
}

function findBreakpoint(slice: string): number {
  const candidates = [slice.lastIndexOf("\n\n"), slice.lastIndexOf("\n"), slice.lastIndexOf(". ")];
  const minViable = Math.floor(slice.length * 0.5);
  for (const idx of candidates) {
    if (idx >= minViable) return idx + 1;
  }
  return slice.length;
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
