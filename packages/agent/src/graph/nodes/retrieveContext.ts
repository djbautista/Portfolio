import type { AgentDeps } from "#deps";
import type { GraphState } from "#graph/state";

import { withStep } from "./step";

export function makeRetrieveContext(deps: AgentDeps) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("retrieve_context", async () => {
      const chunks = await deps.retrieve({
        query: state.currentQuery,
        topK: state.topK,
      });
      return {
        result: chunks,
        metadata: {
          query: state.currentQuery,
          topK: state.topK,
          count: chunks.length,
          retryCount: state.retryCount,
        },
      };
    });

    return {
      retrievedChunks: result,
      pendingSteps: [step],
    };
  };
}
