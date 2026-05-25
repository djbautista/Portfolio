import type { RetrievedChunk } from "@portfolio/contracts/knowledge";
import { z } from "zod";

export interface GraderPromptInput {
  query: string;
  chunks: RetrievedChunk[];
}

export interface GraderPrompt {
  system: string;
  user: string;
}

const CHUNK_PREVIEW_CHARS = 600;

const SYSTEM_PROMPT = [
  "You judge whether retrieved knowledge chunks support answering a question about David Bautista's portfolio (his experience, projects, skills, and background).",
  "Choose one label:",
  '- "good": at least one chunk directly supports a confident, specific answer to the question.',
  '- "weak": chunks are related to the topic but do not contain enough to answer confidently.',
  '- "none": chunks are off-topic or do not address the question at all.',
  'When the label is "good", list the chunkIds of the chunks that actually support the answer in acceptedChunkIds. Be conservative — exclude tangentially-related chunks even if they share keywords.',
  'When the label is "weak" or "none", acceptedChunkIds must be an empty array.',
  'Output JSON ONLY matching this exact shape — no prose, no code fences, no commentary:',
  '{"label":"good"|"weak"|"none","reason":"<one short sentence>","acceptedChunkIds":["<chunkId>", ...]}',
].join("\n");

export function buildGraderPrompt(input: GraderPromptInput): GraderPrompt {
  const lines: string[] = [`Question: ${input.query}`, "", "Retrieved chunks:"];

  if (input.chunks.length === 0) {
    lines.push("(none)");
  } else {
    for (const chunk of input.chunks) {
      const title = chunk.title ?? "Untitled";
      const preview = chunk.content
        .slice(0, CHUNK_PREVIEW_CHARS)
        .replace(/\s+/g, " ")
        .trim();
      lines.push(
        `[${chunk.chunkId}] (${chunk.sourceType}, score=${chunk.score.toFixed(2)}) ${title}`,
      );
      lines.push(preview);
      lines.push("");
    }
  }

  lines.push("Return JSON only.");

  return {
    system: SYSTEM_PROMPT,
    user: lines.join("\n"),
  };
}

export const GraderResponseSchema = z.object({
  label: z.enum(["good", "weak", "none"]),
  reason: z.string().default(""),
  acceptedChunkIds: z.array(z.string()).default([]),
});

export type GraderResponse = z.infer<typeof GraderResponseSchema>;
