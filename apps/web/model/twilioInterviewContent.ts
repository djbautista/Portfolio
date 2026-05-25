export type InterviewCategory = 'technical' | 'leadership' | 'proud';

export interface InterviewStory {
  id: string;
  title: string;
  category: InterviewCategory;
  summary: string;
  context?: string;
  decision?: string;
  impact?: string;
  leadershipAngle?: string;
  twilioRelevance?: string;
  discussionPrompts?: string[];
  assets?: { label: string; href?: string }[];
}

export type VisualResourceCategory =
  | 'diagram'
  | 'screenshot'
  | 'photo'
  | 'document'
  | 'link';

export interface VisualResource {
  id: string;
  label: string;
  category: VisualResourceCategory;
  description?: string;
  href?: string;
}

export interface InterviewContent {
  hero: {
    title: string;
    subtitle: string;
    intro: string;
    positioning: string;
    pitch: string;
  };
  whyThisConversation: {
    heading: string;
    body: string;
    bullets: string[];
  };
  technicalStories: InterviewStory[];
  leadershipStories: InterviewStory[];
  proudMoments: InterviewStory[];
  visualResources: VisualResource[];
}

export const twilioInterviewContent: InterviewContent = {
  hero: {
    title: 'Twilio Interview Room',
    subtitle:
      'A focused view of the systems, stories, and technical decisions I’d love to discuss today.',
    intro:
      'I built this page as a curated companion for our conversation: a quick way to explore my applied AI work, product engineering background, leadership stories, and the kinds of systems I enjoy designing.',
    positioning: 'Senior Software Engineer | Applied AI & Product Engineering',
    pitch:
      'I build production-grade software, lead engineering teams, and design AI-powered systems that are useful, reliable, and ready for real users.',
  },
  whyThisConversation: {
    heading: 'Why this conversation matters',
    body: 'I’m especially interested in Twilio because the work sits close to the kind of systems I like building: communication workflows, APIs, product infrastructure, AI-assisted experiences, and reliability-sensitive user journeys.',
    bullets: [
      'Applied AI systems',
      'Product engineering',
      'APIs and integrations',
      'Messaging and customer communication',
      'Reliable event-driven workflows',
      'Developer experience',
      'Portfolio agent with planned WhatsApp/Twilio continuation',
    ],
  },
  technicalStories: [
    {
      id: 'multipart-s3',
      title: 'Direct-to-S3 multipart upload architecture for large video assets',
      category: 'technical',
      summary:
        'I helped redesign an enterprise upload flow for very large video ad assets, often over 100 GB, submitted from different regions. Instead of proxying chunked uploads through the backend, I pushed the architecture toward direct client-to-S3 multipart uploads using presigned URLs, reducing backend pressure and addressing the real client-to-server bottleneck.',
      context:
        'Large video ad assets, sometimes north of 100 GB, uploaded by global users across corporate VPNs and uneven network conditions. The existing pipeline proxied chunks through our backend, which became the bottleneck rather than the slow client links.',
      decision:
        'Move to direct client-to-S3 multipart uploads with presigned URLs. The backend hands out URLs and tracks state; the bytes never touch our servers.',
      impact:
        'Removed the backend as an upload bridge, freed up infrastructure capacity, and aligned the architecture with where the real latency actually lived. Cleaner contracts between frontend and backend, fewer moving pieces to scale.',
      leadershipAngle:
        'I had to push back on the initial instinct to optimize the backend bridge and re-frame the conversation around the real bottleneck. That meant aligning frontend, backend, and product on a different mental model before any code changed.',
      twilioRelevance:
        'Scalable file transfer, presigned-URL patterns, frontend/backend contracts, and reliability-sensitive user journeys — all close cousins of communication infrastructure work.',
      discussionPrompts: [
        'How we framed the bottleneck and brought teams along',
        'Trade-offs of presigned URLs vs. proxied uploads at this scale',
        'Failure modes: resumability, retries, and partial-upload recovery',
      ],
    },
    {
      id: 'genie-ai',
      title: 'Genie AI: AI-powered video generation product',
      category: 'technical',
      summary:
        'I’m currently working on Disney’s Genie AI, an innovation product around AI-powered video generation workflows. My role is focused on product/frontend leadership, UI architecture, and integrating AI-powered workflows into a usable enterprise experience.',
      context:
        'Innovation product inside Disney exploring how AI-powered video generation can fit into real enterprise creative workflows. The product needs to be polished and trustworthy enough for internal users, not just a tech demo.',
      decision:
        'Lead the product/frontend side: UI architecture, integration patterns, and how human-in-the-loop steps thread through workflows involving providers such as Runway, Sora, and Google Veo as we explore them.',
      impact:
        'Helping turn AI workflows into an enterprise-grade experience — with the affordances, recoverability, and clarity that real users need.',
      leadershipAngle:
        'Aligning design, AI/ML, and platform teams around a single coherent product shape, while keeping the frontend architecture flexible enough for fast iteration.',
      twilioRelevance:
        'AI product UX, frontend architecture under change, human-in-the-loop product design — directly relevant to AI-assisted communication experiences.',
      discussionPrompts: [
        'Designing UX around non-deterministic AI outputs',
        'Keeping the frontend flexible across evolving provider integrations',
        'Where human review fits in generative pipelines',
      ],
    },
    {
      id: 'portfolio-rag',
      title: 'AI portfolio assistant with RAG and agentic workflows',
      category: 'technical',
      summary:
        'This portfolio is also an applied AI project. I’m building an AI assistant that can answer questions about my background, projects, skills, and technical decisions using RAG, LangGraph, pgvector, embeddings, a dedicated API layer, and a frontend chat experience.',
      context:
        'I wanted my portfolio to be more than a static site — something that reflects how I actually think about applied AI systems end to end: knowledge modeling, retrieval, agent orchestration, evaluation, and a real product UX.',
      decision:
        'Build it as a small but production-shaped stack: a dedicated API, a typed contracts package, embeddings + pgvector for retrieval, LangGraph for agent flow, and a polished chat surface in the web app. Planned WhatsApp/Twilio continuation so the same agent can meet people where they already are.',
      impact:
        'A working applied-AI product I own end to end — useful as both a portfolio piece and a sandbox for the kinds of patterns I want to bring to production work.',
      leadershipAngle:
        'Treating a personal project with the same discipline I’d expect on a real team: typed contracts, evaluation, observability, and a clear knowledge model.',
      twilioRelevance:
        'Conversational agent UX, messaging continuation, retrieval and evaluation, developer experience — many of the same primitives Twilio products serve.',
      discussionPrompts: [
        'Knowledge modeling and RAG corpus design',
        'Where LangGraph helps vs. where simpler orchestration is enough',
        'Evaluation: how I’d grade agent answers in this domain',
        'What a WhatsApp/Twilio continuation looks like architecturally',
      ],
    },
    {
      id: 'turnstile-billing',
      title: 'Turnstile billing and subscription workflows',
      category: 'technical',
      summary:
        'I worked on subscription, billing, quote, invoice, and usage-based workflows across TypeScript, React/Next.js, and AWS. A lot of the work involved stabilizing complex data-model transformations and improving test reliability around billing scenarios.',
      context:
        'Billing is one of the least forgiving domains: quotes, subscriptions, metering, invoicing, and event history all have to agree, across a TypeScript / React / Next.js / AWS stack.',
      decision:
        'Invest in the data-model transformations between quote, subscription, and invoice; stabilize the E2E and integration tests around billing scenarios; and shape the data so it’s ready for future automation and AI-assisted decisions.',
      impact:
        'Fewer flaky billing tests, clearer transformations, and a billing data shape that downstream tooling can actually reason about.',
      leadershipAngle:
        'Holding the line on correctness in a domain where shortcuts compound. Standardizing review and testing practices around billing changes specifically.',
      twilioRelevance:
        'Correctness-heavy product systems, reliability, testing, and domain modeling — the same posture good messaging/usage-based products need.',
      discussionPrompts: [
        'Strategies for trustworthy E2E tests in billing flows',
        'Shaping data for both humans and future automation',
        'Where event history changes the design',
      ],
    },
    {
      id: 'torre-monetization',
      title: 'Torre monetization, referrals, and payments',
      category: 'technical',
      summary:
        'At Torre, I worked on monetization and growth infrastructure, including referral tracking, subscriptions, recurring payments, and Stripe-based payment flows.',
      context:
        'Torre is a recruitment platform; I worked on the monetization and growth side — referral tracking (who referred whom), subscriptions, recurring payments, and Stripe-based flows, in a Scala / MySQL backend.',
      decision:
        'Build the referral and monetization primitives in a way that both product analytics and growth experiments could actually use, including the Torre Concierge surface.',
      impact:
        'Shipped the monetization and referral primitives that growth and product experimentation later built on.',
      leadershipAngle:
        'Bridging backend, frontend, and product/analytics needs into a single coherent monetization story.',
      twilioRelevance:
        'Growth systems, payment workflows, backend/frontend integration — patterns that show up wherever products are billed and referred.',
      discussionPrompts: [
        'Referral tracking at scale without leaking attribution',
        'How payment flows shape backend APIs',
        'When to use Stripe primitives directly vs. wrapping them',
      ],
    },
    {
      id: 'torre-performance',
      title: 'Torre performance and product analytics',
      category: 'technical',
      summary:
        'I led performance work that reduced Largest Contentful Paint from 22 seconds to 2 seconds, while also working with analytics infrastructure to improve product decision-making.',
      context:
        'Torre’s landing experience had drifted to a Largest Contentful Paint of around 22 seconds. That kind of latency is product-fatal.',
      decision:
        'Treat performance as a product feature: profile carefully, fix the actual hot paths in React/Next.js and the Python/Django backend, and pair that with better Snowplow analytics to understand the user impact.',
      impact:
        'Brought LCP from 22 seconds to about 2 seconds, with analytics infrastructure that made product iteration actually data-informed.',
      leadershipAngle:
        'Making performance a shared, measurable priority across frontend and backend, not a one-engineer crusade.',
      twilioRelevance:
        'Performance, observability, and turning raw telemetry into product decisions — all transferable to communications products.',
      discussionPrompts: [
        'Where the LCP wins actually came from',
        'Pairing performance work with analytics so wins are legible',
        'How to keep performance from regressing afterward',
      ],
    },
  ],
  leadershipStories: [
    {
      id: 'fe-be-alignment',
      title: 'Aligning frontend and backend architecture',
      category: 'leadership',
      summary:
        'I’ve often been the person responsible for making sure frontend needs, backend contracts, and product constraints converge into a system that is actually maintainable.',
      leadershipAngle:
        'I work from the seams: where the frontend stops trusting the backend, where the backend stops modeling the product, where the product stops believing the data. Closing those seams early is most of the job.',
      twilioRelevance:
        'API-first products live or die on contract clarity — this is the work I’m most comfortable owning.',
      discussionPrompts: [
        'A time I rewrote a contract to fit the product instead of the database',
        'How I keep contracts honest as teams scale',
      ],
    },
    {
      id: 'anti-patterns',
      title: 'Preventing architecture anti-patterns',
      category: 'leadership',
      summary:
        'In modernization work, part of my role has been challenging inefficient approaches early, before they become expensive production problems.',
      leadershipAngle:
        'Modernization is mostly about saying “not that” at the right moment, with enough context that the team agrees rather than feels overridden.',
      twilioRelevance:
        'Communication systems compound complexity quickly; preventing the wrong pattern early is much cheaper than refactoring later.',
      discussionPrompts: [
        'A pattern I pushed back on and what we did instead',
        'How I decide when to challenge vs. when to let a team learn',
      ],
    },
    {
      id: 'coaching',
      title: 'Coaching engineers and improving delivery quality',
      category: 'leadership',
      summary:
        'I’ve coached mid-to-senior engineers, standardized code review and testing practices, and helped teams improve reliability and delivery discipline.',
      leadershipAngle:
        'Most of the durable wins come from raising the floor: clearer reviews, healthier tests, more honest delivery signals.',
      discussionPrompts: [
        'How I structure code reviews so they teach as well as gate',
        'What I do when a team’s tests are technically passing but not trustworthy',
      ],
    },
    {
      id: 'torre-growth',
      title: 'Accelerated leadership growth at Torre',
      category: 'leadership',
      summary:
        'At Torre, I grew quickly into leadership because I consistently pushed beyond assigned tasks: improving systems, mentoring others, and taking ownership of product outcomes.',
      leadershipAngle:
        'My growth at Torre was unusually fast because I consistently took ownership beyond my formal role — improving systems, mentoring engineers, and pulling product outcomes across the line.',
      discussionPrompts: [
        'A specific moment that shifted how I was trusted',
        'What “ownership” actually looks like day to day',
      ],
    },
  ],
  proudMoments: [
    {
      id: 'genie-move',
      title: 'Moving into Disney Genie AI innovation work',
      category: 'proud',
      summary:
        'One of the moments I’m most proud of is moving from modernization work into Disney’s Genie AI innovation track, where I can combine product engineering, frontend leadership, and AI-powered workflows.',
      discussionPrompts: [
        'How I positioned myself for the move',
        'What I want this chapter to teach me',
      ],
    },
    {
      id: 'portfolio-ai',
      title: 'Building this AI portfolio assistant',
      category: 'proud',
      summary:
        'This portfolio is not just a website. It is a working applied AI product that reflects the kind of systems I want to build professionally.',
      discussionPrompts: [
        'What I’d build next on top of this stack',
        'Where I’d expect it to break first under real load',
      ],
    },
    {
      id: 'hackathon-winner',
      title: 'Fintech/blockchain hackathon winner',
      category: 'proud',
      summary:
        'I also won a Colombian fintech/blockchain hackathon with a team, building a decentralized technology prototype under time-constrained product and engineering conditions.',
      discussionPrompts: [
        'How we made product decisions on a hackathon clock',
        'What I learned about team dynamics under pressure',
      ],
    },
    {
      id: 'career-ownership',
      title: 'Career growth through ownership',
      category: 'proud',
      summary:
        'I’m proud of the way my career has grown through ownership: stepping into ambiguous problems, aligning people, and turning technical complexity into product progress.',
      discussionPrompts: [
        'A specific ambiguous problem I leaned into',
        'How I balance ownership with not overstepping',
      ],
    },
  ],
  visualResources: [
    {
      id: 'arch-diagrams',
      label: 'Architecture diagrams',
      category: 'diagram',
      description: 'Multipart upload flow, agent orchestration, billing data model.',
    },
    {
      id: 'product-screenshots',
      label: 'Product screenshots',
      category: 'screenshot',
      description: 'Genie AI surfaces, Turnstile billing flows, portfolio chat UI.',
    },
    {
      id: 'hackathon-photo',
      label: 'Hackathon photo',
      category: 'photo',
      description: 'Fintech/blockchain hackathon team photo (to be added).',
    },
    {
      id: 'rag-architecture',
      label: 'AI portfolio / RAG architecture',
      category: 'diagram',
      description: 'Retrieval, embeddings, LangGraph flow, and chat surface.',
    },
    {
      id: 'resume',
      label: 'Resume',
      category: 'document',
      description: 'Latest resume PDF.',
      href: '/davidbautista.pdf',
    },
    {
      id: 'public-links',
      label: 'Public links',
      category: 'link',
      description: 'LinkedIn, GitHub, and other public profiles.',
      href: '/#contact',
    },
  ],
};
