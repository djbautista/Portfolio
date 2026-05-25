# Architecture

## Provider-agnostic channel model

The portfolio AI assistant must remain free to add new communication channels
(web chat, Slack, email, Telegram, additional SMS providers, custom integrations)
without rewiring its core. To preserve that flexibility, **Twilio is treated as
an edge adapter, not as a core domain concept.**

The contract layer in `packages/contracts` makes this split explicit:

- **At the boundary** (Twilio webhook endpoints), raw Twilio payloads are
  validated with Twilio-specific Zod schemas:
  - `TwilioInboundMessageSchema`
  - `TwilioStatusCallbackSchema`

  These live in `packages/contracts/src/twilio.ts` and are the **only** place
  where Twilio-specific field names (`MessageSid`, `From`, `Body`, `WaId`, …)
  appear.

- **After validation**, payloads are normalized into provider-agnostic models
  defined in `packages/contracts/src/channel.ts`:
  - `ChannelEvent` — a unified record of any inbound/outbound channel activity
  - `InboundChannelMessage` — a normalized inbound message ready for the app to
    process
  - `OutboundChannelStatus` — a normalized delivery/status callback

  Shared primitives and enums (`Channel`, `ChannelProvider`, `Metadata`,
  `ISODateString`, …) live in `packages/contracts/src/common.ts` so they can be
  reused by chat, agent, and persistence contracts.

- **The rest of the system** (`apps/api` orchestration, `apps/worker`,
  `packages/agent`, downstream DB writes) works only with the agnostic models.
  Adding a new provider — Slack, email, Telegram — requires writing a new edge
  adapter and a new normalization step; no code in the core domain has to
  change.

This preserves a clean separation:

- `packages/contracts` — wire/runtime contracts (Zod schemas + inferred TS types)
- `packages/db` — persistence
- `packages/agent` — intelligence / RAG workflow
- `apps/api` — orchestration + HTTP/Twilio boundary
- `apps/web` — user experience

`packages/db/prisma/schema.prisma` defines a provider-agnostic `ChannelEvent`
model that matches the `ChannelEvent` contract — persistence and contracts
share the same vocabulary, and Twilio (or any other provider) lives only in
edge-adapter code, not in the core schema.

## Agent core

`packages/agent` turns the retrieval layer in `packages/db` into a grounded,
self-correcting assistant. It is built as a cyclic LangGraph workflow in the
spirit of **CRAG** (Corrective RAG): retrieve → grade → either answer, rewrite
and retry, or escalate.

### Workflow shape

The graph has six nodes and one conditional edge:

```
analyze_intent → retrieve_context → grade_context ──(decisionRouter)──┐
                       ▲                                              ├─► generate_answer ─► END
                       │                                              ├─► rewrite_query ─► (loop back to retrieve_context)
                       │                                              └─► fallback        ─► END
                       └──────────────── rewrite_query ───────────────┘
```

- **`analyze_intent`** — pure transform; normalizes the query on first pass and
  captures a light intent hint. Cannot short-circuit.
- **`retrieve_context`** — calls `deps.retrieve()` (which wraps
  `retrieveChunks()` from `@portfolio/db`) and **replaces** the retrieved set
  each round; prior rounds are not merged.
- **`grade_context`** — runs the injected `ContextGrader`, labels the result
  `"good" | "weak" | "none"`, and on `"good"` populates `acceptedChunks`.
- **`decisionRouter`** (a conditional edge, not a node) — `good` → answer;
  otherwise if retries remain → rewrite; else → fallback. Weak-after-retries
  always escalates rather than best-effort answering.
- **`rewrite_query`** — LLM-rewrites the query, increments `retryCount`, loops
  back to retrieval.
- **`generate_answer`** — LLM answer grounded strictly on `acceptedChunks`.
- **`fallback`** — deterministic escalation string (no LLM call, so it survives
  provider outages).

### Dependency injection

Nodes never read `process.env`, construct clients, or import the `prisma`
singleton. They receive everything through closures over `AgentDeps`:

```
interface AgentDeps {
  prisma: PrismaClient;
  chatProvider: ChatProvider;   // see packages/agent/src/llm
  grader: ContextGrader;        // see packages/agent/src/grader
  retrieve: RetrieveFn;         // thin wrapper over retrieveChunks()
}
```

`resolveDeps(overrides)` produces production defaults (real OpenAI provider,
heuristic grader, real Prisma + retrieval) but accepts overrides so the graph
is testable with fakes without any monkey-patching.

### Public entrypoint and persistence boundary

`runAgent(request)` is the only public surface intended for callers outside
the package. It:

1. Validates the request via `AgentRequestSchema`
   (`packages/contracts/src/agent.ts`).
2. Mints a `traceId` and opens an `AgentTrace` row **up front** so a durable
   id is always returnable — even when the graph throws mid-run.
3. Invokes the compiled graph.
4. Persists `AgentStep` rows (one per executed node) and `RetrievedContext`
   rows (snapshots of the **final accepted** chunks only — zero rows for
   fallback runs) and finalizes the `AgentTrace`.
5. Returns an `AgentResponse` validated through `AgentResponseSchema`, with
   confidence assigned by terminal state: `good` on first pass → `high`,
   `good` after rewrite → `medium`, fallback or thrown graph → `low` +
   `shouldEscalate: true`.

