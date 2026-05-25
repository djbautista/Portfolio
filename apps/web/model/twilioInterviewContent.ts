export type StoryDiagramKind = "multipart" | "genie" | "rag" | "billing" | "torre" | "perf";

export type WhyIcon = "wave" | "cube" | "plug" | "spark";

export interface InterviewStory {
  id: string;
  n: string;
  title: string;
  summary: string;
  tags: string[];
  diagram: StoryDiagramKind;
  image?: string;
  twilioRelevance: string;
  context: string;
  decisions: string[];
  impact: string[];
  leadership: string;
}

export interface WhyCard {
  icon: WhyIcon;
  title: string;
  body: string;
}

export interface LeadershipRow {
  n: string;
  title: string;
  body: string;
  meta: [string, string];
}

export interface ProudTile {
  n: string;
  title: string;
  body: string;
  badge: string;
}

export interface InterviewSection {
  id: "hero" | "why" | "stories" | "leadership" | "proud";
  n: string;
  label: string;
}

export const interviewSections: InterviewSection[] = [
  { id: "hero", n: "00", label: "Welcome" },
  { id: "why", n: "01", label: "Why Twilio" },
  { id: "stories", n: "02", label: "Technical stories" },
  { id: "leadership", n: "03", label: "Leadership" },
  { id: "proud", n: "04", label: "Proud moments" }
];

export const whyStrip: WhyCard[] = [
  {
    icon: "cube",
    title: "I'm Builder",
    body: "Obsession to achieve and succeed at challenges. I want to build things that matter, that have a real impact."
  },
  { icon: "spark", title: "I'm Owner", body: "I'm a product engineer. I care what shipped, and the impact it has as outcome." },
  {
    icon: "wave",
    title: "I'm Positron",
    body: "Assertive and precise communication, with a friendly and collaborative spirit. I want to work with people, not just code."
  },
  { icon: "plug", title: "I'm Curious", body: "Always learning, always improving, and always enjoying the process." }
];

