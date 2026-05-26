import { ErrorResponseSchema } from "@portfolio/contracts/errors";
import twilio from "twilio";

import { buildApp } from "#app";
import { getApiEnv } from "#env";

// Proves the Twilio webhook wiring without hitting the real Twilio API:
//   - form-body parser is registered (req.body parses, not undefined)
//   - missing creds path returns 503 twilio_not_configured (when unset)
//   - signature verification rejects forged requests (403)
//   - signed requests reach the handler and get a 200 + empty TwiML
//
// Does NOT exercise the deferred agent run — that requires a live OPENAI key
// and DB; covered by smoke:chat instead.

const ROUTE = "/webhooks/twilio/whatsapp";

async function main(): Promise<void> {
  const env = getApiEnv();
  const app = await buildApp();

  try {
    if (
      !env.TWILIO_ACCOUNT_SID ||
      !env.TWILIO_AUTH_TOKEN ||
      !env.TWILIO_WEBHOOK_PUBLIC_URL ||
      !env.TWILIO_WHATSAPP_NUMBER
    ) {
      await unconfigured(app);
      console.log(
        "[smoke-twilio] ✓ unconfigured path (set TWILIO_* env vars for full coverage)",
      );
      return;
    }

    await invalidSignature(app);
    await validSignature(app, env.TWILIO_AUTH_TOKEN, env.TWILIO_WEBHOOK_PUBLIC_URL);
    console.log("[smoke-twilio] ✓ all checks passed");
  } finally {
    await app.close();
  }
}

async function unconfigured(
  app: Awaited<ReturnType<typeof buildApp>>,
): Promise<void> {
  const res = await app.inject({
    method: "POST",
    url: ROUTE,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    payload: "MessageSid=SMtest",
  });
  if (res.statusCode !== 503) {
    throw new Error(
      `unconfigured: expected 503, got ${res.statusCode}: ${res.body}`,
    );
  }
  const parsed = ErrorResponseSchema.parse(JSON.parse(res.body));
  if (parsed.code !== "twilio_not_configured") {
    throw new Error(
      `unconfigured: expected twilio_not_configured, got ${parsed.code}`,
    );
  }
}

async function invalidSignature(
  app: Awaited<ReturnType<typeof buildApp>>,
): Promise<void> {
  const res = await app.inject({
    method: "POST",
    url: ROUTE,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-twilio-signature": "definitely-not-valid",
    },
    payload: "MessageSid=SMtest&AccountSid=ACtest&From=whatsapp:%2B15551234567&To=whatsapp:%2B15557654321&Body=hello",
  });
  if (res.statusCode !== 403) {
    throw new Error(
      `invalid-signature: expected 403, got ${res.statusCode}: ${res.body}`,
    );
  }
  const parsed = ErrorResponseSchema.parse(JSON.parse(res.body));
  if (parsed.code !== "twilio_signature_invalid") {
    throw new Error(
      `invalid-signature: expected twilio_signature_invalid, got ${parsed.code}`,
    );
  }
  console.log("[smoke-twilio] invalid-signature: 403 twilio_signature_invalid ✓");
}

async function validSignature(
  app: Awaited<ReturnType<typeof buildApp>>,
  authToken: string,
  url: string,
): Promise<void> {
  const params: Record<string, string> = {
    MessageSid: `SMsmoke${Date.now()}`,
    AccountSid: "ACsmoketest",
    From: "whatsapp:+15551234567",
    To: "whatsapp:+15557654321",
    Body: "smoke test ping",
  };
  // Use Twilio's own helper to compute the signature so we exercise the
  // exact code path verifyTwilioSignature uses on the receive side.
  const signature = twilio.getExpectedTwilioSignature(authToken, url, params);

  const body = new URLSearchParams(params).toString();
  const res = await app.inject({
    method: "POST",
    url: ROUTE,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-twilio-signature": signature,
    },
    payload: body,
  });
  if (res.statusCode !== 200) {
    throw new Error(
      `valid-signature: expected 200, got ${res.statusCode}: ${res.body}`,
    );
  }
  if (!res.body.includes("<Response")) {
    throw new Error(`valid-signature: expected TwiML body, got: ${res.body}`);
  }
  console.log("[smoke-twilio] valid-signature: 200 TwiML ✓");
}

main().catch((err) => {
  console.error("[smoke-twilio] failed:", err);
  process.exit(1);
});
