We already have the initial Prisma/Postgres/pgvector data model and migration in place.

Build the next vertical foundation: knowledge ingestion and retrieval.

## Goal

Create the minimal infrastructure needed to seed portfolio knowledge into the
database, split it into chunks, generate embeddings, store those embeddings in
`DocumentChunk`, and retrieve relevant chunks through pgvector similarity
search.

## Scope

Work only on the database/knowledge foundation.

- Do not build API routes.
- Do not build frontend.
- Do not build LangGraph agent logic.
- Do not build Twilio handlers.
- Do not add Kubernetes/AWS deployment code.
- Do not add the deferred models yet (`DocumentSource`,
  `KnowledgeIngestionJob`, `EvaluationRun`, `EvaluationResult`).
- Do not add a queue, worker, MMR/reranker, or embedding cache yet.

## Existing architecture you must align with

The repo is a pnpm + Turborepo monorepo (Next 16 / React 19 / Tailwind v4).
Relevant facts you must respect — read these files before writing code:

- `packages/db/prisma/schema.prisma` — current models: `Conversation`,
  `Message`, `Document`, `DocumentChunk`, `AgentTrace`, `AgentStep`,
  `RetrievedContext`, `ChannelEvent`.
- `packages/db/prisma/migrations/20260524004058_init/migration.sql` — enables
  the `vector` extension and creates a partial HNSW index on
  `DocumentChunk.embedding` using `vector_cosine_ops` (only where
  `embedding IS NOT NULL`).
- `packages/db/src/index.ts` — exports a singleton `prisma` built on the
  Prisma 7 `PrismaPg` adapter, plus re-exports the generated client.
  **All new code must import this `prisma` instance — do not instantiate a
  new `PrismaClient`.**
- `packages/db/prisma.config.ts` — Prisma 7 config; loads `dotenv/config`.
- `packages/db/package.json` — ESM (`"type": "module"`), main/types point
  directly at `./src/index.ts` (there is no compiled `dist/`), uses `tsx`
  for scripts and depends on `dotenv`.
- `packages/db/src/generated/prisma/client.js` — generated client output
  location; imports use the `.js` extension because of NodeNext ESM.
- `packages/contracts/src/{common,channel,twilio}.ts` and
  `packages/contracts/package.json` — Zod schemas + inferred TS types
  pattern used elsewhere. The `.` and `./twilio` subpath exports show the
  convention for adding new public entrypoints.
- `docs/architecture.md` — explains the contract / db / agent / api split.
- `packages/typescript-config/base.json` — `strict: true`,
  `noUncheckedIndexedAccess: true`, `module: "NodeNext"`, `target: "ES2022"`.
  Indexed access returns `T | undefined`; handle it.

`DocumentChunk.embedding` is `Unsupported("vector(1536)")?`, which is why raw
SQL is required for vector reads/writes — Prisma cannot bind or project that
column through the typed client.

## Architectural constraints (non-negotiable)

- Default embedding model: `text-embedding-3-small` (1536 dims, matches the
  schema). Model name and dimension must be configurable via env vars; the
  implementation must throw a clear error if a returned vector's length does
  not match the configured dimension.
- Keep provider-specific embedding code behind a small abstraction so the
  provider (OpenAI today, Anthropic / Voyage / Cohere later) can be swapped
  without touching ingestion or retrieval call sites.
- API keys come from environment variables. No secrets in code or git.
- Do not call embeddings, the OpenAI client, or Prisma at module load —
  only inside explicit functions/scripts. Provider clients must be lazy.
- Prefer parameterized raw SQL via `Prisma.sql` / `prisma.$queryRaw` /
  `prisma.$executeRaw` for any column touching `vector(1536)`. Never build
  SQL by string concatenation with user-supplied values.
- Reuse the singleton `prisma` from `@portfolio/db`. Do not new up a client.
- Shared cross-package types (knowledge inputs, retrieved chunk shape) live
  in `@portfolio/contracts` as Zod schemas + inferred TS types — same pattern
  as `channel.ts`. The agent and api packages will consume them later.
- Internal db-package implementation types stay inside `packages/db/src`.
- Do not redesign the existing schema. If you genuinely believe a schema
  change is required, stop and explain why before making it.

## Required capabilities

### 1. Shared contracts (`packages/contracts`)

Add `packages/contracts/src/knowledge.ts` with Zod schemas and inferred
types for the cross-package surface only:

- `KnowledgeSourceTypeSchema` — `z.enum([...])` of the source types used by
  the seed (e.g. `"profile"`, `"project"`, `"experience"`, `"skills"`,
  `"writing"`). Keep this list small and obvious; it can grow later.
- `KnowledgeDocumentInputSchema` — `{ title, sourceType, sourceUri?,
  content, metadata? }` with `NonEmptyStringSchema` where appropriate.
- `RetrievedChunkSchema` — `{ documentId, chunkId, title, content,
  sourceType, score, rank }` (`score` is cosine similarity in `[0, 1]`,
  `rank` is 1-indexed).
- `RetrievalQuerySchema` — `{ query, topK?, sourceType?, minSimilarity? }`
  with sensible bounds (`topK` int 1..50 default 5,
  `minSimilarity` 0..1 optional).

