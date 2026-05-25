# Plan — Connect web chat UI to the agent API

## Context

`apps/api` (Fastify) and `@portfolio/contracts` (`ChatRequestSchema` / `ChatResponseSchema` / `ErrorResponseSchema`) are already shipped and smoke-tested. `apps/web` (Next.js 16, React 19, Tailwind v4) has no AI surface yet. The goal is a globally-mounted floating "Ask David / David Agent" widget that calls the existing API, plus a UI-only slash command palette and two dedicated WhatsApp handoff surfaces.

The Claude Design bundle was extracted from the URL referenced in `docs/05-connect-web-chat-ui.prompt.md` — full design fidelity is now known (trigger pill, 380×580 card with sky→fuchsia hairline gradient, header with BETA pill, persistent WhatsApp line, etc.). The implementer should refer back to `/tmp/design-extract/floating-ai-chat-card/project/chat-widget.jsx` for the source of truth on motion, dimensions, and copy.

Why multi-phase: boundary plumbing, visual fidelity, and a11y/mobile polish have different risk profiles. Splitting lets the visual direction be reviewed and adjusted on its own diff before mobile rework piles on.

## Decisions locked during planning (override `docs/05-connect-web-chat-ui.prompt.md` where they conflict)

These overrides emerged from reading the design and resolving conflicts with the prompt's prior decisions. **Phase A includes updating `docs/05-connect-web-chat-ui.prompt.md` to reflect them.**

