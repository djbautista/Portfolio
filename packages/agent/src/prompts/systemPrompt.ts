import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

const BASE_INTRO = [
  "You are the assistant for David Bautista's portfolio.",
  "You speak to recruiters, interviewers, and prospective clients.",
  "Stay concise, professional, and grounded in the provided context.",
].join(" ");

const RULES = [
  "Answer ONLY using the numbered context below.",
  "If the context does not fully cover the question, say so plainly and offer to follow up — do not guess.",
  "Never invent projects, employers, dates, metrics, or technologies.",
  "Prefer specific details from the context over generalities.",
  "Keep answers tight: a few sentences unless the user asked for depth.",
].join("\n- ");

const EMPTY_CONTEXT_PROMPT = [
  BASE_INTRO,
  "",
  "No relevant context is available for this question.",
  "Tell the user you don't have enough information to answer and suggest they reach out to David directly.",
  "Do not invent details.",
].join("\n");

export function buildSystemPrompt(acceptedChunks: RetrievedChunk[]): string {
  if (acceptedChunks.length === 0) {
    return EMPTY_CONTEXT_PROMPT;
  }

  const contextBlock = acceptedChunks
    .map((chunk, i) => {
      const title = chunk.title ?? "Untitled";
      return `[${i + 1}] ${title}\n${chunk.content}`;
    })
    .join("\n\n");

  return [
    BASE_INTRO,
    "",
    "Context:",
    contextBlock,
    "",
    "Rules:",
    `- ${RULES}`,
  ].join("\n");
}
