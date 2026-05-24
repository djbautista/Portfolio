# Knowledge Pipeline — For Dummies

A walkthrough of how the 8 files that make up the portfolio's knowledge ingestion + retrieval system work, written for someone with zero context.

## The big picture (read this first)

The user-facing goal: a chatbot on the portfolio that can answer questions like "What's David's stack?" using only facts from the portfolio's own content — no hallucinations.

The technique is **RAG (Retrieval-Augmented Generation)**. Two phases:

1. **Ingest (one-time, ahead of time):** Take everything we want the bot to know, break it into bite-sized pieces, and store each piece in a database alongside a "meaning fingerprint" called an **embedding** (a list of 1536 numbers).
2. **Retrieve (at query time):** When a user asks a question, fingerprint the question the same way and ask the database "give me the chunks whose fingerprints are closest to this one." Those chunks become context for the LLM.

The 8 files split cleanly into those two phases. Here's the flow:

```
[seed-knowledge-data.ts]   ← the raw text to ingest
        ↓
[seed-knowledge.ts]        ← the orchestrator script
        ↓
   for each document:
        ├→ [documents.ts]   upsert a Document row (skip if unchanged)
        ├→ [chunking.ts]    split big text into ~1500-char overlapping chunks
        ├→ [openai.ts]      turn each chunk into a 1536-number vector
        └→ [chunks.ts]      write chunks + vectors into DocumentChunk table

Then, at query time:
[smoke-retrieval.ts]       ← "what does retrieval look like?" sanity test
        ↓
[retrieve.ts]              ← embed the question, find nearest chunks
```

Now each file, in the order it gets touched.

---

## 1. `seed-knowledge-data.ts` — the source material

This file just **builds the list of documents** to feed into the database. Nothing fancy, no DB calls.

- Pulls real content (bio paragraphs, projects, contact info) from the shared `@portfolio/content` package — same source the website renders from.
- Reshapes each piece into a `KnowledgeDocumentInput`: `{ title, sourceType, sourceUri, content, metadata }`.
- Tags everything with `metadata.source = "existing_portfolio"` (real) or `"dev_fixture"` (placeholder). That tag is what lets the seeder later say "this row is mine, safe to delete."
- Exports `allSeedDocuments` — the array the seeder loops over.

Think of this as the **shopping list**. It says "here are 7 documents that should exist in the DB."

---

## 2. `seed-knowledge.ts` — the orchestrator

This is the script you'd run (`pnpm seed-knowledge` or similar) to populate the DB. For each document in the shopping list, it:

