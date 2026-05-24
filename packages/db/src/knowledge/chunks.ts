import { randomUUID } from "node:crypto";

import pgvector from "pgvector";

import { prisma, Prisma } from "../index.js";
import type { TextChunk } from "./chunking.js";

const EXPECTED_DIMENSIONS = 1536;

export interface StoredChunkInput extends TextChunk {
  title?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ReplaceChunksResult {
  inserted: number;
}

export async function replaceDocumentChunks(
  documentId: string,
  chunks: StoredChunkInput[],
  embeddings: number[][]
): Promise<ReplaceChunksResult> {
  if (chunks.length !== embeddings.length) {
    throw new Error(`replaceDocumentChunks: got ${chunks.length} chunks but ${embeddings.length} embeddings.`);
  }

  for (const [i, vec] of embeddings.entries()) {
    if (vec.length !== EXPECTED_DIMENSIONS) {
      throw new Error(
        `replaceDocumentChunks: embedding at index ${i} has ${vec.length} dimensions, expected ${EXPECTED_DIMENSIONS}.`
      );
    }
    for (const [j, n] of vec.entries()) {
      if (!Number.isFinite(n)) {
        throw new Error(`replaceDocumentChunks: embedding[${i}][${j}] is not finite.`);
      }
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "DocumentChunk" WHERE "documentId" = ${documentId}`;

    if (chunks.length === 0) {
      return { inserted: 0 };
    }

    for (const [i, chunk] of chunks.entries()) {
      const embedding = embeddings[i]!;
      const vectorLiteral = pgvector.toSql(embedding) as string;
      const metadataJson = chunk.metadata == null ? Prisma.DbNull : (chunk.metadata as Prisma.InputJsonValue);

      await tx.$executeRaw`
        INSERT INTO "DocumentChunk" (
          "id", "documentId", "chunkIndex", "title", "content",
          "embedding", "tokenCount", "metadata", "createdAt"
        ) VALUES (
          ${randomUUID()},
          ${documentId},
          ${chunk.chunkIndex}::int,
          ${chunk.title ?? null},
          ${chunk.content},
          ${vectorLiteral}::vector(1536),
          ${chunk.tokenCount}::int,
          ${metadataJson}::jsonb,
          NOW()
        )
      `;
    }

    return { inserted: chunks.length };
  });
}
