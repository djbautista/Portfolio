import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

export interface RewritePromptInput {
  originalQuery: string;
  currentQuery: string;
  intent?: string;
  weakChunks?: RetrievedChunk[];
}

export interface RewritePrompt {
  system: string;
  user: string;
}

const SYSTEM_PROMPT = [
  "You rewrite user questions to improve semantic retrieval against David Bautista's portfolio knowledge base.",
  "Preserve the original intent exactly. Do not invent names, projects, dates, or technologies that are not present in the input.",
  "Make the query more specific and retrieval-friendly: prefer concrete nouns, expand vague pronouns, and surface implicit topics.",
  "Output ONLY the rewritten query as a single line of plain text. No preamble, no quotes, no explanation.",
].join("\n");

export function buildRewritePrompt(input: RewritePromptInput): RewritePrompt {
  const lines: string[] = [`Original question: ${input.originalQuery}`];

  if (input.currentQuery && input.currentQuery !== input.originalQuery) {
    lines.push(`Previous rewrite (also weak): ${input.currentQuery}`);
  }

  if (input.intent) {
    lines.push(`Intent: ${input.intent}`);
  }

  if (input.weakChunks && input.weakChunks.length > 0) {
    lines.push("");
    lines.push(
      "Retrieval with the previous query returned these weak results:",
    );
    for (const [i, chunk] of input.weakChunks.entries()) {
      const title = chunk.title ?? "Untitled";
      const preview = chunk.content.slice(0, 120).replace(/\s+/g, " ").trim();
      lines.push(`[${i + 1}] ${title} — ${preview}`);
    }
    lines.push("");
    lines.push(
      "Rewrite to steer retrieval away from this drift while keeping the original intent.",
    );
  }

  lines.push("");
  lines.push("Rewritten query:");

  return {
    system: SYSTEM_PROMPT,
    user: lines.join("\n"),
  };
}
