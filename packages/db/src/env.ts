import { z } from "zod";

// Split by responsibility so DB-only code never depends on embedding env.
// Accessors are lazy and cache after first call — never evaluated at
// import time.

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const embeddingEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  EMBEDDING_MODEL: z.string().min(1).default("text-embedding-3-small"),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type EmbeddingEnv = z.infer<typeof embeddingEnvSchema>;

let dbCache: DatabaseEnv | undefined;
let embedCache: EmbeddingEnv | undefined;

export function getDatabaseEnv(): DatabaseEnv {
  if (!dbCache) {
    dbCache = parseOrThrow(databaseEnvSchema, "database");
  }
  return dbCache;
}

export function getEmbeddingEnv(): EmbeddingEnv {
  if (!embedCache) {
    embedCache = parseOrThrow(embeddingEnvSchema, "embedding");
  }
  return embedCache;
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
      `Invalid ${label} environment for @portfolio/db: ${issues}`,
    );
  }
  return result.data;
}
