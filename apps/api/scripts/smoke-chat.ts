import { ChatResponseSchema } from "@portfolio/contracts/chat";
import { ErrorResponseSchema } from "@portfolio/contracts/errors";

import { buildApp } from "#app";

// Boots the Fastify app via inject() (no real port binding) and exercises:
//   - happy-path /chat
//   - validation error path
//   - missing-conversation 404 path
//
// Mirrors the smoke:agent / smoke:retrieval pattern. Not a test suite —
// just a one-command "is this wired correctly" check.

async function main(): Promise<void> {
  const app = await buildApp();

  try {
    await happyPath(app);
    await validationError(app);
    await missingConversation(app);
    console.log("[smoke-chat] ✓ all checks passed");
  } finally {
    await app.close();
  }
}

async function happyPath(
  app: Awaited<ReturnType<typeof buildApp>>,
): Promise<void> {
  const res = await app.inject({
    method: "POST",
    url: "/chat",
    payload: { message: "What is David's technical stack?", channel: "web" },
  });

  if (res.statusCode !== 200) {
    throw new Error(
      `happy-path: expected 200, got ${res.statusCode}: ${res.body}`,
    );
  }
  const parsed = ChatResponseSchema.parse(JSON.parse(res.body));
  console.log("[smoke-chat] happy-path:", {
    conversationId: parsed.conversationId,
    traceId: parsed.traceId,
    confidence: parsed.confidence,
    shouldEscalate: parsed.shouldEscalate,
    sources: parsed.sources.length,
  });
}

async function validationError(
  app: Awaited<ReturnType<typeof buildApp>>,
): Promise<void> {
  const res = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {},
  });

  if (res.statusCode !== 400) {
    throw new Error(
      `validation: expected 400, got ${res.statusCode}: ${res.body}`,
    );
  }
  const parsed = ErrorResponseSchema.parse(JSON.parse(res.body));
  if (parsed.code !== "validation_error") {
    throw new Error(`validation: expected validation_error, got ${parsed.code}`);
  }
  console.log("[smoke-chat] validation-error: 400 validation_error ✓");
}

async function missingConversation(
  app: Awaited<ReturnType<typeof buildApp>>,
): Promise<void> {
  const res = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      message: "hello",
      channel: "web",
      conversationId: "does-not-exist-xyz",
    },
  });

  if (res.statusCode !== 404) {
    throw new Error(
      `missing-conversation: expected 404, got ${res.statusCode}: ${res.body}`,
    );
  }
  const parsed = ErrorResponseSchema.parse(JSON.parse(res.body));
  if (parsed.code !== "conversation_not_found") {
    throw new Error(
      `missing-conversation: expected conversation_not_found, got ${parsed.code}`,
    );
  }
  console.log("[smoke-chat] missing-conversation: 404 conversation_not_found ✓");
}

main().catch((err) => {
  console.error("[smoke-chat] failed:", err);
  process.exit(1);
});
