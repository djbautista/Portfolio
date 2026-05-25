export interface Project {
  title: string;
  description: string;
  role: string;
  company: string;
  year: string;
  relevance?: 1 | 2 | 3 | 2.5;
}

export const projects: readonly Project[] = [
  {
    title: 'Genie AI: AI-powered video generation product',
    description:
      "Lead product and frontend engineering on Genie AI, a Disney innovation product designed to integrate generative video providers such as Runway, Sora, and similar services. Focus on enterprise-grade AI workflows, frontend architecture, technical leadership across squads, and the integration patterns that keep an LLM/generative-video pipeline predictable in production.",
    role: 'Senior Software Engineer / Tech Lead',
    company: 'Disney (via Globant)',
    year: '2024-Present',
    relevance: 3,
  },
  {
    title: 'Direct-to-S3 multipart upload architecture for enterprise video assets',
    description:
      "Redesigned the upload flow for very large video ad assets (often 100GB+) submitted from multiple regions. Diagnosed the real bottleneck as the client-to-backend hop, amplified by corporate VPN constraints, and led the shift to direct client-to-S3 multipart uploads via presigned URLs. Drove the cross-team technical negotiation with backend and platform engineers along the way.",
    role: 'Senior Software Engineer / Tech Lead',
    company: 'Disney (via Globant)',
    year: '2024',
    relevance: 3,
  },
  {
    title: 'Enterprise product modernization and frontend leadership',
    description:
      "Led frontend and product modernization across Disney enterprise applications: aligning frontend architecture with backend contracts, preventing inefficient cross-stack anti-patterns, reviewing technical contracts, and steering teams toward scalable patterns for search, data access, and workflow-heavy UIs.",
    role: 'Senior Software Engineer / Tech Lead',
    company: 'Disney (via Globant)',
    year: '2023-Present',
    relevance: 2,
  },
  {
    title: 'AI portfolio assistant with RAG and agentic workflows',
    description:
      "Designed and built this portfolio as a production-like AI assistant that can answer questions about my background, projects, stack, and positioning. Built around RAG with pgvector embeddings, a LangGraph-style agent, an API layer, and a chat UI. WhatsApp / Twilio continuation is planned.",
    role: 'Solo Engineer',
    company: 'Personal project',
    year: '2025-Present',
    relevance: 2,
  },
  {
    title: 'Subscription, billing, quote, and metering workflows',
    description:
      "Built subscription, billing, quote, invoice, and usage-based metering flows in TypeScript with React/Next.js on AWS. Untangled data-model transformations for subscription and metering edge cases, stabilized E2E and integration tests, and structured billing data for downstream automation, analytics, and AI-assisted decision support.",
    role: 'Contractor Senior Software Engineer',
    company: 'Hireworks / Turnstile',
    year: '2025-2026',
    relevance: 2,
  },
  {
    title: 'Performance optimization and product analytics infrastructure',
    description:
      "Led a performance overhaul that reduced LCP from 22s to 2s, improving SEO rankings and retention. Built and operated the Snowplow analytics infrastructure that processed large event streams and powered data-driven product iteration.",
    role: 'Senior Software Engineer',
    company: 'Torre.ai',
    year: '2021-2022',
    relevance: 2,
  },
  {
    title: 'Referral-based monetization and payment infrastructure',
    description:
      "Built the early monetization and viral-growth layer at Torre.ai: referral tracking to attribute who referred whom, payment and payroll flows via Stripe and Torre Concierge, with services in Scala backed by MySQL. Shipped subscription and payment reliability work across the Tech Lead and Senior tenures.",
    role: 'Tech Lead → Senior Software Engineer',
    company: 'Torre.ai',
    year: '2021-2023',
    relevance: 2,
  },
  {
    title: 'Public-sector data platforms and decision support',
    description:
      "Built data platforms, microservices, and decision-support dashboards for public-sector initiatives at UNFPA and Universidad de los Andes. Stack: Python, Django, serverless, IBM Cloud, and D3 visualizations powering urban and social data products that informed policy work.",
    role: 'Software Engineer · Research Assistant',
    company: 'UNFPA & Universidad de los Andes',
    year: '2018-2021',
    relevance: 2,
  },
];
