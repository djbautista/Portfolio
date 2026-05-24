import { z } from "zod";

export const TwilioInboundMessageSchema = z
  .object({
    MessageSid: z.string(),
    AccountSid: z.string(),
    MessagingServiceSid: z.string().optional(),
    From: z.string(),
    To: z.string(),
    Body: z.string(),
    NumMedia: z.string().optional(),
    ProfileName: z.string().optional(),
    WaId: z.string().optional(),
  })
  .passthrough();

export const TwilioStatusCallbackSchema = z
  .object({
    MessageSid: z.string(),
    MessageStatus: z.string(),
    To: z.string().optional(),
    From: z.string().optional(),
    ErrorCode: z.string().optional(),
    ErrorMessage: z.string().optional(),
  })
  .passthrough();

export type TwilioInboundMessage = z.infer<typeof TwilioInboundMessageSchema>;
export type TwilioStatusCallback = z.infer<typeof TwilioStatusCallbackSchema>;
