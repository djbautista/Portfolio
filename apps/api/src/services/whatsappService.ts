import type { TwilioInboundMessage } from "@portfolio/contracts/twilio";
import { Prisma, prisma } from "@portfolio/db";
import type { FastifyBaseLogger } from "fastify";

import { runChat } from "#services/chatService";
import {
  deriveWaKey,
  maskPhone,
  sendWhatsAppMessage,
} from "#services/twilioService";

const TWILIO_PROVIDER = "twilio" as const;
const WHATSAPP_CHANNEL = "whatsapp" as const;

// Matches the marker produced by apps/web/utils/whatsapp.ts when a visitor
// clicks "Continue on WhatsApp" mid-session: `(ref: <conversationId>)`.
// IDs are cuids (lowercase base36, 24+ chars) — the bound is loose so a
// future id format change doesn't silently break the link.
//
// Plaintext: anyone who can read the wa.me link can also impersonate the
// session continuation. Acceptable for a portfolio bot; if that ever
// matters, sign the ref with an HMAC and add a short TTL.
// The leading `\s*` consumes the space before `(ref: …)` so stripping
// doesn't leave a phantom space before adjacent punctuation.
const REF_PATTERN = /\s*\(ref:\s*([a-z0-9_-]{8,40})\)/i;

export interface ProcessInboundArgs {
  inbound: TwilioInboundMessage;
  log: FastifyBaseLogger;
}

// Runs AFTER the webhook has already replied 200 to Twilio. Any error here
// must be caught and logged by the caller (setImmediate(...).catch(log)) so
// the request never hangs and unhandled rejections don't crash the process.
export async function processInboundWhatsApp(
  args: ProcessInboundArgs,
): Promise<void> {
  const { inbound, log } = args;
  const waKey = deriveWaKey(inbound);

  // Dedup against ChannelEvent (the explicit wire-level layer). If we've
  // already accepted this MessageSid as inbound, this is a Twilio retry and
  // we must not double-run the agent.
  const existingInbound = await prisma.channelEvent.findFirst({
    where: {
      provider: TWILIO_PROVIDER,
      providerMessageId: inbound.MessageSid,
      direction: "inbound",
    },
    select: { id: true },
  });
  if (existingInbound) {
    log.info(
      { MessageSid: inbound.MessageSid, eventId: existingInbound.id },
      "twilio.inbound_dedup",
    );
    return;
  }

  const resolved = await resolveConversation({ inbound, waKey, log });
  const conversation = resolved.conversation;
  const cleanBody = resolved.cleanBody;

  // Persist the inbound user Message first so AgentTrace.userMessageId
  // backfill (inside runChat) points at the right row. Save the cleaned
  // body (ref marker stripped) so the message history reads naturally;
  // the original body is preserved in the ChannelEvent.rawPayload below.
  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: cleanBody,
      providerMessageId: inbound.MessageSid,
      metadata: toJsonInput({
        from: inbound.From,
        to: inbound.To,
        waId: inbound.WaId,
        profileName: inbound.ProfileName,
        handoffRef: resolved.matchedRef,
      }),
    },
  });

  // Inbound ChannelEvent: persist BEFORE the agent runs so a Twilio retry
  // arriving mid-agent still hits the dedup check above on the next attempt.
  await prisma.channelEvent.create({
    data: {
      conversationId: conversation.id,
      provider: TWILIO_PROVIDER,
      providerMessageId: inbound.MessageSid,
      channel: WHATSAPP_CHANNEL,
      direction: "inbound",
      eventType: "message_received",
      from: inbound.From,
      to: inbound.To,
      body: inbound.Body,
      rawPayload: toJsonInput(inbound as unknown as Record<string, unknown>),
    },
  });

  log.info(
    {
      conversationId: conversation.id,
      MessageSid: inbound.MessageSid,
      from: maskPhone(inbound.From),
      waKey: maskPhone(waKey),
      bodyLen: inbound.Body.length,
    },
    "twilio.inbound_accepted",
  );

  const result = await runChat(
    {
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      userId: waKey,
      channel: WHATSAPP_CHANNEL,
      message: cleanBody,
      metadata: {
        from: inbound.From,
        waId: inbound.WaId,
        profileName: inbound.ProfileName,
        handoffRef: resolved.matchedRef,
      },
    },
    { log },
  );

  try {
    const sent = await sendWhatsAppMessage(
      { to: inbound.From, body: result.answer },
      { log },
    );
    await prisma.channelEvent.create({
      data: {
        conversationId: conversation.id,
        provider: TWILIO_PROVIDER,
        providerMessageId: sent.sid,
        channel: WHATSAPP_CHANNEL,
        direction: "outbound",
        eventType: "message_sent",
        status: sent.status,
        from: inbound.To,
        to: inbound.From,
        body: result.answer,
      },
    });
  } catch (err) {
    const e = err as { code?: unknown; message?: unknown };
    await prisma.channelEvent.create({
      data: {
        conversationId: conversation.id,
        provider: TWILIO_PROVIDER,
        channel: WHATSAPP_CHANNEL,
        direction: "outbound",
        eventType: "error",
        from: inbound.To,
        to: inbound.From,
        body: result.answer,
        errorCode: e.code != null ? String(e.code) : undefined,
        errorMessage: e.message != null ? String(e.message) : undefined,
      },
    });
    throw err;
  }
}

