Implement the production-ready frontend version of the floating AI assistant widget based on the approved Claude Design output.

Goal:
Turn the approved “Ask David / David Agent” design into a real, reusable, maintainable portfolio feature connected to the existing API layer.

Context:
This is a portfolio-integrated AI assistant. It should appear globally across the site as a floating chat widget, not as a separate page. The backend (`apps/api`) and shared wire contracts (`@portfolio/contracts`) already exist; the widget must consume them rather than invent parallel shapes or mock responses.

Scope:
Frontend implementation and API client integration only.

Do not implement LangGraph.
Do not modify database code.
Do not modify Prisma schema.
Do not modify `@portfolio/agent` or `apps/api` unless a missing field in `@portfolio/contracts` is genuinely blocking. If that happens, stop and surface it before changing the contract.
Additive edits to `@portfolio/content` are allowed (e.g. adding a WhatsApp number to `contact.ts` for the `/whatsapp` slash command). Do not restructure or rename existing exports.
Do not implement Twilio.
Do not add Kubernetes/AWS/deployment code.
Do not introduce unnecessary dependencies.
Do not replace the existing design system.

Use the approved design:

- The approved design currently lives only at the Claude Design URL referenced when this prompt was created; there are no local design files in the repo yet. Open the rendered `index.html` from that URL and translate it into real components — do not invent a different visual direction.
- Preserve the visual direction as much as possible (layout, spacing, typography choices, motion language, color treatment).
- Refactor only where needed for production-quality component structure, state handling, accessibility, API integration, and future extensibility.
- Any deviation from the design must be deliberate and called out in the post-implementation summary.

Feature naming:

- Floating entry point: “Ask David”
- Expanded assistant name: “David Agent”

Primary behavior:

- The widget is available globally across the portfolio. Mount it once in `apps/web/app/layout.tsx` so it persists across route changes; do not remount per page.
- Because the widget is mounted in the root layout, its local React state (messages, conversationId, open/closed) survives client-side navigation for free. Do not introduce React Context, Zustand, Redux, or any cross-tree state container for this widget.
- The collapsed launcher appears near the bottom-right.
- On desktop, it opens into a polished floating chat panel/card.
- On mobile, it opens into a comfortable mobile chat surface, such as a bottom sheet, drawer, or modal-like panel.
- Users can type a message, send it, see loading state, receive a real response from the API, and continue the conversation.
- Silkscreen *is* used inside the widget — for the trigger label ("ASK DAVID") and the header name ("DAVID AGENT"). This is a deliberate retro display accent and not limited to the hero.

WhatsApp has three converging surfaces (not just a slash command):

- A header icon button (always visible inside the panel).
- A persistent line between the scroll region and the composer, visible across every state (empty, conversation, typing, error, mobile). Copy adapts: "Continue there" when the conversation is empty, "Continue this chat there" once there are messages.
- The `/whatsapp` slash command.

All three open the same `wa.me` deep link, built from `contact.whatsappNumber` in `@portfolio/content` — define the href once and reuse it; do not duplicate URL construction across surfaces. `/twilio` is dropped entirely from the slash command registry.

Global `/` keyboard shortcut:

- Pressing `/` anywhere on the site (when no `INPUT`/`TEXTAREA` is focused) opens the widget. The trigger pill displays a `/` kbd hint badge that advertises this shortcut. Escape closes the widget (Radix Dialog handles this for free).

API integration:

Transport — use a same-origin Next.js Route Handler as a thin proxy, not a direct cross-origin call:

- Add `apps/web/app/api/chat/route.ts` that forwards `POST` bodies to `${AGENT_API_URL}/chat` and returns the upstream response. The route handler is intentionally dumb: no auth, no transformation, no business logic. This mirrors the existing `apps/web/app/api/contact/route.ts` pattern, keeps the browser same-origin (no CORS to configure), and hides the Fastify origin from clients. The response is JSON, not streaming — do not introduce SSE/`text/event-stream` plumbing in the proxy.
- The browser-side client always calls `/api/chat` (relative). It never reads `AGENT_API_URL` and there must be no `NEXT_PUBLIC_AGENT_API_URL`.
- Add `AGENT_API_URL` to `apps/web/.env.local.example` with a comment explaining it points at `apps/api` (default `http://127.0.0.1:3001` in local dev).

