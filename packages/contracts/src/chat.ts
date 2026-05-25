import { z } from "zod";

import { AgentResponseSchema } from "./agent";
import {
  ChannelSchema,
  MetadataSchema,
  NonEmptyStringSchema,
} from "./common";

export const ChatRequestSchema = z.object({
  conversationId: NonEmptyStringSchema.optional(),
  userId: NonEmptyStringSchema.optional(),
  message: NonEmptyStringSchema,
  channel: ChannelSchema.default("web"),
  metadata: MetadataSchema.optional(),
});

// .extend() (not redeclaration) keeps the API response in lockstep with the
// agent response on agent-owned fields: confidence, sources, traceId,
// shouldEscalate, metadata. The API only adds conversationId, which it owns.
export const ChatResponseSchema = AgentResponseSchema.extend({
  conversationId: NonEmptyStringSchema,
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
