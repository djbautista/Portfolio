import { z } from "zod";

import {
  ChannelProviderSchema,
  ChannelSchema,
  ISODateStringSchema,
  MetadataSchema,
} from "./common";

export const ChannelEventDirectionSchema = z.enum(["inbound", "outbound"]);

export const ChannelEventTypeSchema = z.enum([
  "message_received",
  "message_sent",
  "delivery_status",
  "error",
]);

export const ChannelEventSchema = z.object({
  id: z.string().optional(),
  conversationId: z.string().optional(),
  provider: ChannelProviderSchema,
  providerEventId: z.string().optional(),
  providerMessageId: z.string().optional(),
  channel: ChannelSchema,
  direction: ChannelEventDirectionSchema,
  eventType: ChannelEventTypeSchema,
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  body: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  rawPayload: z.unknown().optional(),
  createdAt: ISODateStringSchema.optional(),
  metadata: MetadataSchema.optional(),
});

export const InboundChannelMessageSchema = z.object({
  provider: ChannelProviderSchema,
  providerMessageId: z.string().optional(),
  from: z.string(),
  to: z.string().optional(),
  body: z.string(),
  channel: ChannelSchema,
  rawPayload: z.unknown().optional(),
  metadata: MetadataSchema.optional(),
});

export const OutboundChannelStatusSchema = z.object({
  provider: ChannelProviderSchema,
  providerMessageId: z.string().optional(),
  status: z.string(),
  to: z.string().optional(),
  from: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  rawPayload: z.unknown().optional(),
  metadata: MetadataSchema.optional(),
});

export type ChannelEventDirection = z.infer<typeof ChannelEventDirectionSchema>;
export type ChannelEventType = z.infer<typeof ChannelEventTypeSchema>;
export type ChannelEvent = z.infer<typeof ChannelEventSchema>;
export type InboundChannelMessage = z.infer<typeof InboundChannelMessageSchema>;
export type OutboundChannelStatus = z.infer<typeof OutboundChannelStatusSchema>;
