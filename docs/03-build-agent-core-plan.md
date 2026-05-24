# 03 — Build Agent Core: Implementation Plan

This document is the approved implementation plan for the next architecture slice: building `packages/agent`, a LangGraph-TS Agentic RAG workflow that turns the existing `retrieveChunks()` layer into a grounded, self-correcting portfolio assistant.

Full requirements live in `prompt.md` at the repo root and are non-negotiable. This plan splits the work into **four implementation phases**, ordered so each phase ends on a green floor (type-check + lint clean) before the next begins.

---

## Out of scope for this entire workflow

The following are explicitly **NOT** part of this slice and must not be added in any of the four phases:

- API routes (no `apps/api` work).
- Frontend code (no `apps/web` changes related to the agent).
- Twilio handlers or any provider-specific webhook code.
- Prisma schema changes.
- Database migrations.
- Evaluation tables (`EvaluationRun`, `EvaluationResult`, etc.).
- Ingestion-job tables (`KnowledgeIngestionJob`, etc.).
- AWS, Kubernetes, ECS, deployment, infra-as-code changes.
- Long-term / cross-request memory.
- Auto-creation of `Conversation` or `Message` rows.
- Tests / test framework introduction (validation is the smoke script + type-check + lint).
- Build steps for `packages/agent` (it exports TypeScript source directly, matching `@portfolio/db` and `@portfolio/contracts`).

---

## Phase 1 — Public contracts & package foundation

### Objective

Lock in the public seams the future API and frontend will consume — agent request/response schemas in `@portfolio/contracts` — and create the empty `@portfolio/agent` package shell with all repo-convention configuration in place. No graph code yet.

### Files created or modified

- `packages/contracts/src/agent.ts` *(new)*
- `packages/contracts/src/index.ts` *(modified — add `export * from "./agent"`)*
- `packages/contracts/package.json` *(modified — add `./agent` subpath under `exports`, mirroring `./twilio` and `./knowledge`)*
- `packages/agent/package.json` *(new)* — `name: @portfolio/agent`, `"type": "module"`, `main`/`types` pointing at `./src/index.ts`, no `build` script. Scripts: `check-types`, `lint`, `smoke:agent` (the script file itself comes in Phase 4 — the entry just needs to exist as a `package.json` script name).
- `packages/agent/tsconfig.json` *(new)* — clones `packages/db/tsconfig.json`: extends `@portfolio/typescript-config/base.json`, `noEmit: true`, `paths: { "@/*": ["./src/*"] }`, includes `src/**/*.ts` and `scripts/**/*.ts`.
- `packages/agent/eslint.config.js` *(new)* — clones `packages/db/eslint.config.js` (re-exports `@portfolio/eslint-config/base`).
- `packages/agent/src/index.ts` *(new — placeholder barrel, can be empty or export only the type identity that comes from Phase 4)*.
- `packages/agent/src/env.ts` *(new)* — `getChatEnv()` Zod-validated, lazy, cached accessor, mirroring `packages/db/src/env.ts`. Validates: `OPENAI_API_KEY` (required), `CHAT_MODEL` (default `gpt-4o-mini`), `CHAT_TIMEOUT_MS` (default `30000`), `CHAT_MAX_TOKENS` (default `1024`).
- `turbo.json` *(modified)* — extend `globalEnv` with `CHAT_MODEL`, `CHAT_TIMEOUT_MS`, `CHAT_MAX_TOKENS`.
- `.env.example` *(modified)* — append a "Chat completions" block with the three vars and their defaults.

### Scope boundaries

- Public-shape and packaging only. Define schemas, exports, scripts, configs, env validation.
- No LangGraph code, no provider, no grader, no prompts, no nodes, no persistence helpers.
- `getChatEnv()` is added in this phase because it's part of the package foundation (mirrors `getDatabaseEnv` / `getEmbeddingEnv` in `@portfolio/db`); nothing yet calls it.

### Contract details (must be reused from existing schemas — do not redefine)

In `packages/contracts/src/agent.ts`:

- `AgentConfidenceSchema = z.enum(["high","medium","low"])`.
- `AgentSourceSchema` — an **alias / re-export** of `RetrievedChunkSchema` from `./knowledge`. Do not redefine the chunk shape.
- `AgentRequestSchema`:
  - `conversationId?: NonEmptyStringSchema.optional()`
  - `userId?: NonEmptyStringSchema.optional()`
  - `message: NonEmptyStringSchema`
  - `channel: ChannelSchema` (from `./common`)
  - `metadata?: MetadataSchema.optional()`
  - `maxRetries?: z.number().int().min(0).max(2).optional()`
  - `topK?: z.number().int().min(1).max(20).optional()`
