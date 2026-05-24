import type { GraphState } from "./state";

export type DecisionTarget = "generate_answer" | "rewrite_query" | "fallback";

export function decisionRouter(state: GraphState): DecisionTarget {
  if (state.relevanceLabel === "good") return "generate_answer";
  if (state.retryCount < state.maxRetries) return "rewrite_query";
  return "fallback";
}
