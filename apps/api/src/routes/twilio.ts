import { TwilioInboundMessageSchema } from "@portfolio/contracts/twilio";
import type { FastifyInstance } from "fastify";

import {
  TwilioNotConfiguredError,
  TwilioSignatureError,
  ValidationError,
} from "#errors";
import { processInboundWhatsApp } from "#services/whatsappService";
import {
  getTwilioConfig,
  verifyTwilioSignature,
} from "#services/twilioService";

// Twilio's webhook timeout is ~15s. We always reply 200 + empty TwiML
// immediately (no synchronous agent work) and process inbound messages in a
// deferred task. Outbound replies go through the Twilio REST API later.
const EMPTY_TWIML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response/>";

export async function registerTwilioRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.post("/webhooks/twilio/whatsapp", async (req, reply) => {
    const config = getTwilioConfig();
    if (!config) {
      throw new TwilioNotConfiguredError();
    }

    // Signature verification ALWAYS comes before body schema validation:
    // we don't want a forged caller to learn anything about the payload
    // shape from a more informative error.
    const signature = req.headers["x-twilio-signature"];
    const headerValue = Array.isArray(signature) ? signature[0] : signature;
    const params = (req.body ?? {}) as Record<string, unknown>;

    const valid = verifyTwilioSignature({
      authToken: config.authToken,
      signature: headerValue,
      url: config.webhookPublicUrl,
      params,
    });
    if (!valid) {
      throw new TwilioSignatureError();
    }

    const parsed = TwilioInboundMessageSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError(parsed.error);
    }
    const inbound = parsed.data;

    // Capture a child logger BEFORE replying so the deferred task survives
    // the request lifecycle with the right correlation fields.
    const childLog = req.log.child({
      MessageSid: inbound.MessageSid,
      route: "twilio.whatsapp",
    });

    // Reply 200 immediately. Empty TwiML tells Twilio "received, don't
    // synchronously send anything" — outbound reply is via REST API later.
    reply.type("application/xml").code(200).send(EMPTY_TWIML);

    setImmediate(() => {
      processInboundWhatsApp({ inbound, log: childLog }).catch((err) => {
        childLog.error({ err }, "twilio.process_failed");
      });
    });

    return reply;
  });
}
