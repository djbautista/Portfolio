import { randomUUID } from "node:crypto";

import {
  AgentRequestSchema,
  AgentResponseSchema,
  type AgentConfidence,
  type AgentResponse,
} from "@portfolio/contracts/agent";

import { resolveDeps, type AgentDeps } from "#deps";
import { buildAgentGraph, computeRecursionLimit } from "#graph/index";
import type { GraphState, PriorTurn } from "#graph/state";
import {
  finalizeTrace,
  flushSteps,
  openTrace,
  writeRetrievedContexts,
} from "#persistence/trace";

// Cap on the number of prior turns folded into the LLM prompt. Each turn
// is one Message row (user or assistant), so 10 ≈ 5 round-trips. The cap
// is intentionally modest — most followups only need the last few — and
// keeps the prompt well inside the gpt-4o-mini context window without a
// token counter. Bump when conversations get longer in practice.
const PRIOR_TURNS_LIMIT = 10;

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

  const priorMessages = await loadPriorMessages({
    prisma: deps.prisma,
    conversationId: request.conversationId,
    excludeMessageId: request.userMessageId,
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
        priorMessages,
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

async function loadPriorMessages(args: {
  prisma: AgentDeps["prisma"];
  conversationId: string | undefined;
  excludeMessageId: string | undefined;
}): Promise<PriorTurn[]> {
  if (!args.conversationId) return [];

  // Fetch the most recent N+1, then drop the current user message (or the
  // single newest row if no id was provided) and return in chronological
  // order. Roles other than "user"/"assistant" are filtered out so a stray
  // value can't widen the LLM message shape.
  const rows = await args.prisma.message.findMany({
    where: {
      conversationId: args.conversationId,
      ...(args.excludeMessageId
        ? { id: { not: args.excludeMessageId } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PRIOR_TURNS_LIMIT,
    select: { role: true, content: true },
  });

  return rows
    .reverse()
    .filter((m): m is { role: "user" | "assistant"; content: string } =>
      m.role === "user" || m.role === "assistant",
    );
}
