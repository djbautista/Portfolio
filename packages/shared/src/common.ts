import { z } from "zod";

export const NonEmptyStringSchema = z.string().min(1);

export const ISODateStringSchema = z.string().datetime();

export const MetadataSchema = z.record(z.unknown());

export const ChannelProviderSchema = z.enum([
  "web",
  "twilio",
  "slack",
  "email",
  "telegram",
  "other",
]);

export const ChannelSchema = z.enum([
  "sms",
  "whatsapp",
  "voice",
  "web",
  "slack",
  "email",
  "telegram",
  "other",
]);

export type NonEmptyString = z.infer<typeof NonEmptyStringSchema>;
export type ISODateString = z.infer<typeof ISODateStringSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type ChannelProvider = z.infer<typeof ChannelProviderSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
