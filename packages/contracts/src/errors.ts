import { z } from "zod";

import { NonEmptyStringSchema } from "./common";

export const ErrorCodeSchema = z.enum([
  "validation_error",
  "conversation_not_found",
  "agent_failure",
  "internal_error",
  "twilio_not_configured",
  "twilio_signature_invalid",
]);

export const ErrorResponseSchema = z.object({
  code: ErrorCodeSchema,
  message: NonEmptyStringSchema,
  details: z.unknown().optional(),
});

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
