import type { AgentDeps } from "#deps";
import type { GraphState } from "#graph/state";
import { buildRewritePrompt } from "#prompts/rewriteQuery";

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

      // Fall back to the original query when the model returns nothing
      // usable — a blank string would crash retrieveChunks' NonEmptyString
      // validation on the next loop. The retry counter still ticks, so the
      // loop terminates via decisionRouter → fallback within maxRetries.
      const trimmed = chatResult.content.trim();
      const rewritten = trimmed.length > 0 ? trimmed : state.originalQuery;
      const fellBack = trimmed.length === 0;

      return {
        result: { rewritten },
        metadata: {
          previousQuery: state.currentQuery,
          rewrittenQuery: rewritten,
          retryCount: state.retryCount + 1,
          model: chatResult.model,
          fellBack,
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