export const interviewStories: InterviewStory[] = [
  {
    id: "s3-multipart",
    n: "01",
    title: "Direct-to-S3 multipart upload for large video assets",
    summary:
      "Replaced server-proxied uploads with browser-direct multipart pipelines. Multi-GB renders, resumable, signed-URL orchestrated.",
    tags: ["S3", "AWS", "Multipart", "Resumable", "Signed URLs", "Node"],
    diagram: "multipart",
    image: "/multi-part-s3-uploading.png",
    twilioRelevance:
      "Webhook-driven post-upload pipelines and signed-URL orchestration map directly to how Twilio Media stores and routes large assets.",
    context:
      "Very large video ad assets — often over 100 GB — submitted by global users across uneven networks. The original path streamed bytes through our API server, which became the bottleneck rather than the slow client links.",
    decisions: [
      "Browser uploads directly to S3 using multipart + presigned URLs. Our API only orchestrates: init, sign chunks, complete.",
      "Chunked into multi-MB parts with concurrent uploads, exponential backoff, and per-part resumability.",
      'Server moves to a thin "ticket" role. State machine: INIT → UPLOADING → COMPLETED → INDEXED.',
      "Post-complete webhook fan-out to transcode, thumbnail, and notify pipelines — decoupled and replayable."
    ],
    impact: [
      "Removed the backend as an upload bridge — clients talk to S3, the API only mediates.",
      "Big asset uploads stopped pinning API CPU on the critical path.",
      "Unlocked very large asset workflows that the old proxying approach could not sustain."
    ],
    leadership:
      "I drove the technical spec across two teams (backend + creator-experience), challenged the initial backend-optimization framing, and paired with a mid-level engineer to land the state machine — they later owned the v2."
  },
  {
    id: "genie",
    n: "02",
    title: "Genie AI: AI-powered video generation product",
    summary: "I'm currently on Disney's Genie AI innovation track — product/frontend leadership for AI-powered video generation workflows.",
    tags: ["Next.js", "Real-time", "AI", "Streaming", "Workflows"],
    diagram: "genie",
    image: "/genie-ai.png",
    twilioRelevance:
      "Long-running async jobs with progress streaming, fan-out webhooks, and creator notifications — the same shape as any Twilio Studio-style workflow product.",
    context:
      "Inside Disney's innovation arm. The product has to feel polished and trustworthy enough for real internal users — not just a tech demo. I own the creator-facing experience.",
    decisions: [
      "Real-time job feed using SSE + a thin event bus on top of our existing webhook system.",
      "Optimistic UI: prompts feel like an instant action while the heavy generation streams in over minutes.",
      "Designed the asset model to support the multipart pipeline cleanly — pre-signed everything.",
      "Workflows that involve providers such as Runway, Sora, and Google Veo are wired in as integrations we can swap as the space evolves.",
      'A "moments" abstraction so generation steps can be inspected, retried, and shared individually.'
    ],
    impact: [
      "Took the creator surface from prototype to internal pilot.",
      "The wait stopped feeling like a wait — streamed progress made the experience usable.",
      "Patterns from this surface are now reused across adjacent innovation products."
    ],
    leadership:
      "I came in mid-flight and quickly framed the contract between the model team and the product team — async statuses, event schema, error vocabulary. Removed weeks of integration thrash."
  },
  {
    id: "portfolio-ai",
    n: "03",
    title: "AI portfolio assistant with RAG and agentic workflows",
    summary:
      "A real RAG + agent that lives in this portfolio. It can navigate the site, surface stories, and answer technically — including this very page.",
    tags: ["RAG", "Agents", "LangGraph", "pgvector", "TypeScript"],
    diagram: "rag",
    image: "/AI-system-RAG.png",
    twilioRelevance:
      "The same primitives Twilio is leaning into with AI Assistants: retrieval over real product surfaces, tool-augmented agents, and conversation-shaped UX. Planned WhatsApp/Twilio continuation so the agent can meet people where they're already messaging.",
    context:
      "I wanted to dogfood applied AI in a place where the consequences were real (interviewers!) rather than a toy demo. So I built it as a small but production-shaped stack: API, typed contracts, embeddings + pgvector, LangGraph for agent flow, and a polished chat surface.",
    decisions: [
      "RAG over my own writing, projects, and story notes — chunked, embedded, versioned per deploy.",
      "Agentic tool calls: navigate, open story, summarize section, surface resources.",
      "Guardrails: refuses speculation, cites which story it pulled from, falls back to my voice when uncertain.",
      'This "Interview Room" page is one of the things the agent can route you to.'
    ],
    impact: [
      'Removed friction from recruiters and interviewers asking "tell me about X".',
      "Became my best showcase of how I would design an applied-AI feature inside a real product."
    ],
    leadership: "I held myself to product-engineer standards: telemetry, evals, a refusal taxonomy. No vibes — even on a side project."
  },
  {
    id: "turnstile-billing",
    n: "04",
    title: "Turnstile billing & subscription workflows",
    summary:
      "Subscription lifecycle from checkout through dunning. Idempotent webhook ingestion, state-machine billing, audit trails everywhere.",
    tags: ["TypeScript", "AWS", "Webhooks", "State machine", "Idempotency"],
    diagram: "billing",
    image: "/turnstile-billing.png",
    twilioRelevance:
      "Webhook ingestion patterns — idempotency, signature verification, replay, fan-out — are exactly the patterns Twilio webhooks demand at scale.",
    context:
      'Subscription, billing, quote, invoice, and usage-based workflows across TypeScript, React/Next.js, and AWS. Real money, real disputes, no room for "we think it worked".',
    decisions: [
      "Webhook ingest layer with signature verification, idempotency keys, and a replay log.",
      "Subscription as an explicit state machine — every transition auditable, no implicit branches.",
      "Reconciliation worker that closes the gap between provider truth and our DB on a schedule.",
      "Dunning flow with retries, customer comms, and a graceful downgrade path.",
      "AI-ready billing data shape so downstream automation and decision-support can reason about it."
    ],
    impact: [
      "Fewer flaky billing tests and clearer transformations between quote, subscription, and invoice.",
      "The audit log made the real story legible whenever a customer escalated."
    ],
    leadership:
      "I wrote the design doc, ran an architecture review with senior engineers, and made the call to invest in the reconciliation worker before launch instead of after."
  },
  {
    id: "torre-monetization",
    n: "05",
    title: "Torre monetization, referrals & payments",
    summary:
      "Subscription + referral + payments stack at Torre. Stripe-based flows, Scala/MySQL backend, internal abuse-prevention, the full product surface.",
    tags: ["Stripe", "Scala", "MySQL", "Referrals", "Growth"],
    diagram: "torre",
    twilioRelevance:
      "Communication-driven growth (referrals, payment receipts, dunning emails) is naturally Twilio-shaped: SMS receipts, WhatsApp activations, transactional flows.",
    context:
      "At Torre I worked on the monetization slice — from paid plans to a referral program that paid creators in real cash. Torre Concierge was part of that surface.",
    decisions: [
      "Stripe Checkout for trust and speed; custom on top for catalog and entitlements.",
      "Referral attribution as an event stream — every credit traceable to the click that earned it.",
      "Server-side feature gating with a thin TS SDK so product teams could ship plans without billing knowledge."
    ],
    impact: [
      "Shipped the monetization and referral primitives that growth and product experimentation later built on.",
      "Referral program became a measurable acquisition channel down to cohorts."
    ],
    leadership:
      "My growth at Torre was unusually fast because I consistently took ownership beyond my formal role — improving systems, mentoring engineers, and pulling product outcomes across the line."
  }
];