- `AgentResponseSchema`:
  - `answer: NonEmptyStringSchema`
  - `confidence: AgentConfidenceSchema`
  - `sources: z.array(AgentSourceSchema)`
  - `traceId: NonEmptyStringSchema`
  - `shouldEscalate: z.boolean()`
  - `metadata?: MetadataSchema.optional()`
- Inferred TS types (`AgentRequest`, `AgentResponse`, `AgentConfidence`, `AgentSource`) exported alongside the schemas.

### Acceptance criteria

- `@portfolio/contracts` exposes `AgentRequestSchema`, `AgentResponseSchema`, `AgentConfidenceSchema`, `AgentSourceSchema` plus inferred TS types, and they are importable from both `@portfolio/contracts` and `@portfolio/contracts/agent`.
- `AgentSourceSchema` is not a parallel chunk shape — it is the same schema instance as `RetrievedChunkSchema`.
- `@portfolio/agent` package exists, installs cleanly under pnpm, type-checks against an empty `src/`, and lints clean.
- `getChatEnv()` exists, is lazy and cached, throws an actionable error when `OPENAI_API_KEY` is missing, and never executes at module import time.
- `turbo.json` and `.env.example` include the new chat env vars.
- No production code calls anything from `@portfolio/agent` yet.

### Verification commands

```
pnpm install
pnpm --filter @portfolio/contracts check-types
pnpm --filter @portfolio/contracts lint
pnpm --filter @portfolio/agent check-types
pnpm --filter @portfolio/agent lint
```

### Must NOT be implemented in this phase

- LangGraph (no import of `@langchain/langgraph` yet).
- LLM provider (`src/llm/**`).
- Grader (`src/grader/**`).
- Prompts (`src/prompts/**`).
- Graph nodes or wiring.
- Persistence helpers.
- Smoke script body (file may be referenced by the `smoke:agent` script entry, but its content is Phase 4).
- `runAgent` entrypoint.
- Any DB writes.

---

## Phase 2 — Model/provider abstraction & decision-support foundation

### Objective

Build the deterministic, dependency-free building blocks that the LangGraph workflow will call into: the chat provider abstraction (mirrors the existing `EmbeddingProvider` pattern), the heuristic context grader (behind a typed interface so it can be swapped for an LLM grader later), and the prompt builders for `generate_answer` and `rewrite_query`.

### Files created or modified