Export these from `packages/contracts/src/index.ts` and also as a subpath
`./knowledge` in `packages/contracts/package.json` exports (mirror the
`./twilio` entry).

### 2. Knowledge document upsert (`packages/db`)

Add `packages/db/src/knowledge/documents.ts`:

- `computeContentHash(content: string): string` — SHA-256 hex of the
  normalized content (e.g. trim + collapse trailing whitespace). Use
  `node:crypto`; do not pull in a hashing dependency.
- `upsertDocument(input: KnowledgeDocumentInput): Promise<{ document,
  changed: boolean }>` — looks up by `(sourceType, sourceUri)` if
  `sourceUri` is present, else by `(sourceType, title)`. Returns
  `changed: false` when the row exists and `contentHash` is unchanged so
  callers can skip re-chunking and re-embedding.

Do not silently swallow Prisma errors.

### 3. Chunking (`packages/db`)

Add `packages/db/src/knowledge/chunking.ts`:

- A single function `chunkText(content, opts?)` returning
  `Array<{ chunkIndex, content, tokenCount }>`.
- Defaults: target ~1500 chars (~375 tokens) per chunk, ~150 char overlap.
  Make these overridable via opts.
- Split preference order: paragraph boundary (`\n\n`) → line (`\n`) →
  sentence (`. `) → hard cut. Keep it short and readable; no semantic
  chunking, no tokenizer dependency.
- Trim each chunk; skip empty or whitespace-only output.
- `chunkIndex` is sequential starting at 0. Estimate `tokenCount` as
  `Math.ceil(content.length / 4)` (documented heuristic, not exact).
- Pure function — no I/O, no globals, deterministic.

### 4. Embedding provider abstraction (`packages/db`)

Add `packages/db/src/embeddings/`:

- `types.ts` — `EmbeddingProvider` interface:
  ```ts
  interface EmbeddingProvider {
    readonly model: string;
    readonly dimensions: number;
    embed(texts: string[], signal?: AbortSignal): Promise<number[][]>;
  }
  ```
- `openai.ts` — `createOpenAIEmbeddingProvider({ apiKey?, model?,
  dimensions? })`. Uses the official `openai` SDK (add as a dependency
  to `packages/db`). Reads `OPENAI_API_KEY`, `EMBEDDING_MODEL`
  (default `text-embedding-3-small`), and `EMBEDDING_DIMENSIONS`
  (default `1536`) from env when not provided. Throws a clear error
  if `OPENAI_API_KEY` is missing the first time `embed()` is called.
- `index.ts` — exports a `getEmbeddingProvider()` factory that returns
  the configured provider singleton (lazy; OpenAI today).

Requirements:

- Batch inputs in a single API call when possible; if the OpenAI batch
  size cap is hit, chunk the request and concatenate results in order.
- Validate every returned vector has exactly `dimensions` numbers;
  throw on mismatch (with the offending index).
- Set a reasonable request timeout via `AbortSignal`.
- No retries with hidden backoff — fail fast; we'll add retry policy
  when we wire the ingestion job model.

### 5. Persist chunks with embeddings (`packages/db`)

Add `packages/db/src/knowledge/chunks.ts`:

- `replaceDocumentChunks(documentId, chunks, embeddings)` — runs inside
  a Prisma transaction:
  1. `DELETE FROM "DocumentChunk" WHERE "documentId" = $1`
  2. Insert each chunk via raw SQL, binding the embedding as a
     `vector(1536)` literal. Format: build the string
     `'[v1,v2,...,vN]'` and cast `$N::vector(1536)` in the query
     (`Prisma.sql` parameterization). Optionally use the `pgvector`
     npm package's `toSql()` helper if you add the dep; otherwise
     hand-roll the literal with strict `Number.isFinite` validation.
  3. Update `Document.updatedAt`/`contentHash` if not already handled
     by the upsert step.
- Insert in a single multi-row statement when feasible, otherwise loop;
  prefer clarity over micro-optimization.
- Reject any embedding whose length is not 1536 before issuing SQL.

### 6. Similarity retrieval (`packages/db`)

Add `packages/db/src/knowledge/retrieve.ts`:

- `retrieveChunks(input: RetrievalQuery & { embedding?: number[] }):
  Promise<RetrievedChunk[]>`.
- If `embedding` is not provided, embed `query` via
  `getEmbeddingProvider()`.
- Raw SQL pattern:
  ```sql
  SELECT c."id" AS "chunkId",
         c."documentId",
         c."title",
         c."content",
         d."sourceType",
         1 - (c."embedding" <=> $1::vector(1536)) AS "score"
    FROM "DocumentChunk" c
    JOIN "Document" d ON d."id" = c."documentId"
   WHERE d."isActive" = true
     AND c."embedding" IS NOT NULL
     AND ($2::text IS NULL OR d."sourceType" = $2)
     AND ($3::float8 IS NULL OR 1 - (c."embedding" <=> $1::vector(1536)) >= $3)
   ORDER BY c."embedding" <=> $1::vector(1536) ASC
   LIMIT $4;
  ```