export const leadershipRows: LeadershipRow[] = [
  {
    n: "L · 01",
    title: "Aligning frontend and backend architecture",
    body: 'I run "contract-first" reviews before code: shared types, error vocabulary, paging shapes. Stops integration thrash before it starts.',
    meta: ["Cross-team", "Architecture"]
  },
  {
    n: "L · 02",
    title: "Preventing architecture anti-patterns",
    body: 'I keep a short, evergreen list of patterns I won\'t ship — sync-only critical paths, hidden state, magic strings. Reviews go faster when "no" has a citation.',
    meta: ["Quality", "Review culture"]
  },
  {
    n: "L · 03",
    title: "Coaching engineers, improving delivery quality",
    body: "My favorite shape: take a mid-level engineer, hand them an ambitious chunk, pair on the first 20%, then get out of their way. Both of us level up.",
    meta: ["Mentorship", "Delivery"]
  },
  {
    n: "L · 04",
    title: "Accelerated leadership growth at Torre",
    body: "Growth came from consistently taking ownership beyond my formal role — improving systems, mentoring engineers, and pulling product outcomes across the line.",
    meta: ["Career", "Ownership"]
  }
];

export const proudMoments: ProudTile[] = [
  {
    n: "P · 01",
    title: "Moving into Disney's Genie AI innovation work",
    body: 'Joining the team that gets to ask "what does AI feel like when it\'s actually delightful?" — and being trusted with the creator-facing surface of it.',
    badge: "Innovation"
  },
  {
    n: "P · 02",
    title: "Building this AI portfolio assistant",
    body: "Shipped a real RAG + agent over my own work. Used in real interviews. The page you're on is one of its routes.",
    badge: "Built in 2025"
  },
  {
    n: "P · 03",
    title: "Fintech / blockchain hackathon — won.",
    body: "A team prototype under tight time-constrained product and engineering conditions. We won. I still keep the photo.",
    badge: "Hackathon"
  },
  {
    n: "P · 04",
    title: "Career growth through ownership",
    body: "I have never had to ask for the next role. The work asked for it on my behalf — by being legible, finished, and useful to the people around me.",
    badge: "Through-line"
  }
];

export const hero = {
  eyebrowPrefix: "— Interview companion · ",
  eyebrowSuffix: " —",
  title: { line1: "Twilio", line2: "Interview", line3: "Room" },
  sub: "A focused view of the systems, stories, and technical decisions I'd love to discuss today.",
  intro:
    "I built this page as a curated companion for our conversation — a quick way to explore my applied AI work, product engineering background, leadership stories, and the kinds of systems I enjoy designing.",
  chips: [
    { label: "Senior Software Engineer", variant: "primary" as const },
    { label: "Applied AI & Product Engineering", variant: "primary" as const },
    { label: "Made for Twilio", variant: "twilio" as const }
  ]
};
