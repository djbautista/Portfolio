import { Prisma, type PrismaClient } from "@portfolio/db";
import type { AgentRequest } from "@portfolio/contracts/agent";
import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

import type { StepRecord, StepStatus } from "@/graph/state";

export interface OpenTraceInput {
  prisma: PrismaClient;
  traceId: string;
  request: AgentRequest;
  model?: string | null;
}

export async function openTrace({
  prisma,
  traceId,
  request,
  model = null,
}: OpenTraceInput): Promise<void> {
  await prisma.agentTrace.create({
    data: {
      id: traceId,
      input: request.message,
      conversationId: request.conversationId ?? null,
      model,
      shouldEscalate: false,
    },
  });
}

export interface FlushStepsInput {
  prisma: PrismaClient;
  traceId: string;
  steps: StepRecord[];
}

const STEP_STATUS_TO_DB: Record<StepStatus, string> = {
  success: "completed",
  error: "failed",
  skipped: "skipped",
};

export async function flushSteps({
  prisma,
  traceId,
  steps,
}: FlushStepsInput): Promise<void> {
  if (steps.length === 0) return;

  await prisma.agentStep.createMany({
    data: steps.map((step) => ({
      traceId,
      stepName: step.stepName,
      status: STEP_STATUS_TO_DB[step.status],
      latencyMs: step.latencyMs,
      metadata: toJsonInput(step.metadata),
      createdAt: step.startedAt,
    })),
  });
}

export interface WriteRetrievedContextsInput {
  prisma: PrismaClient;
  traceId: string;
  chunks: RetrievedChunk[];
}

export async function writeRetrievedContexts({
  prisma,
  traceId,
  chunks,
}: WriteRetrievedContextsInput): Promise<void> {
  if (chunks.length === 0) return;

  await prisma.retrievedContext.createMany({
    data: chunks.map((chunk) => ({
      traceId,
      documentChunkId: chunk.chunkId,
      documentId: chunk.documentId,
      title: chunk.title,
      content: chunk.content,
      score: chunk.score,
      rank: chunk.rank,
    })),
  });
}

export interface FinalizeTraceInput {
  prisma: PrismaClient;
  traceId: string;
  output: string | null;
  confidence: string | null;
  shouldEscalate: boolean;
  retrievedContextCount: number;
  latencyMs: number;
  model: string | null;
  retryCount: number;
  error?: unknown;
}

export async function finalizeTrace({
  prisma,
  traceId,
  output,
  confidence,
  shouldEscalate,
  retrievedContextCount,
  latencyMs,
  model,
  retryCount,
  error,
}: FinalizeTraceInput): Promise<void> {
  const metadata: Record<string, unknown> = { retryCount };
  if (error !== undefined) {
    metadata.error = serializeError(error);
  }

  await prisma.agentTrace.update({
    where: { id: traceId },
    data: {
      output,
      confidence,
      shouldEscalate,
      retrievedContextCount,
      latencyMs,
      model,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

function toJsonInput(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      ...(err.stack ? { stack: err.stack } : {}),
    };
  }
  return { value: String(err) };
}