- Assign `rank` (1-indexed) in JS from the result order.
- Return values must conform to `RetrievedChunkSchema` (parse with Zod
  before returning so contract drift is caught immediately).

### 7. Seed script (`packages/db`)

Add `packages/db/scripts/seed-knowledge.ts` and a sibling
`packages/db/scripts/seed-knowledge-data.ts` holding the placeholder
content as an exported array, so the content is easy to edit without
touching the runner.

Required placeholder source types (realistic but obviously placeholder):

- professional summary
- technical skills
- AI engineering positioning
- selected projects (2–3 distinct entries)
- leadership / architecture experience

Runner behavior:

- `import "dotenv/config"` at the top.
- For each document: `upsertDocument` → if `changed === false` and chunks
  already exist, skip; otherwise `chunkText` → batch-embed all chunks for
  that doc in one call → `replaceDocumentChunks`.
- Print one structured summary line per document
  (`{ title, status: "inserted" | "updated" | "skipped", chunks, ms }`)
  and a final totals line. No emojis.
- Exit non-zero on any failure.

### 8. Smoke test script (`packages/db`)

Add `packages/db/scripts/smoke-retrieval.ts`:

- `import "dotenv/config"`.
- Run a hard-coded query such as
  `"What kind of AI systems has David built?"`.
- Print the top retrieved chunks with `{ rank, score, title,
  sourceType, content (truncated to ~200 chars) }`.
- Does not require the API server. Exit non-zero on error.

### 9. Package scripts

Update `packages/db/package.json` scripts, preserving the existing ones
(`check-types`, `db:generate`, `db:migrate`, `db:studio`):

- `"seed:knowledge": "tsx scripts/seed-knowledge.ts"`
- `"smoke:retrieval": "tsx scripts/smoke-retrieval.ts"`

Add new dependencies:

- `openai` (latest) — runtime dep of `packages/db`.
- `@portfolio/contracts: workspace:*` — runtime dep of `packages/db`
  (consumed by knowledge/retrieve.ts for response validation).
- `zod` — only if you find you need it directly inside `packages/db`;
  prefer re-exporting via `@portfolio/contracts`.

Note: there is **no** `build` script in `packages/db` (the package is
consumed as TS source). Do not add one.

### 10. Documentation

Add or update `packages/db/README.md` covering:

- `DATABASE_URL` and how docker-compose provides it locally.
- `OPENAI_API_KEY`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`.
- `pnpm --filter @portfolio/db db:generate` after schema or generator
  changes.
- `pnpm --filter @portfolio/db db:migrate` to apply migrations.
- `pnpm --filter @portfolio/db seed:knowledge`.
- `pnpm --filter @portfolio/db smoke:retrieval`.
- Why raw SQL is used for vector writes/reads (the
  `Unsupported("vector(1536)")` constraint), and the cosine-distance
  convention (`<=>` operator, similarity = `1 - distance`).
- Note that changing `EMBEDDING_DIMENSIONS` requires a schema migration
  to the `vector(N)` column and re-embedding all chunks.

If a `.env.example` does not already exist at the repo root or in
`packages/db`, add one in `packages/db` listing the required vars
(values left blank).

## Quality requirements

- Clean and modular: small files, single responsibility, no leaky
  abstractions across the contracts/db boundary.
- No `any`; prefer explicit types or `unknown`. Honor
  `noUncheckedIndexedAccess` — index access returns `T | undefined`.
- ESM imports use `.js` extensions (NodeNext) — including imports of
  generated Prisma output and intra-package files.
- No new dependencies beyond `openai` (and optionally `pgvector`).
- Surface real error messages — missing env vars, dimension mismatch,
  network failures, transaction failures. Never swallow.
- Do not add a queue, worker, API route, LangGraph node, or Twilio
  integration in this slice.
- Do not add deferred models.
- Do not introduce a test framework — the smoke script is the manual
  verification path for now.

## Acceptance criteria

- `pnpm --filter @portfolio/contracts check-types` passes.
- `pnpm --filter @portfolio/db check-types` passes.
- `pnpm --filter @portfolio/db db:generate` still passes.
- `pnpm --filter @portfolio/db seed:knowledge` seeds portfolio
  documents and chunks against a local Postgres+pgvector started via
  the existing `docker-compose.yml`, and is idempotent on re-run.
- `pnpm --filter @portfolio/db smoke:retrieval` returns relevant
  chunks ranked by cosine similarity.
- `RetrievedChunkSchema.parse(...)` succeeds on every result returned
  by `retrieveChunks`.
- The implementation is ready to be consumed by the future
  `packages/agent` and `apps/api` without changes to public shapes.

## After implementation

1. List every file created or modified, grouped by package.
2. Summarize the ingestion flow (upsert → chunk → embed → store) and
   the retrieval flow (embed query → cosine search → rank → contract
   parse) in a few lines each.
3. Explain exactly how vector writes and vector search are handled
   given Prisma's `Unsupported("vector(1536)")` — show the SQL shape
   used for inserts and for the similarity query.
4. Call out any deviations from this prompt and why.
5. Stop. Do not proceed to LangGraph, API, frontend, or Twilio until
   I approve.