Persistence runs **only** at this entrypoint boundary; nodes accumulate
`StepRecord` entries in graph state and the entrypoint flushes them. This
keeps the graph pure and testable, and makes the trace contract a single
file to audit (`packages/agent/src/persistence/trace.ts`).

### Wire contracts

`AgentRequestSchema` and `AgentResponseSchema` in
`packages/contracts/src/agent.ts` are the seams the API and frontend consume.
`AgentSourceSchema` is an alias of `RetrievedChunkSchema` from `./knowledge`
— there is no parallel chunk shape.

`packages/contracts/src/chat.ts` layers the HTTP wire shape on top:

- `ChatRequestSchema` is the inbound `/chat` body (message, channel, optional
  conversationId / userId / metadata).
- `ChatResponseSchema` is `AgentResponseSchema.extend({ conversationId })` —
  intentionally `.extend()` rather than redeclared so the API response stays
  in lockstep with the agent response on agent-owned fields (`confidence`,
  `sources`, `traceId`, `shouldEscalate`, `metadata`).

`packages/contracts/src/errors.ts` defines the failure envelope
(`ErrorCodeSchema` + `ErrorResponseSchema`) that the API returns for every
non-2xx response. The codes are the closed set
`validation_error | conversation_not_found | agent_failure | internal_error`.

## API layer

`apps/api` is the Fastify HTTP boundary that fronts `@portfolio/agent`. It is
intentionally thin: the agent owns intelligence and trace persistence; the API
owns transport, conversation lifecycle, message persistence, and the error
envelope.

### Boot and request lifecycle

- `src/server.ts` reads env via `getApiEnv()` and calls `app.listen()`.
- `src/app.ts` (`buildApp`) constructs the Fastify instance, registers `@fastify/cors`
  (origins parsed from `API_CORS_ORIGINS`; in production an unset value
  disables CORS rather than allowing `*`), and installs a single error handler
  that maps every thrown error to `ErrorResponseSchema`. Unknown errors are
  logged server-side and surfaced as a generic `internal_error` — internals
  are never echoed to clients.
- `src/env.ts` validates only API-owned env vars (`API_HOST`, `API_PORT`,
  `NODE_ENV`, `API_CORS_ORIGINS`). `DATABASE_URL` belongs to `@portfolio/db`
  and `OPENAI_API_KEY` to `@portfolio/agent`; the API does not re-validate
  them.

### Routes

- `GET /health` (`src/routes/health.ts`) — liveness probe.
- `POST /chat` (`src/routes/chat.ts`) — parses the body with
  `ChatRequestSchema` and delegates to `handleChat()`. On parse failure it
  throws `ValidationError`, which the central handler converts to a 400
  `validation_error` envelope with per-issue details.

### Chat orchestration

`src/services/chatService.ts#handleChat` is where the API earns its keep:

1. **Resolve the conversation.** If `conversationId` is provided, look it up
   and throw `ConversationNotFoundError` (→ 404 `conversation_not_found`) if
   it does not exist. Otherwise create a new `Conversation` row.
2. **Persist the user `Message`** before invoking the agent, so the inbound
   side of the conversation is durable even if the agent throws.
3. **Invoke `runAgent`**, mapping `ChatRequest` to `AgentRequest`. Any thrown
   error is wrapped in `AgentFailureError` (→ 500 `agent_failure`) and the
   original cause is preserved on `Error.cause` for server-side logs.
4. **Persist the assistant `Message`** with `traceId`, `confidence`, and
   `shouldEscalate` stored on its metadata, so the message row is
   self-describing without needing to join the trace table.
5. **Best-effort back-fill** `AgentTrace.assistantMessageId` so traces can be
   navigated from message → trace as well as trace → messages. A failure here
   is logged and swallowed: the user-visible response is already produced and
   the assistant message is already saved, so failing the request would be
   strictly worse than a missing back-pointer.
6. **Return a `ChatResponse`** — the agent response plus the resolved
   `conversationId`.

### Error envelope

Every non-2xx response is shaped by `ErrorResponseSchema`. The mapping
(`HttpError → status + code`, `ZodError → 400 validation_error`, unknown →
500 `internal_error`) lives in one place in `app.ts`. Route handlers and
services only throw; they never format error payloads.

### Smoke check

`apps/api/scripts/smoke-chat.ts` boots the app via `fastify.inject()` (no
real port binding, no network) and exercises the happy path, the validation
error path, and the missing-conversation 404 path against the real database
and agent. It is the API counterpart to `smoke:agent` / `smoke:retrieval` —
a one-command "is this wired correctly" check, not a test suite.

### Known limitations (planned follow-ups)

- The current `ContextGrader` is a score-threshold heuristic. The interface
  was deliberately built so an LLM-based grader can be slotted in without
  graph changes; that swap is the next planned change.
- The seeded knowledge corpus is thin for several recruiter-facing topics
  (stack details, recent projects, role history). Today many otherwise-
  answerable questions fall into `fallback` because retrieval scores are
  below any reasonable grader threshold. Corpus expansion is tracked
  alongside the grader upgrade.
