import twilio from "twilio";

import { getApiEnv } from "#env";

// Standalone verification — does NOT go through the API. Two phases:
//   (A) accounts.fetch — proves SID + token are valid. Read-only, free.
//   (B) messages.create — only runs if TEST_TO_NUMBER is set. Sends one
//       real WhatsApp message (~$0.005) from your Sender to that number.
//
// Run:
//   pnpm --filter @portfolio/api verify:twilio                  # A only
//   TEST_TO_NUMBER=whatsapp:+14155550123 pnpm --filter @portfolio/api verify:twilio   # A + B

async function main(): Promise<void> {
  const env = getApiEnv();

  if (
    !env.TWILIO_ACCOUNT_SID ||
    !env.TWILIO_AUTH_TOKEN ||
    !env.TWILIO_WHATSAPP_NUMBER
  ) {
    throw new Error(
      "Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER",
    );
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  // ---- A: read-only account fetch ----
  console.log("[verify-twilio] (A) fetching account…");
  try {
    const account = await client.api.v2010
      .accounts(env.TWILIO_ACCOUNT_SID)
      .fetch();
    console.log("[verify-twilio] (A) ✓ account:", {
      friendlyName: account.friendlyName,
      status: account.status,
      type: account.type,
    });
  } catch (err) {
    const e = err as { status?: unknown; code?: unknown; message?: unknown };
    console.error("[verify-twilio] (A) ✗ creds rejected:", {
      status: e.status,
      code: e.code,
      message: e.message,
    });
    process.exit(1);
  }

  // ---- B: optional outbound test ----
  const to = process.env.TEST_TO_NUMBER;
  if (!to) {
    console.log(
      "[verify-twilio] (B) skipped — set TEST_TO_NUMBER=whatsapp:+E164 to send a real message",
    );
    return;
  }

  console.log(
    `[verify-twilio] (B) sending real WhatsApp from ${env.TWILIO_WHATSAPP_NUMBER} to ${to}…`,
  );
  try {
    const msg = await client.messages.create({
      from: env.TWILIO_WHATSAPP_NUMBER,
      to,
      body: "Hi from your portfolio API verify script — if you see this, Twilio creds + WhatsApp Sender are wired correctly.",
    });
    console.log("[verify-twilio] (B) ✓ sent:", {
      sid: msg.sid,
      status: msg.status,
      to: msg.to,
    });
  } catch (err) {
    const e = err as {
      status?: unknown;
      code?: unknown;
      message?: unknown;
      moreInfo?: unknown;
    };
    console.error("[verify-twilio] (B) ✗ send failed:", {
      status: e.status,
      code: e.code,
      message: e.message,
      moreInfo: e.moreInfo,
    });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[verify-twilio] fatal:", err);
  process.exit(1);
});
