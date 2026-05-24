import pgvector from "pgvector";

import { RetrievalQuerySchema, RetrievedChunkSchema, type RetrievalQuery, type RetrievedChunk } from "@portfolio/contracts/knowledge";

import { getEmbeddingProvider } from "@/embeddings/index";
import { prisma } from "@/index";

export interface RetrieveChunksInput extends RetrievalQuery {
  embedding?: number[];
}

interface RetrievalRow {
  chunkId: string;
  documentId: string;
  title: string | null;
  content: string;
  sourceType: string;
  score: number;
}

export async function retrieveChunks(input: RetrieveChunksInput): Promise<RetrievedChunk[]> {
  const parsed = RetrievalQuerySchema.parse({
    query: input.query,
    topK: input.topK,
    sourceType: input.sourceType,
    minSimilarity: input.minSimilarity
  });

  const embedding = input.embedding ?? (await embedOne(parsed.query));
  const vectorLiteral = pgvector.toSql(embedding) as string;
  const sourceType = parsed.sourceType ?? null;
  const minSimilarity = parsed.minSimilarity ?? null;

  const rows = await prisma.$queryRaw<RetrievalRow[]>`
    SELECT c."id"          AS "chunkId",
           c."documentId"  AS "documentId",
           c."title"       AS "title",
           c."content"     AS "content",
           d."sourceType"  AS "sourceType",
           1 - (c."embedding" <=> ${vectorLiteral}::vector(1536))::float8 AS "score"
      FROM "DocumentChunk" c
      JOIN "Document" d ON d."id" = c."documentId"
     WHERE d."isActive" = true
       AND c."embedding" IS NOT NULL
       AND (${sourceType}::text IS NULL OR d."sourceType" = ${sourceType}::text)
       AND (
         ${minSimilarity}::float8 IS NULL
         OR 1 - (c."embedding" <=> ${vectorLiteral}::vector(1536))::float8 >= ${minSimilarity}::float8
       )
     ORDER BY c."embedding" <=> ${vectorLiteral}::vector(1536) ASC
     LIMIT ${parsed.topK}::int
  `;

  return rows.map((row, index) =>
    RetrievedChunkSchema.parse({
      documentId: row.documentId,
      chunkId: row.chunkId,
      title: row.title,
      content: row.content,
      sourceType: row.sourceType,
      score: clampUnit(row.score),
      rank: index + 1
    })
  );
}

async function embedOne(text: string): Promise<number[]> {
  const provider = getEmbeddingProvider();
  const [vector] = await provider.embed([text]);
  if (!vector) {
    throw new Error("Embedding provider returned no vector for query.");
  }
  return vector;
}

function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