1. **Upsert the document row** (`upsertDocument`, file #4) — returns `{ changed, created }`.
2. **If nothing changed AND chunks already exist → skip.** This is the cheap path — no OpenAI calls, no rewrites.
3. **Otherwise, chunk the text** (`chunkText`, file #3).
4. **Call OpenAI to embed all chunks at once** (`provider.embed`, file #5).
5. **Replace the chunks in the DB** (`replaceDocumentChunks`, file #6).
6. After the loop, **prune stale seed-managed rows** — any document with `metadata.source` in `["existing_portfolio", "dev_fixture"]` that's no longer in the shopping list gets deleted. Production rows lacking that tag are never touched.
7. Print per-document status (`inserted | updated | skipped`) and totals.

The whole thing is **idempotent**: run it 100 times in a row, you'll only pay for OpenAI on the first run (or after content changes).

---

## 3. `packages/db/src/knowledge/chunking.ts` — split text into bites

LLMs and embedding models work better on **smaller, focused passages** than on giant walls of text. Also, OpenAI's embedding has input limits.

`chunkText(content)`:

- Normalizes line endings, trims.
- If the whole text is ≤ 1500 chars, returns it as a single chunk.
- Otherwise, walks the text in 1500-char windows with **150 chars of overlap** between consecutive chunks. The overlap means if a sentence straddles a boundary, both chunks still contain enough surrounding context for retrieval to find it.
- Tries to **break at a paragraph (`\n\n`), then a newline, then a sentence end** instead of mid-word. Only allowed if the break is past the halfway point (otherwise chunks become uselessly tiny).
- `tokenCount` is a rough estimate: `chars / 4`. Good enough for stats; not used for billing.

Output: an array of `{ chunkIndex, content, tokenCount }`.

---

## 4. `packages/db/src/knowledge/documents.ts` — upsert + change detection

`computeContentHash(content)`: SHA-256 of the trimmed, slightly-normalized text. This is the **"has it changed?" key**.

`upsertDocument(input)`:

- Looks up an existing `Document` row by `(sourceType, sourceUri)` — or `(sourceType, title)` if there's no URI.
- If found and `contentHash` matches → return `{ changed: false, created: false }`. The seeder uses this to skip re-embedding.
- If found but hash differs → update the row's metadata + hash, return `{ changed: true, created: false }`.
- If not found → create a new row, return `{ changed: true, created: true }`.

This file is the **brain that decides whether OpenAI needs to be called at all** for a given document.

---

## 5. `packages/db/src/embeddings/openai.ts` — text → 1536 numbers

`createOpenAIEmbeddingProvider()` returns a provider with one important method: `embed(texts: string[]): number[][]`.

What "embedding" means: OpenAI's model takes a string and returns a fixed-length vector (here, 1536 floats) that represents the **meaning** of that string. Two strings about similar things will have vectors close together in 1536-dimensional space. That's the whole magic of RAG.

Implementation details:

- **Batching:** OpenAI accepts up to 2048 inputs per request. The provider slices `texts` into batches of 2048 and concatenates results in order.
- **Lazy client init:** the OpenAI SDK isn't constructed until the first `embed()` call, so importing this file doesn't require `OPENAI_API_KEY` to be set.
- **Retries + timeout:** SDK auto-retries 3× on 429/5xx with exponential backoff; each request times out at 30s.
- **Validates:** if OpenAI returns a different count or a vector of the wrong size, it throws. Catches API drift early.

---

## 6. `packages/db/src/knowledge/chunks.ts` — write chunks + vectors to the DB

`replaceDocumentChunks(documentId, chunks, embeddings)`:

1. **Validate** chunk-count vs embedding-count match and every embedding has exactly 1536 finite numbers. Bad data is rejected before any SQL runs.
2. In a **transaction**:
   - `DELETE FROM DocumentChunk WHERE documentId = ?` — wipe the old chunks for this doc.
   - For each new chunk, `INSERT` it with its embedding.
3. The embedding is converted to pgvector's literal syntax via `pgvector.toSql(embedding)` and cast to `vector(1536)` in Postgres.

The "delete-then-insert" pattern (instead of trying to diff chunks) is **simple and correct**: any change to a document fully refreshes its chunks. The transaction ensures readers never see a half-replaced state.

---

## 7. `packages/db/src/knowledge/retrieve.ts` — the query side

`retrieveChunks({ query, topK, sourceType?, minSimilarity? })`:

1. **Validate input** via the Zod schema `RetrievalQuerySchema`.
2. **Embed the query string** the same way ingestion embedded chunks (this is the symmetry that makes RAG work — same model, same dimensions).
3. **Run a raw SQL `$queryRaw`** that:
   - Joins `DocumentChunk` to `Document`.
   - Filters to active docs with non-null embeddings, optional `sourceType` filter, optional similarity floor.
   - **`<=>`** is pgvector's **cosine distance operator** (0 = identical, 2 = opposite). `1 - distance` gives us a **similarity score** in `[0, 1]`-ish, which we clamp.
   - **Orders by distance ascending** (= most similar first), limits to `topK`.
4. Parses every row through `RetrievedChunkSchema` (Zod again) and adds a `rank`.

This is the function the chat backend will call to get context for the LLM.

---

## 8. `packages/db/scripts/smoke-retrieval.ts` — "does retrieval work?"

A tiny standalone script. Hardcodes `query = "What is David's stack?"`, calls `retrieveChunks` with `topK = 5`, prints the top 5 hits as JSON lines (rank, score, sourceType, title, content preview).

Exits with code 1 if nothing came back. That makes it usable as a **CI/local sanity check after seeding**: if this script prints zero results, something in the pipeline is broken.

---

## TL;DR mental model

- **Documents** = the raw passages of text we want the bot to know.
- **Chunks** = the small pieces a document was sliced into for retrieval.
- **Embeddings** = the 1536-number "meaning fingerprint" of each chunk (and of each query).
- **Ingestion** = chunk + embed + store. Skips work via content hashes.
- **Retrieval** = embed the question, ask Postgres+pgvector for the chunks with the closest fingerprints.
- **Idempotent + auditable**: re-running the seed is cheap, and the seeder only ever deletes rows it marked as its own.
