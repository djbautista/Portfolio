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
