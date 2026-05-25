import type { AgentDeps } from "#deps";
import type { GraphState } from "#graph/state";

import { withStep } from "./step";

export function makeGradeContext(deps: AgentDeps) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("grade_context", async () => {
      const verdict = await deps.grader.grade(state.retrievedChunks);
      const accepted = verdict.label === "good" ? verdict.accepted : [];
      return {
        result: { verdict, accepted },
        metadata: {
          label: verdict.label,
          reason: verdict.reason,
          topScore: verdict.topScore,
          meanScore: verdict.meanScore,
          acceptedCount: accepted.length,
        },
      };
    });

    return {
      relevanceLabel: result.verdict.label,
      acceptedChunks: result.accepted,
      pendingSteps: [step],
    };
  };
}
