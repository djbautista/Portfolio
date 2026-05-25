---

# Workspace Tree

A tour of the whole monorepo. Files marked **★** are part of the knowledge pipeline explained above. Generated files (Prisma client, lockfiles, build output) and binary assets are summarized rather than listed.

```
Portfolio/
├── .env                        — local secrets (DATABASE_URL, OPENAI_API_KEY, etc). Gitignored.
├── .env.example                — template showing which env vars the repo needs.
├── .gitignore                  — top-level ignore rules.
├── .npmrc                      — pnpm settings (hoisting, registry).
├── docker-compose.yml          — spins up local Postgres + pgvector for dev.
├── package.json                — root workspace manifest; defines repo-wide scripts and dev deps.
├── pnpm-lock.yaml              — pinned dep graph.
├── pnpm-workspace.yaml         — declares which folders are workspace packages.
├── turbo.json                  — Turborepo pipeline config (build/test/lint task graph).
│
├── apps/
│   ├── api/                    — Fastify HTTP boundary that fronts @portfolio/agent.
│   │   ├── eslint.config.js
│   │   ├── package.json        — exports @portfolio/api; defines dev/start scripts + smoke:chat.
│   │   ├── tsconfig.json
│   │   │
│   │   ├── scripts/
│   │   │   └── smoke-chat.ts   — boots the app via fastify.inject() and exercises happy path, validation error, and missing-conversation 404.
│   │   │
│   │   └── src/
│   │       ├── server.ts       — process entrypoint; reads env and calls app.listen().
│   │       ├── app.ts          — buildApp(): Fastify factory; registers CORS, routes, and the central error handler that maps to ErrorResponseSchema.
│   │       ├── env.ts          — lazy, Zod-validated API env accessor (API_HOST, API_PORT, NODE_ENV, API_CORS_ORIGINS) + parseCorsOrigins helper.
│   │       ├── errors.ts       — HttpError base + ValidationError / ConversationNotFoundError / AgentFailureError.
│   │       │
│   │       ├── routes/
│   │       │   ├── health.ts   — GET /health.
│   │       │   └── chat.ts     — POST /chat; validates ChatRequestSchema and delegates to chatService.
│   │       │
│   │       └── services/
│   │           └── chatService.ts — resolves/creates the Conversation, writes the user Message, invokes runAgent(), writes the assistant Message, and best-effort back-fills assistantMessageId on the AgentTrace.
│   │
│   └── web/                    — Next.js 16 portfolio site (React 19 + Tailwind v4).
│       ├── .env.local.example  — example env for the web app.
│       ├── .gitignore          — Next-specific ignores.
│       ├── eslint.config.js    — flat ESLint config, extends the shared next preset.
│       ├── next.config.js      — Next.js configuration.
│       ├── next-env.d.ts       — Next-injected TS shims.
│       ├── package.json        — web app deps + dev/build scripts.
│       ├── postcss.config.mjs  — PostCSS pipeline (Tailwind v4 plugin).
│       ├── tsconfig.json       — extends @portfolio/typescript-config/nextjs.
│       │
│       ├── app/                — App Router pages.
│       │   ├── layout.tsx      — root HTML shell, fonts, global providers.
│       │   ├── page.tsx        — landing/home page.
│       │   ├── globals.css     — Tailwind v4 + custom globals.
│       │   ├── about/page.tsx  — bio page.
│       │   ├── contact/page.tsx — contact form page.
│       │   ├── api/contact/route.ts — POST handler for the contact form.
│       │   └── demos/          — interactive demo pages.
│       │       ├── page.tsx           — demos index.
│       │       ├── gallery/page.tsx   — image gallery demo.
│       │       └── infinity-text/page.tsx — infinity-scroll text demo.
│       │
│       ├── components/
│       │   ├── common/         — shared UI primitives.
│       │   │   ├── Box, Button, Card, Slot, Typography (index.tsx each) — atomic primitives.
│       │   │   ├── Dialog/     — accessible dialog (DialogContent, DialogModal, DialogOverlay, index).
│       │   │   ├── Highlight/  — text-highlight wrapper.
│       │   │   ├── Modal/      — fullscreen modal.
│       │   │   ├── Navigation/ — top nav.
│       │   │   ├── Section/    — semantic page section.
│       │   │   └── index.ts    — barrel re-export.
│       │   ├── ContactForm/    — contact-form component + barrel.
│       │   └── demos/
│       │       ├── Gallery/    — gallery demo (Gallery, Modal, Project, index).
│       │       └── InfinityText/ — infinity-text demo + barrel.
│       │
│       ├── hooks/
│       │   ├── api/useContact.ts — POSTs the contact form to /api/contact.
│       │   └── useMultipleRefs.ts — merges multiple refs onto one element.
│       │
│       ├── model/
│       │   ├── ContactFormData.ts — Zod schema/types for the contact form.
│       │   └── index.ts          — barrel re-export.
│       │
│       ├── public/             — static assets (resume PDF, profile/demo images, favicon).
│       │
│       └── utils/
│           ├── fonts.ts        — next/font setup.
│           └── mergeProps.ts   — utility to merge JSX prop objects.
│
├── docs/
│   ├── architecture.md               — high-level architecture write-up (channel model + agent core + API layer).
│   ├── knowledge-pipeline.md         — walkthrough of the @portfolio/db knowledge ingestion + retrieval path.
│   └── workspace-tree.md             — this document.
│
├── infra/
│   └── postgres/
│       └── init.sql            — runs on first docker-compose boot; enables the pgvector extension.
│
└── packages/
    │
    ├── contracts/              — shared Zod schemas + TS types used across packages.
    │   ├── .gitignore
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts        — barrel re-export of all schemas.
    │       ├── common.ts       — primitive schemas (NonEmptyString, ISO date, channel enums).
    │       ├── channel.ts      — inbound/outbound channel event schemas (used by webhooks).
    │       ├── knowledge.ts ★  — KnowledgeDocumentInput, RetrievalQuery, RetrievedChunk schemas.
    │       ├── agent.ts        — AgentRequest / AgentResponse / AgentConfidence / AgentSource (alias of RetrievedChunk).
    │       ├── chat.ts         — ChatRequest + ChatResponse (extends AgentResponse with conversationId); the HTTP wire shape for /chat.
    │       ├── errors.ts       — ErrorCode enum + ErrorResponse envelope returned by the API on every failure.
    │       └── twilio.ts       — Twilio-specific webhook payload schemas.
    │
    ├── db/                     — Prisma + pgvector data layer; home of the knowledge pipeline.
    │   ├── .gitignore
    │   ├── package.json        — exports @portfolio/db; defines seed-knowledge / smoke scripts.
    │   ├── prisma.config.ts    — Prisma CLI config (schema path, output dir).
    │   ├── tsconfig.json
    │   ├── README.md           — DB package usage notes.
    │   │
    │   ├── prisma/
    │   │   ├── schema.prisma   — data model: Conversation, Message, Document, DocumentChunk (vector(1536)), AgentTrace/Step, RetrievedContext, ChannelEvent.
    │   │   └── migrations/
    │   │       ├── migration_lock.toml
    │   │       └── 20260524004058_init/migration.sql — initial migration; creates pgvector extension + HNSW index.
    │   │
    │   ├── scripts/
    │   │   ├── seed-knowledge.ts ★      — orchestrator that ingests all seed docs.
    │   │   ├── seed-knowledge-data.ts ★ — builds the "shopping list" of seed documents from @portfolio/content.
    │   │   └── smoke-retrieval.ts ★     — sanity-check script that runs a sample query through the retriever.
    │   │
    │   └── src/
    │       ├── index.ts        — exports the singleton Prisma client + re-exports generated types.
    │       ├── env.ts          — lazy, Zod-validated env accessors (DB env vs embedding env).
    │       │
    │       ├── embeddings/
    │       │   ├── index.ts ★  — getEmbeddingProvider() factory (cached singleton).
    │       │   ├── openai.ts ★ — OpenAI embeddings client: batching, retries, validation.
    │       │   └── types.ts ★  — EmbeddingProvider interface.
    │       │
    │       ├── knowledge/
    │       │   ├── chunking.ts ★  — chunkText(): overlap-aware text splitter.
    │       │   ├── documents.ts ★ — upsertDocument() + computeContentHash().
    │       │   ├── chunks.ts ★    — replaceDocumentChunks(): transactional delete-then-insert.
    │       │   └── retrieve.ts ★  — retrieveChunks(): embeds query, runs cosine-distance SQL.
    │       │
    │       └── generated/prisma/ — Prisma-generated client. Do not edit by hand; regenerated by `prisma generate`.
    │           ├── browser.ts, client.ts, commonInputTypes.ts, enums.ts, models.ts
    │           ├── internal/{class,prismaNamespace,prismaNamespaceBrowser}.ts
    │           └── models/{AgentStep, AgentTrace, ChannelEvent, Conversation, Document, DocumentChunk, Message, RetrievedContext}.ts
    │
    ├── agent/                  — LangGraph CRAG agent: turns retrieveChunks() into a grounded, self-correcting assistant.
    │   ├── eslint.config.js
    │   ├── package.json        — exports @portfolio/agent; defines smoke:agent script + LangGraph/OpenAI runtime deps.
    │   ├── tsconfig.json
    │   │
    │   ├── scripts/
    │   │   └── smoke-agent.ts  — exercises runAgent() end-to-end against the real DB + OpenAI with an answerable + an unanswerable question.
    │   │
    │   └── src/
    │       ├── index.ts        — barrel: runAgent + public types (AgentDeps, GraphState, ChatProvider, ContextGrader, …).
    │       ├── env.ts          — lazy, Zod-validated chat env accessor (OPENAI_API_KEY, CHAT_MODEL, CHAT_TIMEOUT_MS, CHAT_MAX_TOKENS).
    │       ├── deps.ts         — AgentDeps shape + resolveDeps(): the DI seam for prisma, chatProvider, grader, retrieve.
    │       ├── runAgent.ts     — public entrypoint; owns trace persistence at the try/catch boundary.
    │       │
    │       ├── graph/
    │       │   ├── index.ts    — buildAgentGraph(deps): wires the StateGraph + computeRecursionLimit().
    │       │   ├── state.ts    — AgentStateAnnotation: state channels (originalQuery, retrievedChunks, pendingSteps, …) + StepRecord type.
    │       │   ├── routing.ts  — decisionRouter: conditional edge from grade_context → generate / rewrite / fallback.
    │       │   └── nodes/
    │       │       ├── step.ts            — withStep() helper: wraps a node body and emits a StepRecord.
    │       │       ├── analyzeIntent.ts   — first-pass intent capture + query normalization (pure; never short-circuits).
    │       │       ├── retrieveContext.ts — calls deps.retrieve(); replaces retrievedChunks each round.
    │       │       ├── gradeContext.ts    — runs deps.grader; sets relevanceLabel + acceptedChunks.
    │       │       ├── rewriteQuery.ts    — LLM-rewrites the query on weak retrieval; increments retryCount.
    │       │       ├── generateAnswer.ts  — LLM answer grounded on acceptedChunks (terminal).
    │       │       └── fallback.ts        — deterministic escalation string; no LLM call (terminal).
    │       │
    │       ├── llm/
    │       │   ├── types.ts    — ChatProvider interface + ChatMessage / ChatRequest / ChatResult types.
    │       │   ├── openai.ts   — createOpenAIChatProvider(): lazy OpenAI client w/ timeout + retries, AbortSignal-aware.
    │       │   └── index.ts    — getChatProvider() memoized singleton.
    │       │
    │       ├── grader/
    │       │   ├── types.ts     — ContextGrader interface, ContextVerdict, RelevanceLabel ("good" | "weak" | "none").
    │       │   └── heuristic.ts — createHeuristicGrader(): score-threshold grader (LLM grader is a planned follow-up).
    │       │
    │       ├── prompts/
    │       │   ├── systemPrompt.ts — buildSystemPrompt(acceptedChunks): grounded-answer system prompt.
    │       │   └── rewriteQuery.ts — buildRewritePrompt({…}): query-rewrite system + user prompts.
    │       │
    │       └── persistence/
    │           └── trace.ts    — openTrace / flushSteps / writeRetrievedContexts / finalizeTrace; runs at the entrypoint, never in nodes.
    │
    ├── portfolio-content/      — single source of truth for portfolio copy (used by web + seeder).
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts        — barrel re-export.
    │       ├── bio.ts          — bio paragraphs (incl. stack paragraph used by the skills doc).
    │       ├── contact.ts      — email, GitHub, LinkedIn, resume path.
    │       ├── demos.ts        — metadata for demo pages.
    │       ├── identity.ts     — greeting, full name, tagline.
    │       ├── projects.ts     — project list rendered on the site AND seeded into the knowledge base.
    │       └── siteMetadata.ts — site-wide metadata (title, description).
    │
    ├── eslint-config/          — shared ESLint flat-config presets.
    │   ├── package.json
    │   ├── README.md
    │   ├── base.js             — base preset (JS/TS).
    │   ├── next.js             — Next.js preset (extends base).
    │   └── react-internal.js   — preset for internal React packages.
    │
    └── typescript-config/      — shared tsconfig presets.
        ├── package.json
        ├── base.json           — common compiler options.
        ├── nextjs.json         — Next.js extension.
        └── react-library.json  — React library extension.
```