- `packages/agent/src/llm/types.ts` *(new)* — `ChatProvider` interface, `ChatMessage` and `ChatResult` types.
- `packages/agent/src/llm/openai.ts` *(new)* — `createOpenAIChatProvider(options?)` factory. Lazy `OpenAI` client. Uses `getChatEnv()` from Phase 1. Calls `chat.completions.create` with model/temperature/max_tokens/timeout. Supports `AbortSignal`. SDK `maxRetries: 3`, `timeout: CHAT_TIMEOUT_MS`. No client construction at import time.
- `packages/agent/src/llm/index.ts` *(new)* — `getChatProvider()` memoized singleton + re-export of `createOpenAIChatProvider` and `ChatProvider`.
- `packages/agent/src/grader/types.ts` *(new)* — `ContextGrader` interface, `ContextVerdict` type, `RelevanceLabel = "good" | "weak" | "none"`.
- `packages/agent/src/grader/heuristic.ts` *(new)* — `createHeuristicGrader(options?)`. Options with defaults: `scoreFloor=0.55`, `topScoreThreshold=0.78`, `meanScoreThreshold=0.70`, `minAcceptedCount=1`. Algorithm: filter chunks by `scoreFloor`; if none → `"none"`; else compute `top` and `mean`; if `top >= topScoreThreshold && mean >= meanScoreThreshold && count >= minAcceptedCount` → `"good"` with `accepted` set; else `"weak"` with `accepted: []`. Operates at the **set level**. Does NOT call the LLM.
- `packages/agent/src/prompts/systemPrompt.ts` *(new)* — `buildSystemPrompt(acceptedChunks)`. Position the assistant as grounded on David's portfolio. Numbered chunk listing with source titles. Instructs the model to answer only from context, mention uncertainty when context is thin, never invent facts, stay concise and suitable for recruiters/interviewers/clients.
- `packages/agent/src/prompts/rewriteQuery.ts` *(new)* — `buildRewritePrompt({ originalQuery, currentQuery, intent?, weakChunks? })`. Instructs the model to output ONLY the rewritten query, preserve intent, add no invented facts.
- `packages/agent/package.json` *(modified)* — add runtime deps: `openai@^5.0.0`, `zod@^3.23.8`. `@portfolio/contracts: workspace:*` is added in this phase if not already (Phase 1 may have added it for env types, but the grader pulls in `RetrievedChunk` types so it's needed at the latest here).

### Scope boundaries

- Pure building blocks. No LangGraph imports. No DB writes. No state, nodes, or routing.
- Heuristic grader does not consume the chat provider.
- Prompt builders return strings; they do not call the model.

### Acceptance criteria

- `ChatProvider` interface mirrors `EmbeddingProvider` (`readonly model: string`, an async method that accepts an `AbortSignal`).
- `createOpenAIChatProvider()` does not construct an `OpenAI` client at import time — only inside the first `chat()` call.
- `getChatEnv()` is the only place env is read; the provider never touches `process.env` directly.
- The OpenAI client is configured with `maxRetries: 3` and the configured timeout.
- `createHeuristicGrader()` returns a `ContextGrader` with deterministic, pure `grade()` behavior. Calling it with no chunks returns `"none"`. Calling it with chunks above thresholds returns `"good"` and populates `accepted`. Otherwise returns `"weak"` with empty `accepted`.
- Prompt builders produce stable strings (no LLM calls).
- All new files type-check and lint clean.

### Verification commands

```
pnpm --filter @portfolio/agent check-types
pnpm --filter @portfolio/agent lint
```

### Must NOT be implemented in this phase

- LangGraph imports anywhere in `packages/agent`.
- Graph state, nodes, routing, wiring.
- `runAgent` entrypoint.
- Persistence helpers / Prisma writes.
- Smoke script body.
- LLM-based context grader (deferred — interface allows future swap).

---

## Phase 3 — LangGraph workflow (state, nodes, routing)

### Objective

Wire the cyclic CRAG-style LangGraph workflow: explicit typed state with reducers, six nodes implemented as dependency-injected closures, a conditional edge that routes after grading, and a real retry loop. The graph is buildable and `.invoke()`-able with injected fakes, but no DB writes yet — that lands in Phase 4.

### Files created or modified

- `packages/agent/src/deps.ts` *(new)* — `AgentDeps` type (`{ prisma, chatProvider, grader, retrieve }`) and `resolveDeps(overrides?: Partial<AgentDeps>): AgentDeps`. The DI seam. `retrieve` is a thin wrapper over `retrieveChunks()` from `@portfolio/db`. `prisma` is the singleton from `@portfolio/db`. `chatProvider` and `grader` come from Phase 2.
- `packages/agent/src/graph/state.ts` *(new)* — `Annotation.Root({ ... })` declaring all state channels. Fields: `originalQuery`, `currentQuery`, `intent?`, `retrievedChunks`, `acceptedChunks`, `retryCount`, `maxRetries`, `relevanceLabel?`, `answer?`, `model`, `topK`, `metadata?`, `pendingSteps`, `traceId`. **`pendingSteps` declared with an explicit append reducer** `(prev, next) => [...prev, ...next]`; `retrievedChunks` / `acceptedChunks` / `retryCount` use default replace semantics. Also defines and exports `StepRecord` and `StepStatus` types.
- `packages/agent/src/graph/routing.ts` *(new)* — `decisionRouter(state) → "generate_answer" | "rewrite_query" | "fallback"`. Implemented as a **conditional edge function**, not a node. Logic: `relevanceLabel === "good"` → generate; else if `retryCount < maxRetries` → rewrite; else → fallback. **Weak-after-retries always routes to fallback** — no best-effort generate path.
- `packages/agent/src/graph/nodes/analyzeIntent.ts` *(new)* — `makeAnalyzeIntent(deps)` returning `(state) => Promise<Partial<GraphState>>`. **Pure transform**; normalizes `currentQuery` from `originalQuery` on first pass, captures lightweight intent, appends an `intent_classifier` step. Never short-circuits.
- `packages/agent/src/graph/nodes/retrieveContext.ts` *(new)* — `makeRetrieveContext(deps)`. Calls `deps.retrieve({ query: state.currentQuery, topK: state.topK })`. **Replaces** `retrievedChunks` (no union with prior rounds). Appends a `retrieve_context` step.
- `packages/agent/src/graph/nodes/gradeContext.ts` *(new)* — `makeGradeContext(deps)`. Calls `deps.grader.grade(state.retrievedChunks)`. Sets `relevanceLabel` and (on `"good"`) `acceptedChunks`. Appends a `grade_context` step including the verdict reason in metadata.
- `packages/agent/src/graph/nodes/rewriteQuery.ts` *(new)* — `makeRewriteQuery(deps)`. Calls `deps.chatProvider.chat({ system: buildRewritePrompt(...), user: state.originalQuery })`. Updates `currentQuery`, increments `retryCount`. Appends a `rewrite_query` step including `metadata.rewrittenQuery` for downstream visibility.
- `packages/agent/src/graph/nodes/generateAnswer.ts` *(new)* — `makeGenerateAnswer(deps)`. Calls `deps.chatProvider.chat({ system: buildSystemPrompt(state.acceptedChunks), user: state.originalQuery })`. Sets `answer` and `model`. Appends an `answer_generator` step.
- `packages/agent/src/graph/nodes/fallback.ts` *(new)* — `makeFallback(deps)`. Returns a deterministic fallback string (no LLM call — robust to outage). Sets `answer` and `model`. Appends a `fallback_escalation` step.
- `packages/agent/src/graph/index.ts` *(new)* — `buildAgentGraph(deps): { graph, defaultRecursionLimit }`. Wires `setEntryPoint("analyze_intent")`, the linear edges `analyze_intent → retrieve_context → grade_context`, the conditional edge from `grade_context` via `decisionRouter` into `{ generate_answer, rewrite_query, fallback }`, the loop edge `rewrite_query → retrieve_context`, and terminal edges `generate_answer → END` and `fallback → END`. Computes `defaultRecursionLimit = maxRetries * 4 + 4`.
- `packages/agent/package.json` *(modified)* — add runtime dep `@langchain/langgraph@^0.2.74` and `@portfolio/db: workspace:*`.

### Scope boundaries

- Graph + nodes + routing only. Nodes receive their dependencies via closure; they never read `process.env`, never construct clients, never import the `prisma` singleton, never smuggle deps through state.
- No DB writes from graph code. Nodes only append `StepRecord` entries to `pendingSteps` in state; persistence (in Phase 4) reads from state at the entrypoint boundary.
- No `runAgent()` entrypoint yet. The graph is testable via `buildAgentGraph(deps).graph.invoke(initialState, { recursionLimit })` with hand-rolled deps.
- No smoke script.

### Dependency-injection guardrails (must hold at end of phase)

- No file under `src/graph/nodes/**` imports from `@portfolio/db`, calls `getChatProvider()`, calls `createOpenAIChatProvider()`, references `process.env`, or imports `crypto`. Nodes get everything they need from `deps` and `state`.
- `deps.retrieve` is the only seam through which `retrieveChunks()` is reachable from the graph.

### LangGraph specifics (Annotation API)

- Use `Annotation.Root({...})` to declare state channels with optional `reducer` and `default`. State TS type derives via `typeof AgentStateAnnotation.State`.
- `addConditionalEdges("grade_context", decisionRouter, { generate_answer: "generate_answer", rewrite_query: "rewrite_query", fallback: "fallback" })`.
- `recursionLimit` is applied at `.invoke(state, { recursionLimit })`, not at `.compile()`.
- Fallback if `Annotation` typing rejects the schema under the pinned version: drop down to `new StateGraph<I>({ channels: { ... } })` with the same reducer/default semantics. No architectural change required.

### Acceptance criteria

- `buildAgentGraph(deps)` returns a compiled graph and a default recursion limit.
- The graph's conditional edge is the only place routing logic lives — no node decides the next node.
- `analyze_intent` cannot short-circuit to `fallback`; it always flows into `retrieve_context`.
- `pendingSteps` accumulates across nodes (append reducer); `retrievedChunks` replaces each round (no reducer).
- A bench-style invocation of `buildAgentGraph({ ...stubs })` followed by `.invoke({...initial}, { recursionLimit })` produces a terminal state with `answer`, `relevanceLabel`, and a non-empty `pendingSteps` array — no DB calls made.
- Type-check + lint clean for `@portfolio/agent`.

### Verification commands

```
pnpm --filter @portfolio/agent check-types
pnpm --filter @portfolio/agent lint
```

(End-to-end execution against a real DB and real OpenAI is deferred to Phase 4.)

### Must NOT be implemented in this phase

- `runAgent()` public entrypoint.
- Prisma writes anywhere (no `prisma.agentTrace.create`, no `agentStep.createMany`, no `retrievedContext.createMany`).
- Smoke script body.
- LLM grader implementation.
- Any cross-request memory or session state.

---

## Phase 4 — Persistence, public entrypoint, smoke script & end-to-end verification

### Objective

Close the slice. Add persistence helpers that write `AgentTrace`, `AgentStep`, and `RetrievedContext` rows; build the `runAgent()` public entrypoint that owns the `try / finally` persistence boundary; ship a smoke script that exercises both an answerable and a weak/unanswerable question; verify end-to-end against the local DB.

### Files created or modified

- `packages/agent/src/persistence/trace.ts` *(new)* — four helpers:
  - `openTrace({ prisma, traceId, request, model })` — `prisma.agentTrace.create` with `id = traceId`, `input = request.message`, `conversationId = request.conversationId ?? null`, `model`, `shouldEscalate: false`. Writing the row up front guarantees a returnable `traceId` even when the graph throws.
  - `flushSteps({ prisma, traceId, steps })` — `prisma.agentStep.createMany` over `state.pendingSteps`.
  - `writeRetrievedContexts({ prisma, traceId, chunks })` — `prisma.retrievedContext.createMany` over `acceptedChunks` only (final accepted context, not discarded retrieval rounds). Snapshots `content`, `title`, `score`, `rank`, links `documentChunkId` and `documentId`.
  - `finalizeTrace({ prisma, traceId, output, confidence, shouldEscalate, retrievedContextCount, latencyMs, retryCount, error? })` — `prisma.agentTrace.update`. Merges `error` (if present) into `metadata`.
- `packages/agent/src/runAgent.ts` *(new)* — public entrypoint:
  - `AgentRequestSchema.parse(request)`.
  - Resolve deps via `resolveDeps(overrides)`.
  - Mint `traceId` with `crypto.randomUUID()`.
  - Capture `startedAt = Date.now()`.
  - `await openTrace({...})` — establishes the durable row up front.
  - `try { terminalState = await graph.invoke(initialState, { recursionLimit }) }`
  - `catch (err) { thrown = err }`
  - `finally { await flushSteps(...); await writeRetrievedContexts(...); await finalizeTrace({ ..., latencyMs: Date.now() - startedAt, error: thrown }); }`
  - If `thrown`, rethrow.
  - Else compute `confidenceFor(terminalState)` (first-round good → `high`; good after ≥1 rewrite → `medium`; fallback reached → `low + shouldEscalate=true`).
  - Return `AgentResponseSchema.parse({ answer, confidence, sources: acceptedChunks, traceId, shouldEscalate, metadata })`.
- `packages/agent/src/index.ts` *(modified)* — barrel re-exports: `runAgent`, `AgentDeps`, `GraphState`, `StepRecord`, `ChatProvider`, `ContextGrader`, `ContextVerdict`.
- `packages/agent/scripts/smoke-agent.ts` *(new)* — exercises the agent end-to-end:
  - Two **independent** `runAgent()` calls. Each gets its own `traceId`. No synthetic conversation threading.
  - Question 1 (answerable): e.g. `"What is David's technical stack?"`
  - Question 2 (weak / unanswerable): e.g. `"What is David's favorite database indexing strategy?"`
  - For each, prints: original question, final answer, confidence, `shouldEscalate`, retry count, whether rewriting happened (and the rewritten query if any — read from the `rewrite_query` step's `metadata.rewrittenQuery`), source previews (rank/score/title/content snippet), and the `traceId`.
  - Exits non-zero if the answerable question's confidence is `"low"` or if trace persistence throws.
  - Mirrors the entry/exit pattern from `packages/db/scripts/smoke-retrieval.ts`, including `await prisma.$disconnect()` in `finally`.
- `packages/agent/package.json` *(modified)* — ensure `smoke:agent` script runs as `tsx --env-file=../../.env scripts/smoke-agent.ts`. Confirm `tsx@^4.22.3` is in `devDependencies`.

### Scope boundaries

- Persistence helpers only touch the three trace-related Prisma models. No writes to `Conversation`, `Message`, `Document`, `DocumentChunk`, or `ChannelEvent`.
- Trace persistence runs at the entrypoint, not in nodes. Nodes already only append to `state.pendingSteps`.
- Smoke script consumes the *real* DB (seeded via `pnpm --filter @portfolio/db seed:knowledge`) and the *real* OpenAI provider. There is no mocking layer in MVP.

### Acceptance criteria

- One `AgentTrace` row is written per `runAgent()` call, even when the graph throws mid-run.
- `AgentStep` rows are written for the meaningful steps actually taken (e.g. answered runs include `intent_classifier`, `retrieve_context`, `grade_context`, `answer_generator`; fallback runs replace `answer_generator` with `fallback_escalation`).
- `RetrievedContext` rows are written **only** for the final accepted chunks (zero rows for fallback runs).
- `AgentTrace.latencyMs` reflects the full run including persistence overhead.
- `AgentResponse` is validated through `AgentResponseSchema` before returning.
- Confidence assignment follows the rules in `prompt.md` exactly.
- The smoke script's answerable question returns `confidence ∈ {high, medium}`, `shouldEscalate=false`, ≥1 source.
- The smoke script's weak question returns `confidence="low"`, `shouldEscalate=true`, `sources=[]`.
- The smoke script exits non-zero on persistence failure or on a `"low"`-confidence answerable result.
- `@portfolio/agent` lints and type-checks clean.

### Verification commands

```
# Type + lint sweep
pnpm --filter @portfolio/contracts check-types
pnpm --filter @portfolio/contracts lint
pnpm --filter @portfolio/agent check-types
pnpm --filter @portfolio/agent lint

# Ensure infra and corpus are ready
docker compose up -d
pnpm --filter @portfolio/db db:migrate
pnpm --filter @portfolio/db seed:knowledge
pnpm --filter @portfolio/db smoke:retrieval

# End-to-end agent smoke
pnpm --filter @portfolio/agent smoke:agent
```

Manual DB checks (via Prisma Studio or psql):

```sql
SELECT id, "conversationId", confidence, "shouldEscalate",
       "retrievedContextCount", "latencyMs", model
FROM "AgentTrace" ORDER BY "createdAt" DESC LIMIT 2;

SELECT "stepName", status, "latencyMs"
FROM "AgentStep"
WHERE "traceId" = (SELECT id FROM "AgentTrace" ORDER BY "createdAt" DESC LIMIT 1)
ORDER BY "createdAt";

SELECT rank, score, title, LEFT(content, 60)
FROM "RetrievedContext"
WHERE "traceId" = (SELECT id FROM "AgentTrace" ORDER BY "createdAt" DESC LIMIT 1)
ORDER BY rank;
```

Expected: two recent traces, steps include `intent_classifier` + `retrieve_context` + `grade_context` plus one of `{answer_generator, fallback_escalation}`, and `RetrievedContext` rows present only for the answered question.

### Must NOT be implemented in this phase

- API routes, Fastify wiring, or any consumer of `runAgent()` outside the smoke script.
- Frontend changes.
- Twilio handlers.
- Prisma schema changes / migrations.
- Evaluation tables, ingestion-job tables.
- AWS / Kubernetes / deployment scaffolding.
- Cross-request memory, conversation summarization, or message-row auto-creation.
- A test runner (vitest/jest). Validation is the smoke script + type-check + lint.

---

## Cross-phase rules

These hold across all four phases and supersede any per-phase ambiguity:

- `decision_router` is a conditional edge, never a node.
- `persist_trace` is not a node; persistence runs at the entrypoint inside `try / finally`.
- `analyze_intent` is a pure transform; it cannot short-circuit to `fallback`.
- Weak-after-retries always routes to `fallback` — no best-effort generate path.
- Nodes receive dependencies via closure; they never touch `process.env`, never construct clients, never import the `prisma` singleton, never smuggle deps through state.
- `AgentSourceSchema` is an alias of `RetrievedChunkSchema`, not a parallel definition.
- `@portfolio/agent` exports TypeScript source directly with no build step, matching `@portfolio/db` and `@portfolio/contracts`.
