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
`packages/contracts/src/agent.ts` are the seams the future API and frontend
will consume. `AgentSourceSchema` is an alias of `RetrievedChunkSchema` from
`./knowledge` — there is no parallel chunk shape.

### Known limitations (planned follow-ups)

- The current `ContextGrader` is a score-threshold heuristic. The interface
  was deliberately built so an LLM-based grader can be slotted in without
  graph changes; that swap is the next planned change.
- The seeded knowledge corpus is thin for several recruiter-facing topics
  (stack details, recent projects, role history). Today many otherwise-
  answerable questions fall into `fallback` because retrieval scores are
  below any reasonable grader threshold. Corpus expansion is tracked
  alongside the grader upgrade.
