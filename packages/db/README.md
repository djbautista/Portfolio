# `@portfolio/db`

Prisma 7 + Postgres + pgvector data layer for the portfolio AI assistant.
Hosts the singleton `prisma` client, the schema/migrations, and the
knowledge ingestion and retrieval primitives consumed by the future
`packages/agent` and `apps/api`.

The package is consumed as TypeScript source (`main` and `types` point at
`src/index.ts`) — there is no compiled `dist/` and no `build` script.

## Environment

All env vars live in the **repo-root `.env.example`** — there is no
package-level `.env*` file. From the repo root:

```bash
cp .env.example .env
# then paste your real OPENAI_API_KEY into .env
```

| Variable | Required for | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | every DB-touching command | — | Built from the `POSTGRES_*` vars by interpolation in `.env.example`; matches the docker-compose service. |
| `OPENAI_API_KEY` | `seed:knowledge`, `smoke:retrieval`, any embedding flow | — | Validated by `getEmbeddingEnv()` only; DB-only commands (`db:migrate`, `db:studio`, `db:generate`) do **not** require it. |
| `EMBEDDING_MODEL` | embedding flows | `text-embedding-3-small` | Must produce vectors that match `EMBEDDING_DIMENSIONS`. |
| `EMBEDDING_DIMENSIONS` | embedding flows | `1536` | Must match the `vector(N)` column. Changing it is a schema migration **and** a full re-embed. |

### How env is loaded

- **`prisma.config.ts`** loads the root `.env` via
  `dotenv.config({ path: resolve(import.meta.dirname, "../../.env") })`.
  Prisma CLI has no `--env-file` flag, so we resolve the path explicitly
  and never depend on CWD.
- **`tsx` scripts (`seed:knowledge`, `smoke:retrieval`)** use Node's
  native `--env-file=../../.env` flag. No `dotenv` import in the script
  entry points.
- **Runtime code** never touches `process.env` directly. It calls the
  split, Zod-validated accessors in `src/env.ts`:
  - `getDatabaseEnv()` — `DATABASE_URL` only. Used by the Prisma client
    in `src/index.ts`.
  - `getEmbeddingEnv()` — `OPENAI_API_KEY` + embedding model/dimensions.
    Used by the OpenAI provider.

  Both accessors are lazy and cached; either throws a Zod field-level
  error at first call if something is missing or malformed.

### Production

- `.env*` files are local-only and never deployed.
- In production, ECS task definitions (or EKS Pod manifests via
  `envFrom` / `secretKeyRef`) inject the same variable names into
  `process.env`, sourced from AWS Secrets Manager / SSM Parameter Store.
- `DATABASE_URL` points at RDS / Aurora PostgreSQL with the `vector`
  extension enabled in the cluster.
- Runtime code paths are identical across local, staging, and prod —
  `getDatabaseEnv()` and `getEmbeddingEnv()` validate whatever
  `process.env` carries.

## Local Postgres

The repo root ships a `docker-compose.yml` that runs
`pgvector/pgvector:pg17` and bootstraps the `vector` extension. From the
repo root:

```bash
docker compose up -d
```

## Commands

Run from anywhere via the workspace filter.

```bash
# After cloning, or after schema/generator changes:
pnpm --filter @portfolio/db db:generate

# Apply migrations to the local database:
pnpm --filter @portfolio/db db:migrate

# Open Prisma Studio:
pnpm --filter @portfolio/db db:studio

# Type-check:
pnpm --filter @portfolio/db check-types

# Seed the knowledge base (idempotent — re-runs skip unchanged docs):
pnpm --filter @portfolio/db seed:knowledge

# Smoke-test retrieval:
pnpm --filter @portfolio/db smoke:retrieval
```

## Why raw SQL for vector columns

`DocumentChunk.embedding` is declared as `Unsupported("vector(1536)")?`.
Prisma's typed client cannot bind or project that column, so vector
inserts and similarity queries are written as parameterized raw SQL via
`prisma.$executeRaw` / `prisma.$queryRaw`. We use the `pgvector` npm
package's `toSql(array)` helper to format the value, then cast it to
`vector(1536)` in SQL:

```sql
INSERT INTO "DocumentChunk" (..., "embedding", ...)
VALUES (..., $N::vector(1536), ...)
```

Similarity search uses pgvector's cosine-distance operator `<=>`. We
report similarity as `1 - distance` and rely on the partial HNSW index
defined in the initial migration:

```sql
SELECT 1 - (c."embedding" <=> $1::vector(1536)) AS score
  FROM "DocumentChunk" c
  JOIN "Document" d ON d."id" = c."documentId"
 WHERE d."isActive" = true
   AND c."embedding" IS NOT NULL
 ORDER BY c."embedding" <=> $1::vector(1536) ASC
 LIMIT $K
```

## Layout

```
src/
  index.ts                  -- singleton prisma client + re-exports
  env.ts                    -- getDatabaseEnv() / getEmbeddingEnv() (Zod, lazy)
  embeddings/
    types.ts                -- EmbeddingProvider interface
    openai.ts               -- OpenAI implementation (lazy client, batching, validation)
    index.ts                -- getEmbeddingProvider() factory
  knowledge/
    documents.ts            -- computeContentHash, upsertDocument (idempotent)
    chunking.ts             -- pure chunkText() with paragraph-aware splits
    chunks.ts               -- replaceDocumentChunks() inside prisma.$transaction
    retrieve.ts             -- retrieveChunks() with Zod-validated output
scripts/
  seed-knowledge-data.ts    -- real portfolio content + clearly labeled dev fixtures
  seed-knowledge.ts         -- ingestion runner
  smoke-retrieval.ts        -- end-to-end retrieval sanity check
prisma/
  schema.prisma             -- models, including DocumentChunk.embedding vector(1536)
  migrations/               -- includes pgvector extension + HNSW cosine index
```

## Changing the embedding dimension

Updating `EMBEDDING_DIMENSIONS` to anything other than 1536 requires:

1. Editing the `Unsupported("vector(N)")` declaration in
   `prisma/schema.prisma`.
2. Writing a migration that alters the column type and re-creates the
   HNSW index (cosine distance ops are dimension-specific).
3. Re-running `seed:knowledge` so every stored chunk is re-embedded.

Do not switch models without doing all three.
