import type { StepRecord } from "@/graph/state";

export interface StepBody<T> {
  result: T;
  metadata?: Record<string, unknown>;
}

export async function withStep<T>(
  stepName: string,
  fn: () => Promise<StepBody<T>>,
): Promise<{ result: T; step: StepRecord }> {
  const startedAt = new Date();
  const { result, metadata } = await fn();
  const finishedAt = new Date();
  return {
    result,
    step: {
      stepName,
      status: "success",
      startedAt,
      finishedAt,
      latencyMs: finishedAt.getTime() - startedAt.getTime(),
      metadata,
    },
  };
}
