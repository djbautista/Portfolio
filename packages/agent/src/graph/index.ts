import { END, START, StateGraph } from "@langchain/langgraph";

import type { AgentDeps } from "#deps";

import { makeAnalyzeIntent } from "./nodes/analyzeIntent";
import { makeFallback } from "./nodes/fallback";
import { makeGenerateAnswer } from "./nodes/generateAnswer";
import { makeGradeContext } from "./nodes/gradeContext";
import { makeRetrieveContext } from "./nodes/retrieveContext";
import { makeRewriteQuery } from "./nodes/rewriteQuery";
import { decisionRouter } from "./routing";
import { AgentStateAnnotation } from "./state";

export function computeRecursionLimit(maxRetries: number): number {
  return maxRetries * 4 + 4;
}

function buildStateGraph(deps: AgentDeps) {
  return new StateGraph(AgentStateAnnotation)
    .addNode("analyze_intent", makeAnalyzeIntent())
    .addNode("retrieve_context", makeRetrieveContext(deps))
    .addNode("grade_context", makeGradeContext(deps))
    .addNode("rewrite_query", makeRewriteQuery(deps))
    .addNode("generate_answer", makeGenerateAnswer(deps))
    .addNode("fallback", makeFallback())
    .addEdge(START, "analyze_intent")
    .addEdge("analyze_intent", "retrieve_context")
    .addEdge("retrieve_context", "grade_context")
    .addConditionalEdges("grade_context", decisionRouter, {
      generate_answer: "generate_answer",
      rewrite_query: "rewrite_query",
      fallback: "fallback",
    })
    .addEdge("rewrite_query", "retrieve_context")
    .addEdge("generate_answer", END)
    .addEdge("fallback", END);
}

export function buildAgentGraph(deps: AgentDeps) {
  const graph = buildStateGraph(deps).compile();
  return {
    graph,
    defaultRecursionLimit: computeRecursionLimit(1),
  };
}

export type BuiltAgentGraph = ReturnType<typeof buildAgentGraph>;
