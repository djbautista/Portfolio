import type { TwilioInboundMessage } from "@portfolio/contracts/twilio";
import type { FastifyBaseLogger } from "fastify";
import twilio from "twilio";
import type { Twilio as TwilioClient } from "twilio";

import { getApiEnv } from "#env";

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
  webhookPublicUrl: string;
}

export function getTwilioConfig(): TwilioConfig | undefined {
  const env = getApiEnv();
  if (
    !env.TWILIO_ACCOUNT_SID ||
    !env.TWILIO_AUTH_TOKEN ||
    !env.TWILIO_WHATSAPP_NUMBER ||
    !env.TWILIO_WEBHOOK_PUBLIC_URL
  ) {
    return undefined;
  }
  return {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
    webhookPublicUrl: env.TWILIO_WEBHOOK_PUBLIC_URL,
  };
}

export function isTwilioConfigured(): boolean {
  return getTwilioConfig() !== undefined;
}

let cachedClient: TwilioClient | undefined;

// Singleton — Twilio's SDK keeps internal HTTP keep-alive pools, so
// reconstructing per request would defeat them.
export function getTwilioClient(config: TwilioConfig): TwilioClient {
  if (!cachedClient) {
    cachedClient = twilio(config.accountSid, config.authToken);
  }
  return cachedClient;
}

export function verifyTwilioSignature(args: {
  authToken: string;
  signature: string | undefined;
  url: string;
  params: Record<string, unknown>;
}): boolean {
  if (!args.signature) return false;
  // validateRequest expects params as a flat string->string map. Twilio's
  // form-urlencoded body parses cleanly into that shape via @fastify/formbody.
  return twilio.validateRequest(
    args.authToken,
    args.signature,
    args.url,
    args.params as Record<string, string>,
  );
}

// Twilio inbound `From` for WhatsApp is `whatsapp:+15551234567`. We want a
// stable, channel-agnostic key without the prefix. `WaId` (when Twilio sends
// it) is already just digits — prefer it when available.
export function deriveWaKey(inbound: TwilioInboundMessage): string {
  if (inbound.WaId && inbound.WaId.trim().length > 0) {
    return `+${inbound.WaId.replace(/^\+/, "")}`;
  }
  return inbound.From.replace(/^whatsapp:/i, "");
}

// Keep country code + last 4 digits visible; mask the middle. Used in
// info-level logs to avoid raw PII at scale.
export function maskPhone(value: string | undefined): string {
  if (!value) return "<unknown>";
  const digits = value.replace(/[^\d]/g, "");
  if (digits.length <= 5) return "***";
  const cc = digits.slice(0, digits.length - 4 > 3 ? 2 : 1);
  const tail = digits.slice(-4);
  return `+${cc}***${tail}`;
}

// WhatsApp messages may be up to 4096 chars; agent answers can be long. Keep
// outbound under 1500 to stay inside one message + leave room for the suffix.
const MAX_BODY_CHARS = 1500;
const TRUNC_SUFFIX = "… (truncated)";

export function clampWhatsappBody(body: string): string {
  if (body.length <= MAX_BODY_CHARS) return body;
  return body.slice(0, MAX_BODY_CHARS - TRUNC_SUFFIX.length) + TRUNC_SUFFIX;
}

export interface SendWhatsAppArgs {
  to: string;
  body: string;
}

export interface SendWhatsAppResult {
  sid: string;
  status: string;
}

export async function sendWhatsAppMessage(
  args: SendWhatsAppArgs,
  ctx: { log: FastifyBaseLogger },
): Promise<SendWhatsAppResult> {
  const config = getTwilioConfig();
  if (!config) {
    throw new Error("sendWhatsAppMessage called without Twilio config");
  }
  const client = getTwilioClient(config);
  const body = clampWhatsappBody(args.body);
  try {
    const created = await client.messages.create({
      from: config.whatsappNumber,
      to: args.to,
      body,
    });
    ctx.log.info(
      {
        sid: created.sid,
        status: created.status,
        to: maskPhone(args.to),
        bodyLen: body.length,
      },
      "twilio.outbound_sent",
    );
    return { sid: created.sid, status: created.status };
  } catch (err) {
    // Twilio's RestException carries `code`, `status`, `moreInfo`. Project
    // only these explicit fields — never log the full error: some SDK
    // versions include request headers with the basic-auth-encoded token.
    const e = err as { code?: unknown; status?: unknown; moreInfo?: unknown };
    ctx.log.error(
      {
        twilioCode: e.code,
        twilioStatus: e.status,
        twilioMoreInfo: e.moreInfo,
        to: maskPhone(args.to),
      },
      "twilio.outbound_failed",
    );
    throw err;
  }
}
