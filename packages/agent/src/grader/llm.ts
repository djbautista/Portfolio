import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

import type { ChatProvider } from "#llm/types";
import {
  GraderResponseSchema,
  buildGraderPrompt,
  type GraderResponse,
} from "#prompts/grader";

import type { ContextGrader, ContextVerdict, GradeInput } from "./types";

export interface LLMGraderOptions {
  chatProvider: ChatProvider;
  temperature?: number;
}

export function createLLMGrader(options: LLMGraderOptions): ContextGrader {
  const { chatProvider, temperature = 0 } = options;

  return {
    async grade({ query, chunks }: GradeInput): Promise<ContextVerdict> {
      if (chunks.length === 0) {
        return {
          label: "none",
          accepted: [],
          reason: "no chunks retrieved",
        };
      }

      let parsed: GraderResponse;
      try {
        const prompt = buildGraderPrompt({ query, chunks });
        const chatResult = await chatProvider.chat({
          temperature,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
        });

        const json = extractJsonObject(chatResult.content);
        if (!json) {
          return softFail(chunks, "grader_error: no JSON object in response");
        }

        const result = GraderResponseSchema.safeParse(JSON.parse(json));
        if (!result.success) {
          return softFail(
            chunks,
            `grader_error: schema mismatch (${result.error.issues[0]?.message ?? "unknown"})`,
          );
        }
        parsed = result.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return softFail(chunks, `grader_error: ${message}`);
      }

      if (parsed.label !== "good") {
        const { topScore, meanScore } = scoreStats(chunks);
        return {
          label: parsed.label,
          accepted: [],
          reason: parsed.reason || undefined,
          topScore,
          meanScore,
        };
      }

      const acceptedIds = new Set(parsed.acceptedChunkIds);
      const accepted = chunks.filter((c) => acceptedIds.has(c.chunkId));

      if (accepted.length === 0) {
        const { topScore, meanScore } = scoreStats(chunks);
        return {
          label: "weak",
          accepted: [],
          reason: "good label but no chunks selected",
          topScore,
          meanScore,
        };
      }

      const { topScore, meanScore } = scoreStats(accepted);
      return {
        label: "good",
        accepted,
        reason: parsed.reason || undefined,
        topScore,
        meanScore,
      };
    },
  };
}

function scoreStats(chunks: RetrievedChunk[]): {
  topScore?: number;
  meanScore?: number;
} {
  if (chunks.length === 0) return {};
  const topScore = chunks.reduce(
    (acc, c) => (c.score > acc ? c.score : acc),
    0,
  );
  const meanScore =
    chunks.reduce((acc, c) => acc + c.score, 0) / chunks.length;
  return { topScore, meanScore };
}

// Soft-fail to "weak" so the existing retry-then-fallback router handles
// transient LLM problems gracefully — matches the rewriter's pattern of
// degrading instead of crashing the graph.
function softFail(chunks: RetrievedChunk[], reason: string): ContextVerdict {
  const { topScore, meanScore } = scoreStats(chunks);
  return {
    label: "weak",
    accepted: [],
    reason,
    topScore,
    meanScore,
  };
}

// Models occasionally wrap JSON in ```json fences or add a trailing sentence
// even when told not to. Locate the outermost {...} and return that slice.
function extractJsonObject(content: string): string | null {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return content.slice(start, end + 1);
}