Contracts — use the shared wire schemas, do not redeclare them:

- The request body must be `ChatRequest` from `@portfolio/contracts` (`packages/contracts/src/chat.ts`). The success response must be parsed as `ChatResponse`. Error responses must be parsed as `ErrorResponse` from `@portfolio/contracts/src/errors.ts`.
- `channel` is always `"web"` from this client. You may rely on the schema default rather than passing it explicitly, but be consistent.
- If the UI needs view-model shapes (e.g. a `ChatMessage` with `id`, `role`, `status`, `createdAt`), define them separately in the web app. Do not leak `ChatResponse`/`AgentSource` directly into render props — normalize at the client boundary.

Client shape:

- Expose a single function (or small hook) such as `sendAgentMessage(input): Promise<ChatResponse>` — synchronous request/response only. The current API is JSON, not streaming; do not preemptively design around `AsyncIterable`, `ReadableStream`, SSE, or WebSocket. Streaming will be a future, deliberate change to both the API and this boundary.
- The client owns: serializing the `ChatRequest`, calling `/api/chat`, parsing the body, validating it against `ChatResponseSchema` (or `ErrorResponseSchema` on non-2xx), and surfacing errors as typed values rather than thrown strings.
- UI components must never call `fetch` directly. All network access for the assistant goes through this one boundary.

Error handling:

- Branch on `ErrorResponse.code` — the closed set is `validation_error | conversation_not_found | agent_failure | internal_error`. At minimum: on `conversation_not_found`, drop the stale `conversationId` and let the next send start a fresh conversation; on `validation_error`, surface a “message couldn’t be sent” state without retrying; on `agent_failure` / `internal_error`, surface a retryable error state.
- Do not silently swallow errors. Do not show raw error JSON. Do not block the user from typing a new message after an error.

Do not hardcode assistant responses in the UI.

Conversation behavior:

