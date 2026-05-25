# Current Portfolio Content Audit — David Bautista

> Scope: discovery only. No UI, RAG logic, schema, prompts, or seed data has
> been modified. All file paths are relative to the repo root
> (`/Users/davidbautista/personal-portfolio/Portfolio/.claude/worktrees/new-content`).
> Quoted snippets are verbatim from the files at the time of audit.

---

## 1. Where Personal Content Currently Lives

### 1.1 Single source of truth — `packages/portfolio-content/`

This package is intentionally the canonical store of personal facts. The web
app, the agent's knowledge corpus seeder, and the chat UI all import from
`@portfolio/content`.

| File | Holds |
|---|---|
| `packages/portfolio-content/src/identity.ts` | `fullName`, `greeting`, `tagline`, `roleTitle` |
| `packages/portfolio-content/src/bio.ts` | `bioParagraphs` — 6 paragraphs of bio + stack copy |
| `packages/portfolio-content/src/contact.ts` | `contact` — email, GitHub, LinkedIn, Twitter/X, resume path, WhatsApp |
| `packages/portfolio-content/src/projects.ts` | `projects` — 7 project entries (title, role, company, year, description, relevance) |
| `packages/portfolio-content/src/siteMetadata.ts` | `siteMetadata` — SEO title + description |
| `packages/portfolio-content/src/demos.ts` | `demos` — 2 interactive demo cards (Gallery, Infinity Text) |
| `packages/portfolio-content/src/index.ts` | Barrel re-export of all of the above |

### 1.2 UI pages / components (`apps/web/`)

| File | Purpose |
|---|---|
| `apps/web/app/layout.tsx` | Imports `siteMetadata` for the root `<Metadata>` (page title + description). Mounts global `<DavidAgentWidget />`. |
| `apps/web/app/page.tsx` | Homepage hero — renders `greeting`, `fullName`, `tagline`, "Say Hi" + "Resume" buttons; embeds `<AboutSection />` and `<ContactSection />`. Uses `/myself.png` hero image. |
| `apps/web/components/AboutSection/AboutSection.tsx` | About + Projects sections. Renders `fullName`, `roleTitle`, LinkedIn/GitHub/Twitter social icons, `bioParagraphs` (markdown-rendered), and the 7-card `projects` grid keyed by `relevance`. Profile image: `/profile.jpg`. |
| `apps/web/components/ContactSection/ContactSection.tsx` | "Let's Connect" section. Renders email, GitHub label, LinkedIn name, "Download Resume" button, disabled "View Projects (soon)" button, and `<ContactForm />`. |
| `apps/web/components/ContactForm/ContactForm.tsx` | Contact form UI (form fields, no personal facts hardcoded). |
| `apps/web/app/demos/page.tsx` | `/demos` page — renders the `demos` collection. |
| `apps/web/app/demos/gallery/page.tsx`, `…/infinity-text/page.tsx` | Demo detail pages (interactive demos; no biographical content). |
| `apps/web/components/common/Navigation/Navigation.tsx` | Nav links: Home / About / Demos / Contact. Section IDs: `home`, `about`, `contact`. |

### 1.3 Chat widget — `apps/web/components/agent/DavidAgentWidget/`

The floating "David Agent" chat widget. UI-only copy lives here; the agent's
LLM behavior is defined in `packages/agent` (see §1.5).

| File | Copy / Personal content |
|---|---|
| `ChatLauncher.tsx` | Launcher pill copy: `aria-label="Open David Agent — Ask David anything about David Bautista"`, `"Ask David"`, `"David Agent · online"`, `"tap to chat"`. Uses `/profile.jpg`. |
| `ChatHeader.tsx` | Header: `"David Agent"`, `BETA` chip, subtitle `"Ask about my projects, stack, experience, or leadership."` |
| `ChatPanel.tsx` | Accessible title/description: `"David Agent"` / `"Ask David about his projects, stack, experience, or leadership."` |
| `ChatComposer.tsx` | Textarea placeholder: `"Ask David anything…  (try / for skills)"`; `aria-label="Message David Agent"`. |
| `SuggestedPrompts.tsx` | Empty-state heading: `"— Hi, I'm David's agent —"` + tagline `"I've read every line of his portfolio. Ask me about his stack, projects, or leadership — or fire off a slash command."` |
| `ErrorBubble.tsx` | Error copy: `"The agent took a coffee break."` / `"Couldn't reach David's brain just now…"` + `mailto:` link to `contact.email`. |
| `WhatsAppLine.tsx` | `"Prefer WhatsApp?"` deep-link line. |

