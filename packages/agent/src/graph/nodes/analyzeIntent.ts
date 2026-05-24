import type { GraphState } from "@/graph/state";
import { withStep } from "./step";

export function makeAnalyzeIntent() {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("intent_classifier", async () => {
      const trimmed = state.originalQuery.trim();
      const isFirstPass =
        state.currentQuery === "" || state.currentQuery === state.originalQuery;
      const currentQuery = isFirstPass ? trimmed : state.currentQuery;

      // Deterministic, no-LLM intent capture: short questions usually map to
      // a single topic, so use the trimmed query itself as the intent hint.
      const intent =
        state.intent ?? (trimmed.length > 0 ? trimmed : undefined);

      return {
        result: { currentQuery, intent },
        metadata: { isFirstPass },
      };
    });

    return {
      currentQuery: result.currentQuery,
      intent: result.intent,
      pendingSteps: [step],
    };
  };
}
