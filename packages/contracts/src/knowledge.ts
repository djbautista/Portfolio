import { z } from "zod";

import { MetadataSchema, NonEmptyStringSchema } from "./common";

export const KnowledgeSourceTypeSchema = z.enum(["portfolio", "project", "experience", "skill", "dev_fixture"]);

export const KnowledgeDocumentInputSchema = z.object({
  title: NonEmptyStringSchema,
  sourceType: KnowledgeSourceTypeSchema,
  sourceUri: NonEmptyStringSchema.optional(),
  content: NonEmptyStringSchema,
  metadata: MetadataSchema.optional()
});

export const RetrievedChunkSchema = z.object({
  documentId: NonEmptyStringSchema,
  chunkId: NonEmptyStringSchema,
  title: z.string().nullable(),
  content: NonEmptyStringSchema,
  sourceType: KnowledgeSourceTypeSchema,
  score: z.number().min(0).max(1),
  rank: z.number().int().min(1)
});

export const RetrievalQuerySchema = z.object({
  query: NonEmptyStringSchema,
  topK: z.number().int().min(1).max(50).default(5),
  sourceType: KnowledgeSourceTypeSchema.optional(),
  minSimilarity: z.number().min(0).max(1).optional()
});

export type KnowledgeSourceType = z.infer<typeof KnowledgeSourceTypeSchema>;
export type KnowledgeDocumentInput = z.infer<typeof KnowledgeDocumentInputSchema>;
export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;
export type RetrievalQuery = z.infer<typeof RetrievalQuerySchema>;