### 1.4 Suggested prompts + slash commands

| File | Holds |
|---|---|
| `apps/web/model/suggestedPrompts.ts` | 5 starter chips (see §4.5). |
| `apps/web/model/slashCommands.ts` | 5 slash commands: `/projects`, `/stack`, `/leadership`, `/contact`, `/whatsapp` (WhatsApp `href` interpolates `contact.whatsappNumber`). |

### 1.5 Agent prompts (LLM behavior) — `packages/agent/`

| File | Holds |
|---|---|
| `packages/agent/src/prompts/systemPrompt.ts` | Base system prompt (`"You are the assistant for David Bautista's portfolio. You speak to recruiters, interviewers, and prospective clients…"`), retrieval rules, and the empty-context fallback prompt. Built per-request via `buildSystemPrompt(acceptedChunks)`. |
| `packages/agent/src/prompts/rewriteQuery.ts` | Query rewriter system prompt: `"You rewrite user questions to improve semantic retrieval against David Bautista's portfolio knowledge base…"` |
| `packages/agent/src/graph/nodes/fallback.ts` | Hardcoded escalation answer: `"I don't have enough information in David's portfolio to answer that confidently. I'll flag this so he can follow up directly."` |

### 1.6 RAG seed / knowledge files — `packages/db/`

| File | Holds |
|---|---|
| `packages/db/scripts/seed-knowledge-data.ts` | **The RAG corpus definition.** Imports from `@portfolio/content` and produces `realPortfolioDocuments` (bio, tagline, contact, primary stack, 7 projects) plus `devFixtureDocuments` (1 placeholder doc). `allSeedDocuments` is what the seeder ingests. |
| `packages/db/scripts/seed-knowledge.ts` | Orchestrator — chunks, embeds, and upserts `allSeedDocuments` into Postgres + pgvector. No personal content of its own. |
| `packages/db/scripts/smoke-retrieval.ts` | Hardcoded smoke test: `const QUERY = "What is David's stack?"`. |
| `packages/db/src/knowledge/*.ts` (chunking, documents, chunks, retrieve) | Structural — chunking, hashing, storage, cosine search. No content. |
| `packages/db/prisma/schema.prisma` | Schema only: `Conversation`, `Message`, `AgentTrace`, `Document`, `DocumentChunk` (pgvector). No baked-in personal data. |

### 1.7 API + agent smoke scripts

| File | Holds |
|---|---|
| `apps/api/scripts/smoke-chat.ts` | Hardcoded test payload: `"What is David's technical stack?"` |
| `packages/agent/scripts/smoke-agent.ts` | Hardcoded test cases: `"What is David's technical stack?"` and `"What is David's favorite database indexing strategy?"` (expected unanswerable). |

### 1.8 Docs

| File | Personal mentions |
|---|---|
| `docs/architecture.md` | System-level reference; quotes the agent persona ("assistant for David Bautista's portfolio"). |
| `docs/knowledge-pipeline.md` | Walks through the RAG ingestion pipeline; references David by name. |
| `docs/05-connect-web-chat-ui.prompt.md`, `docs/06-connect-web-chat-ui.plan.md` | Historical planning/prompt artifacts for the chat UI work. |
| `docs/workspace-tree.md` | Structural — no personal facts. |

### 1.9 Config / env / static assets

| File | Notes |
|---|---|
| `.env.example` | No personal data. Includes Postgres, OpenAI, embedding, chat-model, and API host vars. **No** `NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER` line, even though `contact.ts` reads it — see Gaps (§5). |
| `apps/web/public/davidbautista.pdf` | Static resume binary served as `/davidbautista.pdf` (referenced by `contact.resumePath`). Content not parsed by this audit. |
| `apps/web/public/myself.png` | Homepage hero image. |
| `apps/web/public/profile.jpg` | About + chat launcher + chat header avatar. |
| `apps/web/public/demos/`, `home.png`, `floating-home.png`, `resume.png`, `download.png`, `favicon.ico` | Supporting imagery. |