- **WhatsApp has three converging surfaces, not just a slash command.** A header icon button (always visible), a persistent line *between the scroll region and the composer* (visible across every state — empty, conversation, typing, error, mobile), and a `/whatsapp` slash command. All three open the same `wa.me` deep link. The persistent line's copy adapts: "Continue there" when empty, "Continue this chat there" when there are messages.
- **`/twilio` is dropped entirely** from the slash command registry. The "Why Twilio?" suggested-prompt chip remains as a plain text question (no command ref).
- **Suggested prompts are a separate list, not derived 1:1 from the slash registry.** New file: `apps/web/model/suggestedPrompts.ts` with `{ label; commandRef?: string }`. Chips with a `commandRef` dispatch via the slash command path; chips without dispatch send the label as plain text. This relaxes the prompt's "no parallel hardcoded lists" rule.
- **Global `/` keyboard shortcut is in scope (Phase B).** Pressing `/` anywhere on the site (when no input/textarea is focused) opens the widget. The trigger pill displays a `/` kbd hint badge that this shortcut advertises. Escape closes (Radix Dialog handles this).
- **Silkscreen is used inside the widget** — for the trigger label ("ASK DAVID") and the header name ("DAVID AGENT"). The prompt previously said "do not introduce Silkscreen — it's hero-only"; that's wrong, the design uses it deliberately for the retro display flavor.
- **SlashCommand shape includes a `description` (= design's `hint`)** but **no `id` field** — `command` IS the unique key. The design's `tag` field is not load-bearing; omit it.

## Other locked decisions (carried over from `docs/05`, unchanged)

- **Transport:** same-origin Next.js Route Handler at `apps/web/app/api/chat/route.ts` proxying to `${AGENT_API_URL}/chat`. Server-only env var; no `NEXT_PUBLIC_*`; no CORS.
- **Wire contracts:** `ChatRequest` / `ChatResponse` / `ErrorResponse` imported from `@portfolio/contracts`. No contract churn.
- **Conversation:** `conversationId` is in-memory only. No localStorage / sessionStorage / cookie. No user-facing "new conversation" affordance.
- **State:** plain React state inside the widget; widget is mounted once in `apps/web/app/layout.tsx`. No Context / Zustand / Redux.
- **Slash commands:** UI-only data under `apps/web/model/slashCommands.ts`. Never sent to the API in any form (not even in `metadata`). Never promoted to `@portfolio/contracts`.
- **Streaming:** out of scope. No `AsyncIterable` / `ReadableStream` / SSE in the client or the proxy.

## Critical files / patterns to reuse (not reinvent)

- **Contracts:** `packages/contracts/src/{chat,agent,errors,common}.ts` — re-exported from `packages/contracts/src/index.ts`. Use these directly.
- **API endpoint being proxied:** `apps/api/src/routes/chat.ts`.
- **Where the widget mounts:** `apps/web/app/layout.tsx`.
- **Design tokens (already perfect match):** `apps/web/app/globals.css` — Tailwind v4 `@theme` with `--color-primary` (sky), `--color-secondary` (fuchsia), `--color-neutral`, custom utilities `neon-*`, `retro-button-*`, `bg-boxes-*`, animations `overlayShow` / `contentShow`. New animations `cwPop`, `cwSheet`, `cwBlink` will be added in Phase B.
- **Dialog primitives:** `apps/web/components/common/Dialog/*` — Radix wrappers (Root, Trigger, Portal, Overlay, Content). `apps/web/components/common/Modal/Modal.tsx` shows the `onOpenAutoFocus={(e)=>e.preventDefault()}` pattern worth reusing.
- **Existing primitives:** `apps/web/components/common/{Button,Card,Section,Typography,Slot,Highlight,Box}/` — reuse rather than reimplement. Note `Button` already supports `variant: 'primary' | 'secondary' | 'demoted'`.
- **API hook convention:** `apps/web/hooks/api/useContact.ts` shows the folder convention. **Do not mirror its error handling** — it swallows errors via callbacks and never validates the response shape. The new agent client will validate with Zod and throw typed errors.
- **Proxy route convention:** `apps/web/app/api/contact/route.ts` (currently a 501 stub) shows where the proxy file goes.
- **Model folder:** `apps/web/model/ContactFormData.ts` — convention for typed data shapes. Both `slashCommands.ts` and `suggestedPrompts.ts` go here.
- **Utils folder:** `apps/web/utils/{fonts,mergeProps}.ts` — convention for small utility modules. The plain `sendAgentMessage` function and `AgentClientError` class go here.
- **Content source:** `packages/portfolio-content/src/contact.ts` currently exports `email`, `github`, `linkedin`, `twitter`, `resumePath`. Will additively gain `whatsappNumber: string` in Phase A.
- **About page:** `apps/web/app/about/page.tsx:101` — where `projects` is rendered. Gets an `id="projects"` anchor in Phase A so `/projects` slash command can target `/about#projects`.
- **Profile image:** `apps/web/public/profile.jpg` — exists, used by trigger pill and header avatar.

Existing deps cover everything — **no installs needed**:

- `@radix-ui/react-dialog` (panel + sheet primitive)
- `framer-motion` (motion; already used by `components/common/Card`)
- `react-feather` (icons)
- `react-markdown` (assistant message rendering with inline `**bold**` and `/cmd` code spans)
- `tailwind-merge` + `clsx` (class composition)
- `zod` (transitively via `@portfolio/contracts`)

---

## Visual fidelity protocol (load-bearing for Phases B and C)

The design contains ~900 lines of inline styles with exact pixel values, half-pixel font sizes (13.5px, 11.5px, 10.5px), multi-stop box-shadows, specific rgba gradients, and verbatim copy strings. Translating those to "the nearest Tailwind token" is where 1:1 fidelity dies. The default mode for Phase B and C is **literal port first, idiomize second** — never the other way around.

### Rule 1 — Run the design prototype side-by-side with the dev build

The design at `/tmp/design-extract/floating-ai-chat-card/project/index.html` is a self-contained React + Babel page; no build needed — just `open` it. Run `pnpm --filter web dev` in the other half of the screen. Every component built must be visually compared against the design before moving on. The design's `app.jsx` exposes seeded states (`<ChatWidget seed="welcome" />`, `seed="conversation"`, `seed="typing"`, `seed="slash"`, `seed="error"`, `seed="closed"`, `mobile`) so each Phase B / C deliverable has a pinned target to diff against.

Phase B is not "done" until every seeded state in the design has a matching state in the real widget that visually agrees.

### Rule 2 — Port styles literally first; refactor to Tailwind second

For each component in Phase B, mirror the corresponding `cwStyles` entry from `chat-widget.jsx` verbatim. Two acceptable shapes:

- **Tailwind arbitrary values** for one-off values: `w-[380px] h-[580px] text-[13.5px] tracking-[0.04em] rounded-[16px] shadow-[0_18px_40px_-18px_rgba(217,70,239,0.55)]`.
- **A co-located `styles.ts`** exporting style objects with the same names as `cwStyles` (e.g. `triggerStyle`, `cardFrameStyle`, `headerStyle`), applied via the `style={}` prop where Tailwind arbitrary values would get unreadable.

Do **not** pre-translate to nearest tokens during the initial port. `bg-fuchsia-700/20` is not a substitute for `rgba(217,70,239,0.18)` (the design's value resolves to ~`rgba(161,28,175,0.x)` — visibly different). After the side-by-side diff shows parity, idiomize *only* where token-equivalents are exact:

- `var(--color-primary-500)` → `bg-primary-500` ✓ (exact)
- `var(--color-secondary-700)` → `border-secondary-700` ✓ (exact)
- `rgba(217,70,239,0.18)` → `bg-fuchsia-700/20` ✗ (approximate — keep the rgba)
- `13.5px` → `text-sm` ✗ (drift from 14px) — keep `text-[13.5px]`
- `cubic-bezier(0.16, 1, 0.3, 1)` → `ease-out` ✗ (different curve) — keep via `--ease-soft`

### Rule 3 — Lift non-token values into CSS custom properties in `globals.css`

Multi-stop shadows, gradient frames, and other magic values that appear more than once go into `globals.css` as `@theme` custom properties or `:root` variables, then get referenced via `shadow-[var(--cw-shadow-trigger)]` etc. Concretely, define at minimum:

- `--cw-shadow-trigger` — the three-layer pill shadow.
- `--cw-gradient-frame` — the 160deg sky→fuchsia hairline gradient used by both desktop card and mobile sheet.
- `--cw-shadow-panel` — the desktop panel's drop+halo combo.
- `--cw-dot-glow` — the typing dot box-shadow.

This keeps the magic values in one auditable file rather than stringly-typed across a dozen components, and makes any future tweak a single edit.

### Rule 4 — Verify with a forked agent at the end of Phase B and Phase C

Same approach the design itself used (visible in `chats/chat1.md` as "fork_verifier_agent"). Spawn an `Explore` or general-purpose subagent with:

- the design's `chat-widget.jsx` and corresponding seeded state in `app.jsx`,
- the real implementation files, and
- explicit instructions to spot visual diffs (dimensions, colors, shadows, animations, copy, layout).

Cheap, parallelizable, and catches the drift the implementer's eye has normalized to.

### Rule 5 — Copy strings are immutable

All user-visible text in the design is final and load-bearing for tone. Extract verbatim into a co-located `strings.ts` (or read inline from this list), do not paraphrase:

- Trigger label: `Ask David` (Silkscreen, uppercase via CSS).
- Trigger sub-labels: `David Agent · online` (desktop), `tap to chat` (mobile).
- Trigger aria-label: `Open David Agent — Ask David anything about David Bautista`.
- Header name: `David Agent` (Silkscreen).
- Header badge: `BETA`.
- Header sub-text: `Ask about my projects, stack, experience, or leadership.`
- Header WhatsApp aria-label (empty): `Start this conversation on WhatsApp`.
- Header WhatsApp aria-label (active): `Continue this conversation on WhatsApp`.
- Header close aria-label: `Close chat`.
- Empty-state title: `— Hi, I'm David's agent —` (em-dashes, fuchsia-400).
- Empty-state body: `I've read every line of his portfolio. Ask me about his stack, projects, or leadership — or fire off a slash command.`
- Suggested-prompts divider: `try one of these`.
- Slash popover header: `Skills · pick one to run a command`.
- Composer placeholder: `Ask David anything…  (try / for skills)` (two spaces before the parenthetical).
- Composer footer left: `Enter to send · Shift+Enter for newline`.
- Composer footer right: `agent online` (with a green dot before it).
- Typing caption: `thinking…`.
- Error title: `The agent took a coffee break.`
- Error body: `Couldn't reach David's brain just now — that's on me, not you. Try again, or just email david@davidbautista.co.` — pull the email from `@portfolio/content`.
- Error retry button: `Retry`.
- WhatsApp line left: `Prefer WhatsApp?` (with the WhatsApp glyph before it).
- WhatsApp line right (empty): `Continue there →`.
- WhatsApp line right (active): `Continue this chat there →`.

These are the brand voice — first person, em-dashes, dry self-aware tone. Don't generate variants.

---

## Phase A — Plumbing & data (no UI changes)

**Goal:** Working `/api/chat` proxy exercisable via `curl`, slash command + suggested prompt registries compiled, `/about#projects` anchor in place, `whatsappNumber` added to `@portfolio/content`, and `docs/05` updated to reflect the planning decisions. No React widget yet.

**Files to create:**

1. **`apps/web/app/api/chat/route.ts`** — dumb proxy. Reads `process.env.AGENT_API_URL`. Forwards `POST` body to `${AGENT_API_URL}/chat`. Returns the upstream JSON status + body unchanged. No auth, no transformation, no business logic. If `AGENT_API_URL` is unset, returns 500 with a clear server log (do not silently 200). JSON only; do not introduce SSE / `text/event-stream`.

2. **`apps/web/utils/agentClient.ts`** — exports `sendAgentMessage(input: ChatRequest): Promise<ChatResponse>` and `AgentClientError` class. Internals:
   - `fetch('/api/chat', { method: 'POST', body: JSON.stringify(input), headers: { 'content-type': 'application/json' } })`.
   - On 2xx: `ChatResponseSchema.parse(await res.json())`, return.
   - On non-2xx: `ErrorResponseSchema.parse(await res.json())`, throw `new AgentClientError({ code, message, details? })`.
   - On network failure / JSON parse failure / schema mismatch: throw `new AgentClientError({ code: 'internal_error', message })` with the original wrapped via `Error.cause`.
   - This is the single seam for all chat network access — UI components never call `fetch` directly.

3. **`apps/web/model/slashCommands.ts`** — discriminated union and array:

   ```ts
   export type SlashCommand =
     | { command: string; label: string; description: string; kind: 'prompt';   prompt: string }
     | { command: string; label: string; description: string; kind: 'navigate'; href: string }
     | { command: string; label: string; description: string; kind: 'external'; href: string };

   import { contact } from '@portfolio/content';

   export const slashCommands: readonly SlashCommand[] = [
     { command: '/projects',   label: 'Projects',   description: "Browse what I'm proud of",          kind: 'navigate', href: '/about#projects' },
     { command: '/stack',      label: 'Stack',      description: 'My tech stack & tools',             kind: 'prompt',   prompt: "What is David's technical stack?" },
     { command: '/leadership', label: 'Leadership', description: '3+ years leading Front-End teams',  kind: 'prompt',   prompt: "Tell me about David's leadership experience." },
     { command: '/contact',    label: 'Contact',    description: 'Email, LinkedIn, GitHub',           kind: 'navigate', href: '/contact' },
     { command: '/whatsapp',   label: 'WhatsApp',   description: 'Continue this chat on WhatsApp',    kind: 'external', href: `https://wa.me/${contact.whatsappNumber}` },
   ];
   ```

   `/twilio` is **not** in this list. `command` is unique (no separate `id`). The fields match the design's `cmd`/`hint` but with clearer naming.

4. **`apps/web/model/suggestedPrompts.ts`** — separate list, referenced by the empty-state chips:

   ```ts
   export interface SuggestedPrompt {
     label: string;
     commandRef?: string; // matches a slashCommands[].command
   }

   export const suggestedPrompts: readonly SuggestedPrompt[] = [
     { label: "What's David's technical stack?", commandRef: '/stack' },
     { label: "Show me David's projects",        commandRef: '/projects' },
     { label: 'What kind of engineer is David?', commandRef: undefined }, // sent as plain text
     { label: 'Tell me about his leadership',    commandRef: '/leadership' },
     { label: 'How can I contact David?',        commandRef: '/contact' },
     { label: 'Why Twilio?',                     commandRef: undefined }, // /twilio is dropped; sent as plain text
   ];
   ```

**Files to modify:**

5. **`packages/portfolio-content/src/contact.ts`** — additively add `whatsappNumber: string` (E.164, user-provided at implementation time). Re-exported through `packages/portfolio-content/src/index.ts` (the existing barrel). Do not restructure other exports.

6. **`apps/web/app/about/page.tsx`** — add `id="projects"` to the section/wrapper around line 101 where `projects.map(...)` is rendered. Smallest possible edit; do not restyle.

7. **`apps/web/.env.local.example`** — add `AGENT_API_URL=http://127.0.0.1:3001` with a comment: `# URL where apps/api is reachable; consumed only by the /api/chat proxy route (server-side; do NOT prefix with NEXT_PUBLIC_).`

8. **`docs/05-connect-web-chat-ui.prompt.md`** — update to reflect the decisions locked during planning:
   - "Initial set" of slash commands: 5 entries as above; remove the WhatsApp-as-slash-replaces-Twilio framing.
   - Add a "WhatsApp has three converging surfaces" subsection under Primary behavior (header button + persistent line + slash command, all pointing at the same `wa.me` href in `@portfolio/content`).
   - Replace the "no parallel hardcoded lists" acceptance criterion with a more permissive one: "The empty-state suggested-prompt chips render from a `suggestedPrompts` list which may reference slash commands by `commandRef` but is not required to be 1:1 with the slash registry."
   - Add a "Global `/` keyboard shortcut" item to Primary behavior.
   - Note that Silkscreen *is* used inside the widget (trigger label + header name).
   - Drop the "`SlashCommand` has `id` field" and "tag" guidance to match the simpler shape above.

**Verification (no browser yet):**

- `pnpm --filter @portfolio/content build` — confirms `whatsappNumber` export compiles.
- `pnpm --filter @portfolio/api dev` in one terminal (Fastify on `:3001`).
- `pnpm --filter web dev` in another terminal (Next on `:3000`).
- `curl -sS -X POST http://localhost:3000/api/chat -H 'content-type: application/json' -d '{"message":"hi","channel":"web"}' | jq` → 200 with `ChatResponse` shape.
- `curl -sS -X POST http://localhost:3000/api/chat -H 'content-type: application/json' -d '{"message":"hi","channel":"web","conversationId":"does-not-exist"}'` → 404 with `code: 'conversation_not_found'`.
- `curl -sS -X POST http://localhost:3000/api/chat -H 'content-type: application/json' -d '{}'` → 400 with `code: 'validation_error'`.
- Browser: visit `http://localhost:3000/about#projects` directly — projects section scrolls into view.
- `pnpm lint` + `pnpm check-types` at repo root — clean.

**Done when:** the proxy works, the client function validates both envelopes, both registries compile, `/about#projects` anchors correctly, `@portfolio/content` exposes the WhatsApp number, and `docs/05` reflects the planning decisions.

---

## Phase B — Desktop widget UI mounted globally

**Goal:** Floating widget visible on every page on desktop. User can open it via the trigger pill or by pressing `/`, send messages, see suggested-prompt chips, use slash commands, handle errors, and reach WhatsApp through any of the three converging surfaces. Mobile works (no horizontal scroll, basic responsiveness) but isn't polished — Phase C.

**Files to create — all under `apps/web/components/agent/DavidAgentWidget/`:**

1. **`index.tsx`** — root widget. Marked `"use client"`. Owns:
   - `open` state (boolean, default false)
   - `messages` array of `ChatMessage`
   - `conversationId` (string | undefined)
   - `status` (`'idle' | 'sending' | 'error'`)
   - `lastError` (`AgentClientError | undefined`)
   - The `send(text: string)` function and `dispatch(command: SlashCommand)` function (both close over the above state)
   - The global `/` keyboard listener via `useGlobalSlashShortcut`
   - Renders `<ChatLauncher />` when collapsed, `<ChatPanel />` when open.

2. **`ChatLauncher.tsx`** — the "Ask David" pill trigger. Per the design:
   - Rounded-full pill, fuchsia border with retro `border-bottom: 4px`, glassy `rgba(10,10,10,0.78)` background with `backdrop-blur`, subtle fuchsia halo via box-shadow.
   - Contents: profile avatar (32×32, rounded-full, fuchsia border) with a green pulse dot, label "ASK DAVID" in Silkscreen (uppercase, letter-spacing 0.04em), sub-label "David Agent · online" (or "tap to chat" on mobile), and a `/` kbd badge at the right.
   - Hover: lifts `-2px`, brighter border.
   - `aria-label="Open David Agent — Ask David anything about David Bautista"`.
   - Mounts as the Radix `Dialog.Trigger` so Radix handles focus restoration on close.

3. **`ChatPanel.tsx`** — the expanded panel. Wraps Radix `Dialog.Portal` / `Dialog.Content`. Desktop: 380×580, `fixed bottom-6 right-6`, 1px sky→fuchsia gradient hairline frame (`background: linear-gradient(160deg, rgba(14,165,233,0.55), rgba(217,70,239,0.6))` on a 1px-padded outer container, inner is the dark surface). Animation: `cwPop` (defined in `globals.css`) over 320ms with `var(--ease-soft)`. Composes header / scroll region / WhatsApp line / composer in flex column. **Mobile responsive behavior is best-effort in Phase B**, polish in Phase C.

4. **`ChatHeader.tsx`** — left side: avatar (34×34, rounded-8) with green status dot, "DAVID AGENT" in Silkscreen, `BETA` pill (fuchsia tinted), sub-text "Ask about my projects, stack, experience, or leadership." Right side: WhatsApp icon button (uses `WhatsAppGlyph`, opens `wa.me` href in new tab, `aria-label` adapts to whether messages exist), close X button (`aria-label="Close chat"`).

5. **`ChatMessageList.tsx`** — vertical scroll region. Auto-scrolls to bottom on new message, sending state change, or error state change (use `useLayoutEffect` checking `scrollHeight`). Renders the empty/welcome state when `messages.length === 0 && !sending && !error`, otherwise renders the thread. `aria-live="polite"` semantics are Phase C; Phase B leaves it as plain markup.

6. **`ChatMessageBubble.tsx`** — single bubble component, props `{ role: 'user' | 'assistant'; text: string; first?: boolean }`. User: primary-500 background, white text, retro `border-bottom: 3px primary-600`, max-width 88%, smaller bottom-right radius for the tail. Assistant: `bg-surface-2` (neutral-900), neutral-700 border, fg-2 text (neutral-300), smaller bottom-left radius. Assistant text rendered via `react-markdown` so `**bold**` and `` `code` `` render correctly; tighten the schema by passing a restrictive component map (no images, no headings, no lists — keep it inline). Assistant rows include the avatar on the *first* row of an assistant run only (use the `first` prop, computed by the parent based on the previous message's role).

7. **`TypingBubble.tsx`** — three fuchsia-400 dots with `cwBlink` animation (1.1s, delays 0/140/280ms) + "thinking…" caption. Same row layout as an assistant bubble (with avatar).

8. **`ErrorBubble.tsx`** — assistant-row variant with a red-tinted avatar (alert icon), title "The agent took a coffee break.", body "Couldn't reach David's brain just now — that's on me, not you. Try again, or just email david@davidbautista.co.", and a Retry button. Pulls the email from `@portfolio/content` rather than hardcoding.

9. **`ChatComposer.tsx`** — input row with: `/` icon button (left, toggles slash popover), text input (`placeholder="Ask David anything…  (try / for skills)"`), send button (right, primary-500 with retro border-bottom-3, arrow-up icon). Below the row: a footer line "Enter to send · Shift+Enter for newline" + green dot + "agent online". Send button is disabled when input is empty or `status === 'sending'`. Pressing Enter without Shift submits; Escape closes the slash popover. Phase B does single-line input behavior; full multiline + Shift+Enter newline is Phase C.

10. **`SuggestedPrompts.tsx`** — empty/welcome state. Renders the title `— Hi, I'm David's agent —` (em-dashes in fuchsia-400), the body "I've read every line of his portfolio. Ask me about his stack, projects, or leadership — or fire off a slash command.", a divider with "try one of these", and the 6 chips from `suggestedPrompts`. Each chip: if `commandRef` resolves to a slash command, click dispatches that command (via the same `dispatch()` function the slash popover uses); otherwise click sends the `label` as plain text. Chips with a `commandRef` show the `command` text in a small code pill on the right.

11. **`CommandSuggestions.tsx`** — slash popover anchored above the composer (`bottom: calc(100% - 4px)`). Header label "Skills · pick one to run a command". Rows are a grid `[command code] [description] [kind tag]` (the `kind` itself is fine as the right-side tag — `prompt | navigate | external`). Hover: fuchsia-tinted background. Reads from `slashCommands`. Filters by substring match on `command` and `label` when the composer has text starting with `/`. Phase B does click-only; keyboard nav is Phase C.

12. **`WhatsAppLine.tsx`** — the persistent line between scroll region and composer. Layout: `[wa glyph] Prefer WhatsApp?  Continue [this chat] there →`. Border-top neutral-800, subtle green gradient background tint. Copy adapts: "Continue there" when messages.length === 0 && !sending && !error, else "Continue this chat there". Click opens the `wa.me` href (pulled from `@portfolio/content`) in a new tab.

13. **`WhatsAppGlyph.tsx`** — inline SVG of the WhatsApp glyph, exactly as in the design (`#25D366` fill). Props: `size`, `color` (default `#25D366`). `aria-hidden="true"`. The brand green is contained *only* to the glyph — surrounding chrome stays in the portfolio palette.

14. **`dispatchSlashCommand.ts`** — pure function `dispatchSlashCommand(cmd: SlashCommand, ctx: { router, send, closePanel }): void`. Switches on `kind`:
    - `'prompt'` → `ctx.send(cmd.prompt)` (sends immediately as a normal chat message).
    - `'navigate'` → `ctx.router.push(cmd.href)`, then `ctx.closePanel()`.
    - `'external'` → `window.open(cmd.href, '_blank', 'noopener,noreferrer')`. Leaves panel open.
    Keeping `kind` branching out of components makes it trivially testable.

15. **`types.ts`** — `ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; status?: 'sending' | 'error'; createdAt: string }`. Don't spread `ChatResponse` into render props.

16. **`useGlobalSlashShortcut.ts`** — hook that registers a `keydown` listener on `window`. When `event.key === '/'` and `document.activeElement?.tagName` is not in `['INPUT', 'TEXTAREA']`, calls `openWidget()` and `event.preventDefault()`. (Escape-to-close is handled by Radix Dialog out of the box.)

**Files to modify:**

17. **`apps/web/app/layout.tsx`** — import and render `<DavidAgentWidget />` inside `<body>`, after `{children}`. One line.

18. **`apps/web/app/globals.css`** — add three keyframes:
    - `@keyframes cwPop` — `{ from: { opacity: 0, transform: translateY(8px) scale(0.985) } to: { opacity: 1, transform: none } }`
    - `@keyframes cwSheet` — `{ from: { transform: translateY(28px), opacity: 0.6 } to: { transform: none, opacity: 1 } }`
    - `@keyframes cwBlink` — `{ 0%, 80%, 100%: { opacity: 0.25, transform: translateY(0) } 40%: { opacity: 1, transform: translateY(-2px) } }`
    Plus the `--animate-cwPop`, `--animate-cwSheet`, `--animate-cwBlink` variables in `@theme` so they're consumable via `animate-cwPop` etc.

**Implementation notes:**

- **Send semantics:** `send(text)` immediately appends a user `ChatMessage` with `status: undefined`, sets the conversation `status` to `'sending'`, then calls `sendAgentMessage({ message: text, channel: 'web', conversationId })`. On resolve: append the assistant `ChatMessage`, store `conversationId` from the response, set `status: 'idle'`. On `AgentClientError`: if `code === 'conversation_not_found'`, drop `conversationId` and retry once automatically (the user's intent was to keep talking — silently recover). For other codes: set `status: 'error'`, store `lastError`, leave `conversationId` intact.
- **Duplicate-send guard:** while `status === 'sending'`, the send handler returns early and the composer's button is disabled.
- **Retry from error bubble:** find the last user message and re-send it via `send(lastUser.text)`. Don't auto-include retry context (the API doesn't care).
- **Unknown slash commands:** if user types `/asdf` and hits Enter, it goes through `send('/asdf')` like any other text. No special handling, no UI message.
- **`ChatResponse.sources` / `confidence` / `shouldEscalate` / `traceId`:** ignored by the UI in this phase. Out of scope per the prompt.
- **The `/whatsapp` slash command and the dedicated affordances (header button + persistent line) all pull the same href.** Define it once at the top of `index.tsx` (or in a small helper): `` const waHref = `https://wa.me/${contact.whatsappNumber}`; ``. Don't duplicate the URL construction in three places.
- **Markdown rendering:** restrict `react-markdown` to an inline subset (`p`, `strong`, `em`, `code`) — no headings, no lists, no images, no code blocks. The assistant's answers should read as conversational, not as docs.

**Verification:**

- Run `pnpm --filter @portfolio/api dev` and `pnpm --filter web dev`.
- Visit `/`, `/about`, `/contact`, `/demos` — trigger pill visible at bottom-right on each.
- Click pill → panel opens with `cwPop` animation. Welcome state shows the 6 chips and the persistent WhatsApp line is visible *below* the chips area.
- Press `/` anywhere (with no input focused) → widget opens.
- Type "What is David's stack?" + send → user bubble appears immediately, typing bubble shows with 3 dots + "thinking…", assistant bubble appears with markdown rendered (bold + inline code).
- Send while a message is pending → blocked (button disabled, second click no-op).
- Type `/`, see filtered slash popover with rows `[/cmd] [description] [kind]`. Click `/stack` → sends canned prompt, response renders. Click `/projects` → router pushes `/about#projects`, panel closes, projects section in view. Click `/contact` → router pushes `/contact`, panel closes. Click `/whatsapp` → new tab opens with `wa.me/<number>`, panel stays open.
- Click each of the 6 suggested chips — the ones with `commandRef` dispatch via the slash path; the ones without (`What kind of engineer is David?`, `Why Twilio?`) send the label text as plain user input.
- Click the WhatsApp icon in the header → new tab opens with `wa.me/<number>`. With no messages, `aria-label` reads "Start this conversation on WhatsApp"; after sending a message, it reads "Continue this conversation on WhatsApp".
- Click the persistent "Prefer WhatsApp?" line → new tab opens. Line copy is "Continue there" before any messages, "Continue this chat there" after.
- Stop `apps/api` mid-conversation → error bubble appears with the canned copy and Retry button. Click Retry → re-sends the last user message.
- Force-trigger `conversation_not_found`: in browser devtools, set the widget's `conversationId` to `"bogus"`, send → auto-retry kicks in, new conversation starts cleanly, no error visible to the user.
- `pnpm lint` + `pnpm check-types` clean.

**Done when:** the widget works end-to-end on desktop against the real agent, all five slash commands dispatch correctly, suggested-prompt chips work both with and without `commandRef`, both WhatsApp affordances (plus the slash command) all open the correct deep link, the global `/` shortcut opens the widget, and error envelopes are handled per `code`. **Mobile may look rough; that's Phase C.**

---

## Phase C — Mobile + accessibility polish

**Goal:** Comfortable mobile UX (90vh bottom sheet) and screen-reader / keyboard parity with desktop.

**Files to modify (no new files):**

1. **`ChatPanel.tsx`** — mobile variant:
   - On `< sm` viewports, switch from `fixed bottom-6 right-6 w-[380px] h-[580px]` to a bottom-sheet: `fixed inset-x-0 bottom-0 w-full max-h-[90dvh] rounded-t-[22px]`. Use `dvh` (dynamic viewport height) so the iOS URL bar doesn't clip the composer.
   - Add the `cwSheet` animation in place of `cwPop` for the mobile variant.
   - Add a grip handle (36×4 rounded pill, neutral-700, centered, ~6px from top).
   - Add a dark backdrop (`rgba(0,0,0,0.55)` with `backdrop-blur-sm`) behind the sheet — clicking the backdrop closes the panel.
   - Switch `onOpenAutoFocus={(e) => { e.preventDefault(); composerRef.current?.focus(); }}` so focus lands in the composer, not on the first focusable child (pattern from `components/common/Modal/Modal.tsx`).

2. **`ChatLauncher.tsx`** — ensure 44×44 minimum touch target on mobile (`min-h-12 min-w-12 sm:min-h-14 sm:min-w-14` or equivalent). The sub-label text content swaps from "David Agent · online" to "tap to chat" on mobile (use Tailwind responsive `before:` / `after:` or render two spans with `hidden sm:inline` / `sm:hidden`).

3. **`ChatMessageList.tsx`** — a11y:
   - `role="log"`, `aria-live="polite"`, `aria-relevant="additions"` so screen readers announce new assistant messages without interrupting the user.
   - `aria-busy={status === 'sending'}` during pending sends.
   - Visually-hidden status node: `<span className="sr-only" aria-live="polite">{status === 'sending' ? 'David Agent is thinking…' : ''}</span>` so the typing indicator is announced, not just shown.

4. **`ChatComposer.tsx`** — keyboard + a11y:
   - Swap `<input>` for `<textarea>` with auto-grow (min 1 row, max 4 rows). Enter (no Shift) submits; Shift+Enter inserts a newline.
   - Send button gets `aria-label="Send message"`.
   - Add visible focus rings on textarea and send button (Tailwind `focus-visible:` utilities matching ContactForm's pattern: secondary-500 inset shadow on textarea, secondary-400 outline on buttons).
   - Slash icon button gets `aria-label="Open commands"`.

5. **`CommandSuggestions.tsx`** — keyboard nav:
   - `role="listbox"` on the popover container, `role="option"` on each row with `aria-selected={isHighlighted}`.
   - `aria-activedescendant` on the composer textarea pointing at the highlighted row's id.
   - Arrow Up / Down moves the highlight. Enter dispatches. Escape closes the popover (does *not* close the panel).
   - On dispatch: focus returns to the composer.

6. **`ChatHeader.tsx`** — verify icon-only buttons have `aria-label`s (close: "Close chat", WhatsApp: adapts as described in Phase B).

7. **`WhatsAppLine.tsx`** — ensure it's a single button (not a div with a click handler) for keyboard accessibility, with a descriptive `aria-label` matching the visible copy.

8. **`globals.css`** — no new keyframes, but verify `prefers-reduced-motion` is respected: wrap `cwPop`, `cwSheet`, `cwBlink` in `@media (prefers-reduced-motion: no-preference)`.

**Verification:**

- Browser devtools at 320px width: launcher reachable and doesn't cover critical nav; sheet opens to ~90dvh; composer stays above the iOS keyboard; no horizontal scroll anywhere on the page.
- Browser devtools at 768px and 1280px: floating panel renders correctly and doesn't overlap the homepage hero awkwardly.
- Tab from page load: focus reaches launcher → Enter opens panel → focus is in composer → Tab cycles composer → send button → close button → WhatsApp button → through messages (or skip via roving focus). Escape closes → focus restored to launcher.
- VoiceOver (macOS) or NVDA: opening the panel announces the dialog label; new assistant messages announce; "David Agent is thinking…" announces during sending.
- Type `/` in the composer, use ↑/↓ to navigate, Enter to dispatch, Escape to close — all without leaving the keyboard.
- Send a message via Enter; insert a newline via Shift+Enter — confirms textarea behavior.
- Toggle "reduce motion" in OS settings — entrance animations don't run.
- All Phase B verification still passes.
- `pnpm lint` + `pnpm check-types` clean.

**Done when:** every widget interaction is reachable by keyboard and announced to screen readers; mobile sheet doesn't fight the iOS keyboard or address bar; no horizontal scroll at 320px; visible focus rings on all interactive elements; reduced-motion respected.

---

## Explicitly out of scope (do not build, even speculatively)

- Streaming chat responses (no `AsyncIterable`, no `ReadableStream`, no SSE in client or proxy).
- Persisted conversations beyond in-memory `conversationId`.
- "Start new conversation" / chat-clear button.
- Source display UI (`ChatResponse.sources` are received but not rendered).
- Trace/debug metadata panels.
- Twilio inbound bridge (the WhatsApp affordances are deep links only).
- Skill metadata or shortcut-id on the API request — **never**, even for analytics.
- Promoting `SlashCommand` or `SuggestedPrompt` into `@portfolio/contracts`.
- Carrying conversation context through to WhatsApp (the design notes a future "handoff token" idea; out of scope).
- Animating message-by-message text reveal (would only matter once the API streams).

## Cross-phase quality bar

- Strict TypeScript, no `any`. Use `@portfolio/contracts` types directly.
- `twMerge` for all conditional class composition (existing repo convention).
- No new dependencies — every UI need is met by `framer-motion`, `@radix-ui/react-dialog`, `react-feather`, `react-markdown`, `tailwind-merge`, `clsx`.
- Comments: only where the *why* is non-obvious. Don't restate what the code does.
- `pnpm lint` (max-warnings 0) and `pnpm check-types` clean at the end of every phase.

## Design source of truth

The extracted design lives at `/tmp/design-extract/floating-ai-chat-card/project/`. Working protocol is the **Visual fidelity protocol** section above; key files for reference:

- `chat-widget.jsx` — full reference implementation. The `cwStyles` object at the bottom is the source of truth for every dimension, color, shadow, gradient, and animation — port literally per Rule 2.
- `app.jsx` — the seeded artboards (`seed="welcome" | "conversation" | "typing" | "slash" | "error" | "closed"`, plus `mobile`). Each is a pinned side-by-side target for the corresponding state in the real widget.
- `design-system/colors_and_type.css` — design tokens; values already match `apps/web/app/globals.css` for primary/secondary/neutral scales.
- `chats/chat1.md` — the design conversation that locked the WhatsApp affordances and the persistent line behavior (useful context if a future ambiguity arises).

If the design and this plan disagree on a *visual* detail, the design wins. If they disagree on an *architectural* detail (state, contracts, registry shape, slash-command kinds), this plan wins — those overrides are listed under "Decisions locked during planning."
