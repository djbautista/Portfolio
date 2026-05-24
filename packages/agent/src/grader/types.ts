import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

export type RelevanceLabel = "good" | "weak" | "none";

export interface ContextVerdict {
  label: RelevanceLabel;
  accepted: RetrievedChunk[];
  reason?: string;
  topScore?: number;
  meanScore?: number;
}

export interface ContextGrader {
  grade(chunks: RetrievedChunk[]): ContextVerdict | Promise<ContextVerdict>;
}