---

## 2. Current Personal Information Found

### 2.1 Identity (`packages/portfolio-content/src/identity.ts`)

- **Full name:** `David Bautista`
- **Greeting (homepage):** `"Hi, I'm"`
- **Tagline (homepage):** `"Your next Staff Software Engineer"`
- **Role title (About section + metadata):** `"Senior Software Engineer"`

> Note the asymmetry: the homepage tagline positions David as a **Staff**
> Software Engineer (aspirational/forward), while the About section + SEO
> title call him a **Senior** Software Engineer (current). See §5.

### 2.2 About Me / bio (`packages/portfolio-content/src/bio.ts`)

Six paragraphs (markdown-rendered in the About section). Verbatim:

1. `"I'm a Software Engineer and **Product Engineer** with over 7 years of experience in Full-Stack development and more than 3 years leading Front-End teams. I'm passionate about building high-quality, accessible user interfaces that prioritize performance."`
2. `"My stack is HTML/CSS, Tailwind CSS, JavaScript, React, React Native, GSAP, Node.Js, and a bit of Scala. My expertise spans the full stack: from databases, micro-services architecture, to responsive front-end complex applications."`
3. `"I'm a lifelong learner, currently pursuing a Master's in Software Engineering. I love tackling challenges, mentoring teams, and leading projects to success."`
4. `"I am a problem solver, and I love to be one. / I am a mentor, and I love to be one. / I am a leader, and I love to be one. / I am a team player, and I love to be one. / I am a Software/Product Engineer, and **I love to be one.**"`
5. `"Still reading? When I'm not coding, I'm probably learning a new tech stack over a weekend, or learning how to play guitar."`
6. `"Peace ✌️"`

### 2.3 Skills / technologies

Skills are **not** modeled as a structured list anywhere — they only appear as
free text inside `bioParagraphs[1]`:

- **Front-end:** HTML, CSS, Tailwind CSS, JavaScript, React, React Native, GSAP
- **Back-end / languages:** Node.js, Scala (`"a bit of"`)
- **Breadth claim:** `"databases, micro-services architecture, … responsive front-end complex applications"`

The `seed-knowledge-data.ts` "Primary stack" knowledge doc reuses
`bioParagraphs[1]` verbatim, so any change to skills must happen in `bio.ts`.

### 2.4 Projects (`packages/portfolio-content/src/projects.ts`)

Seven entries. Title — Role — Company — Year — Relevance:

| # | Title | Role | Company | Year | Rel. |
|---|---|---|---|---|---|
| 1 | High-complexity critical feature development | Front-End Technical Lead | Globant | 2023-Present | 3 |
| 2 | Software architecture and library design | Tech-Lead \| Growth Team | Torre.ai | 2022-2023 | 2 |
| 3 | Innovative data gathering and analysis tool | Software Engineer and Front-End Data Analyst | United Nations Population Fund (UNFPA) | 2018-2021 | 2 |
| 4 | Urban planning research project | Graduated Research Assistant | Universidad de los Andes | 2020-2021 | 1 |
| 5 | Performance optimization and user tracking system | Sr. Software Engineer | Torre.ai | 2021-2022 | 2.5 |
| 6 | Subscription management system with Stripe integration | Mid-Level Software Engineer | Torre.ai | 2021 | 2 |
| 7 | Dynamic advertising system | Junior Software Engineer Intern | Valdivieso Consulting S.A.S | 2017 | 2 |

Embedded portfolio claims / metrics worth flagging:
- Globant project: `"internal core application called Content Restrictor for the biggest entertainment company in the world"`.
- Torre.ai perf project: `"reducing LCP from 22 to 2 seconds"`.
- UNFPA project: `"aiding informed policy-making"`.

### 2.5 Work experience (derived from projects)