## How to read the tree quickly

- **★ marks the knowledge pipeline.** Trace it top-to-bottom: `seed-knowledge-data.ts` → `seed-knowledge.ts` → (`chunking.ts` + `documents.ts` + `embeddings/openai.ts` + `chunks.ts`) → at query time, `retrieve.ts` → smoke-checked by `smoke-retrieval.ts`. The schemas they all speak through live in `packages/contracts/src/knowledge.ts`.
- **`packages/agent/`** sits on top of the knowledge pipeline. Trace it from the entrypoint: `runAgent` (`src/runAgent.ts`) → graph (`src/graph/index.ts` + nodes) → `deps.retrieve` (wraps `retrieveChunks()`) and `deps.chatProvider` (OpenAI) → trace persistence (`src/persistence/trace.ts`). The high-level shape lives in `docs/architecture.md` under "Agent core"; smoke-checked by `scripts/smoke-agent.ts`.
- **`apps/api/`** is the HTTP boundary in front of the agent. Trace it: `server.ts` → `buildApp` (`src/app.ts`) → `POST /chat` (`src/routes/chat.ts`) → `handleChat` (`src/services/chatService.ts`) → conversation + user Message rows → `runAgent` → assistant Message row + `AgentTrace.assistantMessageId` back-fill. Errors are normalized to `ErrorResponseSchema` by the central error handler in `app.ts`; smoke-checked by `scripts/smoke-chat.ts`.
- **`apps/web/`** is the public-facing Next.js site. It renders `@portfolio/content` directly; the knowledge pipeline reads that same package so the bot stays in sync with the site.
- **`packages/db/src/generated/prisma/`** is auto-generated — never edit by hand; it gets blown away by `prisma generate`.
- **Shared configs** (`eslint-config`, `typescript-config`) keep all packages on the same lint/TS settings without duplication.