- Maintain local chat state in the widget — plain React state in the widget component, not a global store.
- `conversationId` is **in-memory only**. It persists across client-side route changes (because the widget is layout-mounted) but resets on full page refresh or new tab. Do not write it to `localStorage`, `sessionStorage`, cookies, or URL params.
- If the API returns a `conversationId`, store it and include it in every subsequent `sendAgentMessage` call until the conversation is reset (by a `conversation_not_found` error, or by a refresh). This slice does not include a user-facing "Start new conversation" affordance — do not add one.
- Append user messages immediately (optimistic).
- Show assistant loading/typing state while awaiting the API response.
- Append assistant response on success.
- Show graceful error state on failure, with a retry affordance if practical.
- Avoid duplicate sends while a message is in flight.
- Render each assistant message as its own bubble. Do not bake assumptions about its text being immutable post-render (a future streaming change should be able to swap the bubble's text source), but do not introduce any streaming machinery — no `AsyncIterable`, no `ReadableStream` parsing, no incremental-text state.

Slash command palette (client-side only):

The widget exposes a `/` command palette purely as a UI affordance. These are **not** agent capabilities — the agent must remain unaware they exist. Treat them like Slack / Discord / Notion slash commands or a VS Code command palette: shortcuts that the client interprets and dispatches, not tools the LLM picks.

Hard rules:

- Do not extend `@portfolio/contracts` for slash commands. Do not add a `skill`, `command`, or equivalent field anywhere on the wire.
- Do not include a slash-command id in `ChatRequest.metadata`, not even "just for analytics." Once it's on the wire the contract owns it, and the agent will eventually start branching on it.
- A `kind: 'prompt'` command simply seeds a normal user message and sends it through the unchanged `/chat` flow. From the API's perspective it is indistinguishable from the user typing the same text by hand.
- The registry is **data, not a component**, so it lives under `apps/web/model/` (e.g. `apps/web/model/slashCommands.ts`), matching the existing convention set by `apps/web/model/ContactFormData.ts`. It is never promoted to `@portfolio/contracts` or any shared package — these are UI affordances, not domain concepts.

Shape — discriminated union by `kind`:

```ts
type SlashCommand =
  | { command: string; label: string; description: string; kind: 'prompt';   prompt: string }
  | { command: string; label: string; description: string; kind: 'navigate'; href: string }
  | { command: string; label: string; description: string; kind: 'external'; href: string };
```

- `command` is the literal string the user types (e.g. `"/stack"`). It IS the unique key — there is no separate `id` field. Must start with `/`.
- `kind: 'prompt'` — `prompt` is the canned text seeded into the composer and sent through the normal chat flow.
- `kind: 'navigate'` — `href` is an internal route, opened via Next.js `Link` / `router.push`.
- `kind: 'external'` — `href` is an absolute URL opened in a new tab with `rel="noopener noreferrer"`.

Content sources — URLs and contact details (WhatsApp number, resume path, contact email, internal section anchors) must come from `@portfolio/content`. Do not hardcode them in the registry; the content package is the single source of truth.

Initial set (five entries — `/twilio` is dropped):

- `/projects` — `kind: 'navigate'`, href `"/about#projects"`.
- `/stack` — `kind: 'prompt'`, prompt: `"What is David's technical stack?"`.
- `/leadership` — `kind: 'prompt'`, prompt: `"Tell me about David's leadership experience."`.
- `/contact` — `kind: 'navigate'`, href: `"/contact"`.
- `/whatsapp` — `kind: 'external'`, href: WhatsApp deep link (`https://wa.me/<number>`) built from `contact.whatsappNumber` in `@portfolio/content`. The content package owns the number; do not inline it in the registry. The same href is reused by the header WhatsApp button and the persistent WhatsApp line — see the "WhatsApp has three converging surfaces" subsection above.

Behavior:

- Typing `/` opens a filtered list of matching commands from the registry. Filter by substring on `command` and `label`.
- Selecting a command:
  - `kind: 'prompt'`: send immediately as a normal chat message (so the shortcut feels like a click-to-ask). The composer may briefly show the seeded text, then submit.
  - `kind: 'navigate'`: close the panel and push the route.
  - `kind: 'external'`: open the URL in a new tab. Leave the panel open so the user can come back.
- Unknown slash commands (e.g. user types `/asdf` and hits enter) are sent to the agent as plain text — the agent already handles arbitrary input. Do not show an error, do not "graceful fallback" with a UI message; just send the text.
- Suggested-prompt chips in the welcome/empty state render from a separate `suggestedPrompts` list (`apps/web/model/suggestedPrompts.ts`) whose entries are `{ label; commandRef? }`. Chips with a `commandRef` dispatch through the slash command path (so `/stack`, `/projects`, etc. behave identically whether triggered from a chip or the slash popover); chips without a `commandRef` send the `label` as plain user text. The list is not required to be 1:1 with the slash registry.

Component expectations:
Use the existing repo conventions. Choose names that fit the current component structure (`apps/web/components/common/*`).

Prefer a clean decomposition such as:

- FloatingAIChat / DavidAgentWidget
- ChatLauncher
- ChatPanel
- ChatHeader
- ChatMessageList
- ChatMessageBubble
- ChatComposer
- SuggestedPrompts
- CommandSuggestions
- slash command registry (UI-only; see the "Slash command palette" section above)
- agent chat API client / hook

Do not over-split if the repo conventions suggest a simpler structure, but keep the code readable and extensible.

UI states:
The widget should support:

- collapsed state
- expanded state
- welcome/empty state
- user message
- assistant message
- loading/typing state
- API error/fallback state
- slash command suggestions
- mobile open state

Accessibility:

- Keyboard-accessible open/close behavior.
- Proper labels for icon-only buttons (`aria-label` on the launcher, close button, send button, etc.).
- Focus management when opening the chat (move focus into the panel; restore focus to the launcher on close).
- Escape key closes the widget if appropriate.
- The message list must be an `aria-live="polite"` region so screen readers announce new assistant messages without interrupting the user.
- Loading/typing state must be announced to assistive tech (e.g. `aria-busy` on the message list, or a visually-hidden status node), not just shown visually.
- Composer is usable with keyboard.
- Enter sends message.
- Shift+Enter creates a newline if multiline input is used.
- Comfortable touch targets on mobile.
- Visible focus states.

Mobile requirements:

- The collapsed entry point should remain reachable near bottom-right.
- Expanded chat should use an appropriate amount of viewport height.
- Composer should remain usable on mobile.
- Avoid horizontal overflow.
- Avoid covering critical navigation awkwardly.
- The experience should feel intentionally designed for mobile, not just resized desktop UI.

Styling:

- Use the existing design system, primitives, tokens, typography, spacing, colors, borders, shadows, and motion patterns.
- Preserve the approved Claude Design direction.
- Avoid generic SaaS chatbot aesthetics.
- Avoid making it feel like a third-party plugin.
- Do not install a heavy UI library. Existing deps already cover everything needed: Radix Dialog (panel/sheet primitive), framer-motion (motion), react-feather (icons), react-markdown (assistant message rendering), tailwind-merge / tailwindcss (styling).

Future integration readiness:
The client boundary should be easy to *replace* later, not pre-built for futures. Keep the public surface of the client (`sendAgentMessage`) narrow enough that swapping its internals later is a contained change. Do not add the following speculatively:

- streaming responses (no `AsyncIterable`, `ReadableStream`, SSE, or WebSocket wiring),
- persisted conversations beyond the in-memory `conversationId`,
- additional slash-command `kind`s beyond `prompt | navigate | external`,
- Twilio handoff (the `/whatsapp` shortcut is a simple deep link, not an inbound-message bridge),
- source display UI,
- trace/debug metadata panels.

Each of those will be a deliberate future change; building scaffolding for them now is out of scope.

Quality requirements:

- Strict TypeScript.
- Avoid `any`.
- Prefer existing contracts and schemas where available — specifically `ChatRequestSchema`, `ChatResponseSchema`, and `ErrorResponseSchema` from `@portfolio/contracts`.
- Keep API request/response normalization explicit at the client boundary.
- Keep components reusable.
- Keep error handling visible and simple.
- Do not silently fail.
- Do not create unrelated refactors.
- Do not duplicate slash command definitions across components — the registry is the single source.
- Keep the implementation easy to review.

Acceptance criteria:

- The floating widget appears globally across the portfolio, mounted in `apps/web/app/layout.tsx`.
- The collapsed launcher works.
- The expanded chat works on desktop.
- The expanded chat works well on mobile.
- The empty-state suggested-prompt chips render from a `suggestedPrompts` list which may reference slash commands by `commandRef` but is not required to be 1:1 with the slash registry. Chips with a `commandRef` dispatch through the same code path as the slash popover.
- The slash command registry lives under `apps/web/` only; no changes to `@portfolio/contracts`, no shortcut id on the wire, no entry in `ChatRequest.metadata`.
- Sending a message calls the real existing API via the `apps/web/app/api/chat/route.ts` proxy, which forwards to `${AGENT_API_URL}/chat`.
- Wire shapes match `ChatRequestSchema` / `ChatResponseSchema` / `ErrorResponseSchema` from `@portfolio/contracts` — verified by TypeScript and by runtime parsing at the client boundary.
- API loading state is visible and announced to assistive tech.
- API success response renders as an assistant message.
- API error response renders a graceful fallback/error UI, with branching on `ErrorResponse.code` (at minimum: `conversation_not_found` clears the stored `conversationId`).
- `conversationId` is preserved in-memory across messages and route changes, and reset on page refresh — never written to storage.
- `kind: 'navigate'` and `kind: 'external'` shortcuts dispatch client-side (route push / new-tab open) and do not call `/chat`.
- Existing portfolio pages remain visually intact.
- `pnpm lint` and `pnpm check-types` (or the repo’s equivalent) pass with no new warnings.

After implementation:

1. Show the files created or modified.
2. Explain where the widget was mounted globally (and confirm it is mounted exactly once).
3. Explain the component structure.
4. Explain the slash command registry — its location under `apps/web/`, its `SlashCommand` discriminated union, and confirm no part of it is shared with `@portfolio/contracts` or sent to the API.
5. Explain how slash commands and welcome-state suggested-prompt chips both consume the same registry, and how each `kind` is dispatched (`prompt` → normal chat send, `navigate` → router push, `external` → new tab).
6. Explain how the frontend calls the real API, including the proxy route and `AGENT_API_URL` env var.
7. Explain how `conversationId`, loading, success, and error states are handled (including which `ErrorResponse.code`s are branched on).
8. Mention any design compromises made from the approved design, if any.