interface ResolvedConversation {
  conversation: { id: string };
  // The original `Body` with any `(ref: …)` marker stripped. Trimmed so
  // collapsed whitespace doesn't leak into the agent prompt.
  cleanBody: string;
  // The conversationId extracted from the ref, if it actually matched a
  // real Conversation row. Persisted on the user Message/agent metadata
  // for auditability.
  matchedRef: string | undefined;
}

async function resolveConversation(args: {
  inbound: TwilioInboundMessage;
  waKey: string;
  log: FastifyBaseLogger;
}): Promise<ResolvedConversation> {
  const { inbound, waKey, log } = args;
  const refMatch = inbound.Body.match(REF_PATTERN);
  const refId = refMatch?.[1];
  const cleanBody = inbound.Body.replace(REF_PATTERN, "").replace(/\s+/g, " ").trim();

  // 1) Try the handoff ref first. If valid, adopt that conversation and
  // tag it with the waKey so subsequent (ref-less) WhatsApp messages from
  // the same number land here too.
  if (refId) {
    const linked = await prisma.conversation.findUnique({
      where: { id: refId },
      select: { id: true, userId: true },
    });
    if (linked) {
      if (linked.userId !== waKey) {
        await prisma.conversation.update({
          where: { id: linked.id },
          data: { userId: waKey },
        });
      }
      log.info(
        { conversationId: linked.id, refId },
        "twilio.handoff_ref_matched",
      );
      return { conversation: { id: linked.id }, cleanBody, matchedRef: refId };
    }
    log.warn({ refId }, "twilio.handoff_ref_unknown");
  }

  // 2) Existing conversation for this WhatsApp identity, any channel
  // (covers ref-less follow-ups after the first ref'd message linked a
  // previously web-only conversation to this waKey).
  const existing = await prisma.conversation.findFirst({
    where: { userId: waKey },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (existing) {
    return { conversation: existing, cleanBody, matchedRef: undefined };
  }

  // 3) Brand new WhatsApp-only conversation.
  const created = await prisma.conversation.create({
    data: {
      userId: waKey,
      channel: WHATSAPP_CHANNEL,
      metadata: toJsonInput({
        waId: inbound.WaId,
        from: inbound.From,
        profileName: inbound.ProfileName,
      }),
    },
    select: { id: true },
  });
  return { conversation: created, cleanBody, matchedRef: undefined };
}

function toJsonInput(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}
