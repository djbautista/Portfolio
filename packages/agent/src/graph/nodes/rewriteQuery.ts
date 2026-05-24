import type { AgentDeps } from "@/deps";
import type { GraphState } from "@/graph/state";
import { buildRewritePrompt } from "@/prompts/rewriteQuery";

import { withStep } from "./step";

export function makeRewriteQuery(deps: AgentDeps) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("rewrite_query", async () => {
      const prompt = buildRewritePrompt({
        originalQuery: state.originalQuery,
        currentQuery: state.currentQuery,
        intent: state.intent,
        weakChunks: state.retrievedChunks,
      });

      const chatResult = await deps.chatProvider.chat({
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      });

      const rewritten = chatResult.content.trim();

      return {
        result: { rewritten },
        metadata: {
          previousQuery: state.currentQuery,
          rewrittenQuery: rewritten,
          retryCount: state.retryCount + 1,
          model: chatResult.model,
        },
      };
    });

    return {
      currentQuery: result.rewritten,
      retryCount: state.retryCount + 1,
      pendingSteps: [step],
    };
  };
}
