import { prisma, retrieveChunks } from "@portfolio/db";
import type { PrismaClient } from "@portfolio/db";
import type { RetrievedChunk } from "@portfolio/contracts/knowledge";

import { createHeuristicGrader } from "@/grader/heuristic";
import type { ContextGrader } from "@/grader/types";
import { getChatProvider } from "@/llm/index";
import type { ChatProvider } from "@/llm/types";

export interface RetrieveInput {
  query: string;
  topK?: number;
}

export type RetrieveFn = (input: RetrieveInput) => Promise<RetrievedChunk[]>;

export interface AgentDeps {
  prisma: PrismaClient;
  chatProvider: ChatProvider;
  grader: ContextGrader;
  retrieve: RetrieveFn;
}

export function resolveDeps(overrides: Partial<AgentDeps> = {}): AgentDeps {
  return {
    prisma: overrides.prisma ?? prisma,
    chatProvider: overrides.chatProvider ?? getChatProvider(),
    grader: overrides.grader ?? createHeuristicGrader(),
    retrieve:
      overrides.retrieve ??
      ((input) =>
        retrieveChunks({
          query: input.query,
          // retrieveChunks expects the post-parse RetrievalQuery shape where
          // topK is required (Zod fills the default at parse time). Mirror
          // that default here so the type stays clean.
          topK: input.topK ?? 5,
        })),
  };
}
