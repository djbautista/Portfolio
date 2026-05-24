import { z } from "zod";

// Lazy, cached chat-env accessor. Mirrors getDatabaseEnv / getEmbeddingEnv
// in @portfolio/db so chat env is never evaluated at import time.

const chatEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  CHAT_MODEL: z.string().min(1).default("gpt-4o-mini"),
  CHAT_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  CHAT_MAX_TOKENS: z.coerce.number().int().positive().default(1024),
});

export type ChatEnv = z.infer<typeof chatEnvSchema>;

let chatCache: ChatEnv | undefined;

export function getChatEnv(): ChatEnv {
  if (!chatCache) {
    chatCache = parseOrThrow(chatEnvSchema, "chat");
  }
  return chatCache;
}

function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(
      `Invalid ${label} environment for @portfolio/agent: ${issues}`,
    );
  }
  return result.data;
}