There is **no dedicated "Experience" data structure** — work history is
inferred from `projects` (the only place company/year/role exist). The
implied timeline:

- **Globant** — Front-End Technical Lead — 2023–Present
- **Torre.ai** — multiple roles — 2021 → 2023 (Mid-Level → Sr. → Tech-Lead)
- **United Nations Population Fund (UNFPA)** — 2018–2021
- **Universidad de los Andes** — Graduated Research Assistant — 2020–2021
- **Valdivieso Consulting S.A.S** — Junior Intern — 2017

### 2.6 Education / certifications

Only mentioned in `bioParagraphs[3]`: `"currently pursuing a Master's in Software Engineering"`. **No institution, start date, or expected completion is recorded.** No undergraduate degree is explicitly listed (Universidad de los Andes appears only as an employer/research project, not as an alma mater). No certifications are recorded anywhere.

### 2.7 Contact (`packages/portfolio-content/src/contact.ts`)

- **Email:** `david@davidbautista.co`
- **Resume:** `/davidbautista.pdf` (static file in `apps/web/public/`)
- **WhatsApp:** `process.env.NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER ?? '+15551234567'` (placeholder default)

### 2.8 Social links

- **GitHub:** `https://github.com/djbautista` — handle `djbautista`, label `"Davidjba"` *(label looks truncated — see §5)*
- **LinkedIn:** `https://www.linkedin.com/in/davidjoelbautista/?locale=en_US` — display name `"David Bautista"`
- **Twitter / X:** `https://x.com/djbautista10` — handle `djbautista10`

### 2.9 Portfolio-specific claims / metrics

Surfaces where claims/metrics appear (not as structured data):
- **`bioParagraphs[0]`:** "over 7 years … Full-Stack development", "more than 3 years leading Front-End teams".
- **`projects[0].description`:** "biggest entertainment company in the world".
- **`projects[4].description`:** "LCP from 22 to 2 seconds".
- **Site SEO description:** `"Senior Software Engineer with a passion for building great UI/UX products."` (`siteMetadata.ts`).

---

## 3. RAG Knowledge Inventory

### 3.1 What the agent currently knows

Defined in `packages/db/scripts/seed-knowledge-data.ts`. At seed time the
ingestion script produces the following documents:

| # | Title | Source type | Source URI | Origin |
|---|---|---|---|---|
| 1 | `Bio — David Bautista` | `portfolio` | `@portfolio/content/bio` | `bioParagraphs.join("\n\n")` (all 6 paragraphs) |
| 2 | `Tagline — David Bautista` | `portfolio` | `@portfolio/content/identity` | `"Hi, I'm David Bautista. Your next Staff Software Engineer."` |
| 3 | `Contact channels` | `portfolio` | `@portfolio/content/contact` | Email, GitHub URL+handle, LinkedIn URL+name, resume path. **Twitter/X is omitted.** |
| 4 | `Primary stack` | `skill` | `@portfolio/content/bio#stack` | `bioParagraphs[1]` verbatim (stack paragraph) |
| 5–11 | 7 × project docs | `project` | `@portfolio/content/projects#<slug>` | One per `projects[]` entry; title is `"<Title> (<Company>, <Year>)"`; content has Title / Role / Company / Years / blank / Description |
| 12 | `AI engineering positioning (placeholder)` | `dev_fixture` | `packages/db/scripts/seed-knowledge-data.ts#ai-positioning` | **Placeholder** — explicitly marked `"replace with real positioning copy before demo"` |

That's 11 real documents + 1 placeholder = **12 seed documents** total.

### 3.2 Which files control RAG knowledge

- **What the agent sees:** `packages/db/scripts/seed-knowledge-data.ts` (the only place real content is composed for embedding).
- **How it gets in:** `packages/db/scripts/seed-knowledge.ts` (idempotent chunk/embed/upsert; prunes stale rows whose metadata.source is `"existing_portfolio"` or `"dev_fixture"`).
- **How it gets retrieved:** `packages/db/src/knowledge/retrieve.ts` (cosine similarity via pgvector). Consumed by the agent graph in `packages/agent/` and injected into `buildSystemPrompt`.

