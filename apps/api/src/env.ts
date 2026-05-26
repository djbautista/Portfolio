import { z } from "zod";

// Lazy + cached, validated on first call. Mirrors the env pattern in
// packages/db/src/env.ts. The API package intentionally does not validate
// DATABASE_URL or OPENAI_API_KEY — those belong to @portfolio/db and
// @portfolio/agent respectively.

const apiEnvSchema = z.object({
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_CORS_ORIGINS: z.string().optional(),

  // Twilio WhatsApp integration. All four must be set for the
  // /webhooks/twilio/whatsapp route to do real work; otherwise the route is
  // still mounted but returns 503 (twilio_not_configured). Keep optional so
  // the API still boots cleanly in preview/dev environments without Twilio.
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  // The REST-API sender, formatted exactly as `whatsapp:+E164`.
  TWILIO_WHATSAPP_NUMBER: z
    .string()
    .regex(
      /^whatsapp:\+\d{6,15}$/,
      "TWILIO_WHATSAPP_NUMBER must be in the form 'whatsapp:+<E164>'",
    )
    .optional(),
  // Must EXACTLY match the URL configured in the Twilio Console (scheme,
  // host, path). Twilio signs the request URL it called — derive nothing
  // from req.url/headers (LBs and proxies mangle them).
  TWILIO_WEBHOOK_PUBLIC_URL: z
    .string()
    .url()
    .refine(
      (u) => !u.endsWith("/"),
      "TWILIO_WEBHOOK_PUBLIC_URL must not end with a trailing slash",
    )
    .optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

let cache: ApiEnv | undefined;

export function getApiEnv(): ApiEnv {
  if (!cache) {
    const result = apiEnvSchema.safeParse(process.env);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new Error(
        `Invalid API environment for @portfolio/api: ${issues}`,
      );
    }
    cache = result.data;
  }
  return cache;
}

export function parseCorsOrigins(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : undefined;
}
