import { randomUUID } from "node:crypto";

import {
  AgentRequestSchema,
  AgentResponseSchema,
  type AgentConfidence,
  type AgentResponse,
} from "@portfolio/contracts/agent";

import { resolveDeps, type AgentDeps } from "#deps";
import { buildAgentGraph, computeRecursionLimit } from "#graph/index";
import type { GraphState } from "#graph/state";
import {
  finalizeTrace,
  flushSteps,
  openTrace,
  writeRetrievedContexts,
} from "#persistence/trace";

export async function runAgent(
  rawRequest: unknown,
  overrides: Partial<AgentDeps> = {},
): Promise<AgentResponse> {
  const request = AgentRequestSchema.parse(rawRequest);
  const deps = resolveDeps(overrides);

  const traceId = randomUUID();
  const startedAt = Date.now();
  const maxRetries = request.maxRetries ?? 1;

  await openTrace({
    prisma: deps.prisma,
    traceId,
    request,
    model: null,
  });

  const { graph } = buildAgentGraph(deps);
  const recursionLimit = computeRecursionLimit(maxRetries);

  let terminalState: GraphState | undefined;
  let thrown: unknown;

  try {
    terminalState = await graph.invoke(
      {
        originalQuery: request.message,
        currentQuery: request.message,
        maxRetries,
        topK: request.topK,
        metadata: request.metadata,
        traceId,
      },
      { recursionLimit },
    );
  } catch (err) {
    thrown = err;
  }

  // Persistence runs unconditionally but outside `finally` so a failure here
  // doesn't silently replace the graph error when both fail.
  let persistenceError: unknown;
  try {
    await flushSteps({
      prisma: deps.prisma,
      traceId,
      steps: terminalState?.pendingSteps ?? [],
    });
    await writeRetrievedContexts({
      prisma: deps.prisma,
      traceId,
      chunks: terminalState?.acceptedChunks ?? [],
    });
    await finalizeTrace({
      prisma: deps.prisma,
      traceId,
      output: terminalState?.answer ?? null,
      confidence: confidenceFor(terminalState),
      shouldEscalate: shouldEscalateFor(terminalState, thrown),
      retrievedContextCount: terminalState?.acceptedChunks.length ?? 0,
      latencyMs: Date.now() - startedAt,
      model: terminalState?.model ?? null,
      retryCount: terminalState?.retryCount ?? 0,
      error: thrown,
    });
  } catch (err) {
    persistenceError = err;
  }

  if (thrown !== undefined) {
    if (persistenceError !== undefined) {
      console.error(
        `[runAgent] trace ${traceId} persistence failed while handling a graph error:`,
        persistenceError,
      );
    }
    throw thrown;
  }
  if (persistenceError !== undefined) {
    throw persistenceError;
  }

  const state = terminalState as GraphState;
  if (!state.answer) {
    throw new Error("Agent graph terminated without an answer");
  }

  return AgentResponseSchema.parse({
    answer: state.answer,
    confidence: confidenceFor(state),
    sources: state.acceptedChunks,
    traceId,
    shouldEscalate: shouldEscalateFor(state, undefined),
    metadata: {
      retryCount: state.retryCount,
      ...(state.model ? { model: state.model } : {}),
    },
  });
}

function confidenceFor(state: GraphState | undefined): AgentConfidence {
  if (!state) return "low";
  const lastStep = state.pendingSteps[state.pendingSteps.length - 1];
  if (lastStep?.stepName === "fallback_escalation") return "low";
  if (state.relevanceLabel !== "good") return "low";
  if (state.retryCount === 0) return "high";
  return "medium";
}

function shouldEscalateFor(
  state: GraphState | undefined,
  thrown: unknown,
): boolean {
  if (thrown !== undefined) return true;
  return confidenceFor(state) === "low";
}
