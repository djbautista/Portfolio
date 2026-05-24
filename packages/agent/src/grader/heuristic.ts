import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

import type { ContextGrader, ContextVerdict } from "./types";

export interface HeuristicGraderOptions {
  scoreFloor?: number;
  topScoreThreshold?: number;
  meanScoreThreshold?: number;
  minAcceptedCount?: number;
}

const DEFAULTS = {
  scoreFloor: 0.55,
  topScoreThreshold: 0.78,
  meanScoreThreshold: 0.7,
  minAcceptedCount: 1,
} as const;

export function createHeuristicGrader(
  options: HeuristicGraderOptions = {},
): ContextGrader {
  const scoreFloor = options.scoreFloor ?? DEFAULTS.scoreFloor;
  const topScoreThreshold =
    options.topScoreThreshold ?? DEFAULTS.topScoreThreshold;
  const meanScoreThreshold =
    options.meanScoreThreshold ?? DEFAULTS.meanScoreThreshold;
  const minAcceptedCount =
    options.minAcceptedCount ?? DEFAULTS.minAcceptedCount;

  return {
    grade(chunks: RetrievedChunk[]): ContextVerdict {
      if (chunks.length === 0) {
        return {
          label: "none",
          accepted: [],
          reason: "no chunks retrieved",
        };
      }

      const filtered = chunks.filter((c) => c.score >= scoreFloor);
      if (filtered.length === 0) {
        return {
          label: "none",
          accepted: [],
          reason: `all chunks below scoreFloor (${scoreFloor})`,
        };
      }

      const topScore = filtered.reduce(
        (acc, c) => (c.score > acc ? c.score : acc),
        0,
      );
      const meanScore =
        filtered.reduce((acc, c) => acc + c.score, 0) / filtered.length;

      if (
        topScore >= topScoreThreshold &&
        meanScore >= meanScoreThreshold &&
        filtered.length >= minAcceptedCount
      ) {
        return {
          label: "good",
          accepted: filtered,
          topScore,
          meanScore,
        };
      }

      return {
        label: "weak",
        accepted: [],
        topScore,
        meanScore,
        reason: "below confidence thresholds",
      };
    },
  };
}
