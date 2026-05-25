import type { AgentDeps } from "#deps";
import type { GraphState } from "#graph/state";

import { withStep } from "./step";

export function makeGradeContext(deps: AgentDeps) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("grade_context", async () => {
      // Grade against the user's original question — the answer node also
      // generates against originalQuery (see generateAnswer.ts), so the
      // grader must judge whether the chunks support that, not whatever
      // the rewriter happened to ask. The rewriter is told to preserve
      // intent, but we don't want correctness to depend on its fidelity.
      const verdict = await deps.grader.grade({
        query: state.originalQuery,
        chunks: state.retrievedChunks,
      });
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
