# Architecture

## Provider-agnostic channel model

The portfolio AI assistant must remain free to add new communication channels
(web chat, Slack, email, Telegram, additional SMS providers, custom integrations)
without rewiring its core. To preserve that flexibility, **Twilio is treated as
an edge adapter, not as a core domain concept.**

The contract layer in `packages/shared` makes this split explicit:

- **At the boundary** (Twilio webhook endpoints), raw Twilio payloads are
  validated with Twilio-specific Zod schemas:
  - `TwilioInboundMessageSchema`
  - `TwilioStatusCallbackSchema`

  These live in `packages/shared/src/twilio.ts` and are the **only** place where
  Twilio-specific field names (`MessageSid`, `From`, `Body`, `WaId`, …) appear.

- **After validation**, payloads are normalized into provider-agnostic models
  defined in `packages/shared/src/channel.ts`:
  - `ChannelEvent` — a unified record of any inbound/outbound channel activity
  - `InboundChannelMessage` — a normalized inbound message ready for the app to
    process
  - `OutboundChannelStatus` — a normalized delivery/status callback

  Shared primitives and enums (`Channel`, `ChannelProvider`, `Metadata`,
  `ISODateString`, …) live in `packages/shared/src/common.ts` so they can be
  reused by chat, agent, and persistence contracts.

- **The rest of the system** (`apps/api` orchestration, `apps/worker`,
  `packages/agent`, downstream DB writes) works only with the agnostic models.
  Adding a new provider — Slack, email, Telegram — requires writing a new edge
  adapter and a new normalization step; no code in the core domain has to
  change.

This preserves a clean separation:

- `packages/shared` — contracts (Zod schemas + TS types)
- `packages/db` — persistence
- `packages/agent` — intelligence / RAG workflow
- `apps/api` — orchestration + HTTP/Twilio boundary
- `apps/web` — user experience

`packages/db/prisma/schema.prisma` defines a provider-agnostic `ChannelEvent`
model that matches the shared `ChannelEvent` contract — persistence and
contracts share the same vocabulary, and Twilio (or any other provider) lives
only in edge-adapter code, not in the core schema.
