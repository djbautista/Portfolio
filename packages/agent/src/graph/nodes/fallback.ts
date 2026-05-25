import type { GraphState } from "#graph/state";
import { withStep } from "./step";

const FALLBACK_ANSWER =
  "I don't have enough information in David's portfolio to answer that confidently. I'll flag this so he can follow up directly.";

export function makeFallback() {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("fallback_escalation", async () => {
      return {
        result: { answer: FALLBACK_ANSWER, model: "fallback" },
        metadata: {
          retryCount: state.retryCount,
          relevanceLabel: state.relevanceLabel,
        },
      };
    });

    return {
      answer: result.answer,
      model: result.model,
      pendingSteps: [step],
    };
  };
}
