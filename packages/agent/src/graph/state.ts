import { Annotation } from "@langchain/langgraph";
import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

import type { RelevanceLabel } from "@/grader/types";

export type StepStatus = "success" | "error" | "skipped";

export interface StepRecord {
  stepName: string;
  status: StepStatus;
  startedAt: Date;
  finishedAt: Date;
  latencyMs: number;
  metadata?: Record<string, unknown>;
  error?: string;
}

export const AgentStateAnnotation = Annotation.Root({
  originalQuery: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
  currentQuery: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
  intent: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  acceptedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  retryCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),
  maxRetries: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 1,
  }),
  relevanceLabel: Annotation<RelevanceLabel | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  answer: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  model: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  topK: Annotation<number | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  metadata: Annotation<Record<string, unknown> | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  pendingSteps: Annotation<StepRecord[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  traceId: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
});

export type GraphState = typeof AgentStateAnnotation.State;
