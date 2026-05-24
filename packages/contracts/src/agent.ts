import { z } from "zod";

import { ChannelSchema, MetadataSchema, NonEmptyStringSchema } from "./common";
import { RetrievedChunkSchema, type RetrievedChunk } from "./knowledge";

export const AgentConfidenceSchema = z.enum(["high", "medium", "low"]);

// Alias — must remain the same schema instance as RetrievedChunkSchema so
// retrieval results flow into agent responses without a parallel shape.
export const AgentSourceSchema = RetrievedChunkSchema;

export const AgentRequestSchema = z.object({
  conversationId: NonEmptyStringSchema.optional(),
  userId: NonEmptyStringSchema.optional(),
  message: NonEmptyStringSchema,
  channel: ChannelSchema,
  metadata: MetadataSchema.optional(),
  maxRetries: z.number().int().min(0).max(2).optional(),
  topK: z.number().int().min(1).max(20).optional(),
});

export const AgentResponseSchema = z.object({
  answer: NonEmptyStringSchema,
  confidence: AgentConfidenceSchema,
  sources: z.array(AgentSourceSchema),
  traceId: NonEmptyStringSchema,
  shouldEscalate: z.boolean(),
  metadata: MetadataSchema.optional(),
});

export type AgentConfidence = z.infer<typeof AgentConfidenceSchema>;
export type AgentSource = RetrievedChunk;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