### 3.3 Content-quality observations

- **Real vs. placeholder:** 11 of 12 documents are real; 1 is the `AI engineering positioning` dev fixture that should be removed before going public.
- **Duplication-by-design:** `Bio` doc (#1) already contains the stack paragraph; the standalone `Primary stack` doc (#4) reuses `bioParagraphs[1]` verbatim. That's intentional — it boosts retrieval precision for stack questions — but any stack edits must happen in **one** place (`bio.ts`) to keep them aligned.
- **Outdated / incomplete:**
  - Twitter/X URL is in `contact.ts` and rendered in the UI, but **not** included in the `Contact channels` knowledge doc.
  - WhatsApp is in `contact.ts` and surfaced through `/whatsapp`, but is **not** in the corpus either.
  - No knowledge doc covers education, certifications, AI/ML positioning, or non-project skills.
  - No knowledge doc covers the `demos` collection.
- **Recruiter-facing corpus is thin:** Bio is mostly tone/voice; the only "hard facts" indexable for retrieval are stack + 7 project paragraphs. Questions about specific technologies, team sizes, or accomplishments outside those 7 paragraphs will most likely route to the fallback ("I don't have enough information…").

---

## 4. UI Content Inventory

### 4.1 Homepage hero (`apps/web/app/page.tsx` — `#home`)

- `greeting` → "Hi, I'm"
- `fullName.first.toUpperCase()` + `fullName.last.toUpperCase()` → "DAVID" / "BAUTISTA" (silkscreen font)
- `tagline.toUpperCase()` → "YOUR NEXT STAFF SOFTWARE ENGINEER"
- CTAs: **Say Hi** (anchors to `#contact`), **Resume** (opens `/davidbautista.pdf`)
- Image: `/myself.png`

### 4.2 About section (`apps/web/components/AboutSection/AboutSection.tsx` — `#about`)

- Avatar: `/profile.jpg`
- Name (h1): "David Bautista"
- Role (h2 highlight): "Senior Software Engineer"
- Social icons: LinkedIn, GitHub, Twitter (in that order)
- Body: all 6 `bioParagraphs` rendered with `react-markdown`

### 4.3 Projects sub-section (inside About, `#projects`)

- Heading: `"— I'm proud of —"`
- 7 cards in a 6-col grid; per-card width scales by `relevance` (1 → 2 cols, 2 → 3, 2.5 → 4, 3 → 6 cols full-width)
- Per card: description / role / company, year

### 4.4 Contact section (`apps/web/components/ContactSection/ContactSection.tsx` — `#contact`)

- Heading: `"Let's Connect"` (silkscreen)
- Lede: `"I'm always open to new opportunities and collaborations. Feel free to reach out!"`
- Channels: email (mailto), GitHub (label `"Davidjba"`), LinkedIn (name `"David Bautista"`)
- Buttons: **Download Resume** (active), **View Projects (soon)** — *disabled (`pointer-events-none opacity-50`)*
- Form: `<ContactForm />` (no personal copy; field labels only)
- Helper: `"Prefer to share your email? Fill out the form and I'll get back to you as soon as possible."`

### 4.5 Chat widget content

**Launcher (`ChatLauncher.tsx`):** "Ask David" / "David Agent · online" / "tap to chat" (mobile).
**Header (`ChatHeader.tsx`):** "David Agent" + BETA badge / "Ask about my projects, stack, experience, or leadership."
**Empty state (`SuggestedPrompts.tsx`):** "— Hi, I'm David's agent —" / "I've read every line of his portfolio. Ask me about his stack, projects, or leadership — or fire off a slash command."
**Composer placeholder:** "Ask David anything…  (try / for skills)"
**WhatsApp line:** "Prefer WhatsApp?" / "Continue this chat there"
**Error state:** "The agent took a coffee break."

**Suggested prompts (`apps/web/model/suggestedPrompts.ts`):**
1. "What's David's technical stack?" → dispatches `/stack`
2. "Show me David's projects" → dispatches `/projects`
3. "What kind of engineer is David?" (plain prompt, no slash)
4. "Tell me about his leadership" → dispatches `/leadership`
5. "How can I contact David?" → dispatches `/contact`

**Slash commands (`apps/web/model/slashCommands.ts`):**
- `/projects` (navigate `/#projects`) — "Browse what I'm proud of"
- `/stack` (prompt) — sends `"What is David's technical stack?"` — description: "My tech stack & tools"
- `/leadership` (prompt) — sends `"Tell me about David's leadership experience."` — description: "3+ years leading Front-End teams"
- `/contact` (navigate `/#contact`) — "Email, LinkedIn, GitHub"
- `/whatsapp` (external) — `https://wa.me/<contact.whatsappNumber>`

### 4.6 Navigation (`apps/web/components/common/Navigation/Navigation.tsx`)

Links: Home (house icon, `/`) · About (`/#about`) · Demos (`/demos`) · Contact (`/#contact`).

### 4.7 Demos (`apps/web/app/demos/page.tsx`)

Two cards from `demos`:
- **Gallery** (slug `gallery`, 2024) — "A nice reactive gallery with animations when hovering over the elements."
- **Infinity Text** (slug `infinity-text`, 2023) — "A simple text animation that creates an infinity effect and dynamically switch direction when scrolling."

---

## 5. Gaps and Inconsistencies

### 5.1 Missing information

- **No structured skills list.** Skills exist only as prose in `bioParagraphs[1]`. Hard to render as a "Skills" UI section, hard to retrieve precisely from RAG.
- **No "Experience" model.** Work history is inferred from `projects`; there are no dedicated `from`/`to` fields, no employer descriptions, no responsibilities outside the single-sentence project descriptions.
- **No education data structure.** Bio mentions a Master's-in-progress with no institution or expected date. No undergraduate degree recorded. No certifications.
- **No AI / ML / agent positioning copy.** This portfolio *is* an AI-agent product, but no document positions David's AI engineering experience — flagged explicitly via the `dev_fixture` placeholder in `seed-knowledge-data.ts`.
- **No location, languages-spoken, work authorization, or availability** — common recruiter-facing facts are absent everywhere.
- **`.env.example` missing the WhatsApp variable.** `contact.ts` reads `NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER` and falls back to `+15551234567`. Without the variable being documented in `.env.example`, fresh clones ship the placeholder number to production (the `/whatsapp` slash command would deep-link to a fake number).
- **Twitter/X and WhatsApp are absent from the RAG corpus** (only email + GitHub + LinkedIn + resume are in the `Contact channels` knowledge doc).
- **Demos are absent from the RAG corpus.**

### 5.2 Outdated or possibly stale information

- **Master's "currently pursuing"** has been in the bio without a date; impossible to tell from the repo whether it's still in progress, completed, or paused.
- **Globant tenure** listed as `2023-Present` — true as of when bio was written; needs re-verification.
- **"7+ years experience / 3+ years leading"** is in plain prose, so it will silently age unless rewritten.

### 5.3 Duplication

- **Stack paragraph is duplicated by design** between the `Bio` doc and the standalone `Primary stack` doc (both seeded from `bioParagraphs[1]`). Not a content duplication — they share a single source. Just be aware that the stack paragraph **must remain self-contained** (a chunker treats it as a standalone document).
- **"Senior Software Engineer" title appears in 3 places** (`identity.ts:roleTitle`, `siteMetadata.ts:title`, `siteMetadata.ts:description`). All flow from `@portfolio/content` so a single edit propagates, but each is a distinct string literal that must be kept in sync if/when the title changes.
- **`fullName` is interpolated everywhere** — page hero, About header, knowledge tagline doc — but always via `@portfolio/content`. Good.
- **The literal "What is David's technical stack?"** appears as a string in *three* places: `apps/web/model/slashCommands.ts` (the `/stack` prompt), `apps/api/scripts/smoke-chat.ts` (test), and `packages/agent/scripts/smoke-agent.ts` (test). `packages/db/scripts/smoke-retrieval.ts` uses the shorter `"What is David's stack?"`. Edits to phrasing need to land in all four.

### 5.4 Inconsistencies (UI ↔ RAG ↔ metadata)

| # | Inconsistency | Where |
|---|---|---|
| 1 | **Tagline (Staff)** vs. **role title (Senior)** vs. **SEO title (Senior).** Hero says "Your next Staff Software Engineer" while About + `<title>` say "Senior Software Engineer". | `identity.ts:tagline` vs. `identity.ts:roleTitle` vs. `siteMetadata.ts` |
| 2 | **GitHub label `"Davidjba"`** rendered in `ContactSection`. Looks truncated/odd vs. the handle `djbautista`. | `packages/portfolio-content/src/contact.ts:6` |
| 3 | **WhatsApp default `+15551234567`** is a placeholder fallback that ships to prod if the env var isn't set, and the env var is **not documented** in `.env.example`. | `contact.ts:17–18`, missing from `.env.example` |
| 4 | **Contact knowledge doc misses Twitter/X and WhatsApp** even though both exist in `contact.ts` and the UI. The agent will not surface them when asked "how can I reach David?". | `seed-knowledge-data.ts:80–93` |
| 5 | **No project for AI / agent / RAG work** — but the chat widget and `dev_fixture` doc both signal that AI positioning is the *intended* differentiator. | `projects.ts` vs. `seed-knowledge-data.ts:111–120` |
| 6 | **"View Projects (soon)" button** in `ContactSection` is permanently disabled. | `ContactSection.tsx:81–87` |
| 7 | **"Senior Software Engineer" SEO description** says "passion for building great UI/UX products" — fine, but doesn't reflect the AI engineering pivot the dev_fixture placeholder hints at. | `siteMetadata.ts` |
| 8 | **Suggested prompt #3 ("What kind of engineer is David?")** has no `commandRef`, so it sends as plain text. The other four chips dispatch slash commands. Minor inconsistency. | `suggestedPrompts.ts:12` |
| 9 | **Demos are first-class in nav** but absent from the agent's knowledge corpus, so `/whatsapp`-style questions like "show me your animations" will miss. | `Navigation.tsx` ↔ `seed-knowledge-data.ts` |

---

## 6. Recommended Update Map

> Updates fan out from `@portfolio/content`. The principle is: **never touch
> the web app or the RAG seed for content changes — touch
> `packages/portfolio-content/src/*` and let consumers re-import.**

### 6.1 UI-facing updates (the change lands here first)

| Change | File |
|---|---|
| Name / greeting / tagline / role | `packages/portfolio-content/src/identity.ts` |
| About / bio paragraphs | `packages/portfolio-content/src/bio.ts` |
| Stack paragraph (also used by RAG `Primary stack` doc) | `packages/portfolio-content/src/bio.ts` — paragraph index 1 |
| Email / GitHub / LinkedIn / Twitter / WhatsApp / Resume path | `packages/portfolio-content/src/contact.ts` |
| GitHub label `"Davidjba"` typo/truncation (verify) | `packages/portfolio-content/src/contact.ts:6` |
| Add/remove projects, edit project copy or `relevance` weighting | `packages/portfolio-content/src/projects.ts` |
| Add demos | `packages/portfolio-content/src/demos.ts` |
| Page `<title>` + meta description | `packages/portfolio-content/src/siteMetadata.ts` |
| Hero / About visuals | `apps/web/public/myself.png`, `apps/web/public/profile.jpg`, `apps/web/public/davidbautista.pdf` |
| Suggested chat prompts | `apps/web/model/suggestedPrompts.ts` |
| Slash command list / labels | `apps/web/model/slashCommands.ts` |
| Chat widget micro-copy ("Ask David", "BETA", "David Agent", "took a coffee break", etc.) | `apps/web/components/agent/DavidAgentWidget/*.tsx` |

### 6.2 RAG / knowledge layer updates

| Change | File |
|---|---|
| What knowledge documents exist & how they're titled / typed | `packages/db/scripts/seed-knowledge-data.ts` |
| Replace the `AI engineering positioning (placeholder)` dev fixture with real copy | `packages/db/scripts/seed-knowledge-data.ts:111–120` |
| Add Twitter/X + WhatsApp to the `Contact channels` doc | `packages/db/scripts/seed-knowledge-data.ts:80–93` |
| Add separate experience / education / certifications docs (if a structured Experience model is introduced upstream) | `packages/db/scripts/seed-knowledge-data.ts` (new entries that consume new `@portfolio/content` modules) |
| Agent persona / tone / rules | `packages/agent/src/prompts/systemPrompt.ts` |
| Query rewriter persona / scope | `packages/agent/src/prompts/rewriteQuery.ts` |
| Fallback escalation message | `packages/agent/src/graph/nodes/fallback.ts` |
| Smoke test queries (keep in sync with realistic recruiter questions) | `packages/db/scripts/smoke-retrieval.ts`, `apps/api/scripts/smoke-chat.ts`, `packages/agent/scripts/smoke-agent.ts` |
| After any content change, re-run the seeder | `pnpm --filter @portfolio/db seed:knowledge` (see `docs/knowledge-pipeline.md`) |

### 6.3 Centralization candidates (one-time refactors to consider, not requested for now)

These are places where adding a new `@portfolio/content` module would remove cross-file drift:

- **`experience.ts`** — derive employer/role/period as structured records, then have `projects.ts` reference an `employerId` instead of duplicating company strings.
- **`skills.ts`** — turn the in-prose stack list into a typed object (categories → items). Render the same data in the About section *and* feed a new `Skills` knowledge document.
- **`education.ts`** — Master's, undergraduate, certifications. Currently buried in one bio sentence; no UI surface exists yet.
- **`ai-positioning.ts`** (or similar) — replaces the `dev_fixture` placeholder with a real, indexable document for AI/ML/agent experience.
- **WhatsApp env var** — add `NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER=` to `.env.example` so it's at least documented; consider failing loudly when unset in production rather than serving the `+15551234567` placeholder.
- **Recruiter facts** that recur (location, languages, work authorization, availability) — if any of these become content, put them in their own module rather than `bio.ts`.

---

## Next Recommended Step

Before rewriting any content, the following information should be pulled from
**David's updated CV** (and any updated positioning notes) so we can edit the
**single source of truth** (`packages/portfolio-content/src/*`) plus the RAG
seed file in one pass without re-litigating decisions later:

1. **Current role title & positioning** — is the canonical title "Senior" or
   "Staff" Software Engineer (resolve the homepage tagline ↔ About/metadata
   mismatch)? Is "Product Engineer" still a primary identifier? Is AI / ML /
   Agent engineering now part of the headline?
2. **Stack / skills, as a structured list** — categorized (Frontend / Backend
   / Languages / Cloud / AI-ML / Tooling) with current vs. familiar
   distinction. Today this is one freeform sentence.
3. **Updated work history** — for each role: company, period, title, 1–3
   bullets of impact (incl. quantified metrics where possible). Confirm
   Globant end date or "Present", confirm whether each Torre.ai role is
   still relevant to highlight, and whether anything should be dropped.
4. **Education + certifications** — institution + dates for the Master's
   (and whether it's completed/in progress as of 2026-05-25), undergraduate
   degree, and any certifications (cloud, AI, etc.).
5. **AI / agent positioning paragraph** — to retire the
   `AI engineering positioning (placeholder)` `dev_fixture` in
   `packages/db/scripts/seed-knowledge-data.ts:111–120`.
6. **Project additions / removals** — confirm the 7 existing projects are
   still the ones to feature, and whether to add the portfolio itself
   (this RAG agent) as a project entry.
7. **Contact verification** — confirm email, GitHub handle (and the
   `"Davidjba"` label — looks truncated), LinkedIn URL, X/Twitter handle,
   and provide the real WhatsApp number (or confirm to drop the
   `/whatsapp` affordance).
8. **Optional recruiter-facing facts** — location, languages, work
   authorization, availability, time-zone — only if David wants these
   surfaced to the agent.

Once those are in hand, the rewrite is a focused edit of
`packages/portfolio-content/src/*`, a refresh of the contact knowledge doc
and the AI-positioning doc in `packages/db/scripts/seed-knowledge-data.ts`,
and a `seed:knowledge` re-run to repopulate embeddings.
