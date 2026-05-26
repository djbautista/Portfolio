import { ChatResponseSchema } from "@portfolio/contracts/chat";
import { prisma } from "@portfolio/db";
import twilio from "twilio";

import { buildApp } from "#app";
import { getApiEnv } from "#env";

// Validates the web -> WhatsApp handoff:
//   1. Start a web conversation via /chat. Capture conversationId.
//   2. Forge a signed Twilio webhook POST whose Body contains
//      `(ref: <conversationId>)` and a NEW From number we've never seen.
//   3. Wait briefly for the deferred work, then assert the inbound landed
//      on the SAME conversation row (not a brand new one).
//
// Requires real-ish Twilio env so the signature math works. AUTH_TOKEN can
// be the live one (we never call Twilio's REST API in this script).

const ROUTE = "/webhooks/twilio/whatsapp";

async function main(): Promise<void> {
  const env = getApiEnv();
  if (!env.TWILIO_AUTH_TOKEN || !env.TWILIO_WEBHOOK_PUBLIC_URL) {
    throw new Error(
      "needs TWILIO_AUTH_TOKEN and TWILIO_WEBHOOK_PUBLIC_URL set",
    );
  }

  const app = await buildApp();
  try {
    // 1) Web chat -> conversationId
    const chatRes = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { message: "smoke handoff seed", channel: "web" },
    });
    if (chatRes.statusCode !== 200) {
      throw new Error(`seed /chat failed: ${chatRes.statusCode} ${chatRes.body}`);
    }
    const chat = ChatResponseSchema.parse(JSON.parse(chatRes.body));
    const seedConvoId = chat.conversationId;
    console.log("[smoke-handoff] seeded web conversation:", seedConvoId);

    // 2) Forge a signed WhatsApp inbound that references the seed
    const from = `whatsapp:+1555${Math.floor(Math.random() * 9000000 + 1000000)}`;
    const messageSid = `SMhandoff${Date.now()}`;
    const params: Record<string, string> = {
      MessageSid: messageSid,
      AccountSid: env.TWILIO_ACCOUNT_SID ?? "ACtest",
      From: from,
      To: env.TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+15557654321",
      Body: `Continue conversation (ref: ${seedConvoId}) — remind me what we just discussed and suggest where to go next.`,
    };
    const signature = twilio.getExpectedTwilioSignature(
      env.TWILIO_AUTH_TOKEN,
      env.TWILIO_WEBHOOK_PUBLIC_URL,
      params,
    );

    const hookRes = await app.inject({
      method: "POST",
      url: ROUTE,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-twilio-signature": signature,
      },
      payload: new URLSearchParams(params).toString(),
    });
    if (hookRes.statusCode !== 200) {
      throw new Error(
        `webhook failed: ${hookRes.statusCode} ${hookRes.body}`,
      );
    }
    console.log("[smoke-handoff] webhook 200 TwiML ✓");

    // 3) Wait for the deferred processing to settle, then check the DB.
    // The agent run touches OpenAI so 10s is generous but safe.
    await waitForMessage({
      conversationId: seedConvoId,
      providerMessageId: messageSid,
      timeoutMs: 15000,
    });

    // Conversation should now have userId set to the waKey (From without
    // the whatsapp: prefix). No NEW whatsapp conversation should exist
    // for this number.
    const expectedWaKey = from.replace(/^whatsapp:/i, "");
    const seed = await prisma.conversation.findUnique({
      where: { id: seedConvoId },
      select: { id: true, userId: true, channel: true, messages: true },
    });
    if (!seed) throw new Error("seed conversation vanished");
    if (seed.userId !== expectedWaKey) {
      throw new Error(
        `expected seed.userId=${expectedWaKey}, got ${seed.userId}`,
      );
    }
    console.log("[smoke-handoff] seed.userId linked to waKey ✓", {
      conversationId: seed.id,
      userId: seed.userId,
      channel: seed.channel,
      messageCount: seed.messages.length,
    });

    const strayWhatsappConvos = await prisma.conversation.count({
      where: { userId: expectedWaKey, NOT: { id: seedConvoId } },
    });
    if (strayWhatsappConvos !== 0) {
      throw new Error(
        `expected no stray whatsapp conversations for ${expectedWaKey}, got ${strayWhatsappConvos}`,
      );
    }
    console.log("[smoke-handoff] no duplicate conversation created ✓");

    // The user Message content should have the (ref: ...) marker stripped.
    const inbound = await prisma.message.findFirst({
      where: { providerMessageId: messageSid },
      select: { content: true, role: true },
    });
    if (!inbound) throw new Error("inbound message not persisted");
    if (inbound.role !== "user") {
      throw new Error(`expected role=user, got ${inbound.role}`);
    }
    if (/\(ref:/i.test(inbound.content)) {
      throw new Error(
        `expected ref marker stripped from content, got: ${inbound.content}`,
      );
    }
    console.log("[smoke-handoff] inbound content stripped of ref ✓", {
      content: inbound.content,
    });

    console.log("[smoke-handoff] ✓ all checks passed");
  } finally {
    await app.close();
  }
}

async function waitForMessage(args: {
  conversationId: string;
  providerMessageId: string;
  timeoutMs: number;
}): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < args.timeoutMs) {
    const m = await prisma.message.findFirst({
      where: {
        conversationId: args.conversationId,
        providerMessageId: args.providerMessageId,
      },
      select: { id: true },
    });
    if (m) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `timed out waiting for inbound on ${args.conversationId} (sid ${args.providerMessageId})`,
  );
}

main().catch((err) => {
  console.error("[smoke-handoff] failed:", err);
  process.exit(1);
});
