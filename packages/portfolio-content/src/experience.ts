export interface Role {
  company: string;
  title: string;
  period: string;
  bullets: readonly string[];
}

export const experience: readonly Role[] = [
  {
    company: 'Globant / Disney',
    title: 'Senior Software Engineer / Tech Lead',
    period: '08/2023 - Present',
    bullets: [
      'Lead 8+ engineers on React and Next.js applications for enterprise clients.',
      'Establish reliable foundations for automation, analytics, and AI-powered workflows.',
      'Direct technical strategy across multiple enterprise product streams.',
      'Translate ambiguous business needs into scalable React/Python roadmaps.',
      'Coach mid-to-senior engineers through code review, design review, and pairing.',
      'Standardize testing, delivery, and observability practices across squads.',
    ],
  },
  {
    company: 'Hireworks / Turnstile',
    title: 'Contractor Senior Software Engineer',
    period: '12/2025 - 04/2026',
    bullets: [
      'Built subscription, billing, quote, invoice, and usage-based metering workflows.',
      'TypeScript, React/Next.js, and AWS across the stack.',
      'Untangled data-model transformations for subscriptions and metering.',
      'Stabilized E2E and integration tests, reducing repeated failure patterns.',
      'Structured billing data for downstream automation, analytics, and AI-assisted decision support.',
    ],
  },
  {
    company: 'Torre.ai',
    title: 'Tech Lead — Growth & Monetization',
    period: '07/2022 - 08/2023',
    bullets: [
      'Led a Growth & Monetization squad of 6 engineers.',
      'Shipped retention and monetization features for a recruitment product platform.',
      'Built CI/CD pipelines and quality gates that raised delivery confidence.',
      'Owned Snowplow product-intelligence instrumentation end-to-end.',
      'Maintained internal TypeScript libraries in a Lerna monorepo architecture.',
    ],
  },
  {
    company: 'Torre.ai',
    title: 'Senior Software Engineer',
    period: '12/2021 - 07/2022',
    bullets: [
      'Drove a performance overhaul that reduced LCP from 22s to 2s.',
      'Built full-stack product features across Python/Django, React, and Next.js.',
      'Designed and shipped Snowplow analytics infrastructure for product insights.',
    ],
  },
  {
    company: 'Torre.ai',
    title: 'Mid-Level Software Engineer',
    period: '01/2021 - 12/2021',
    bullets: [
      'Built early monetization features including subscription and payment flows.',
      'Worked across React/Next.js SSR, Scala services, and MySQL.',
      'Hardened subscription flow reliability through targeted refactors and tests.',
    ],
  },
  {
    company: 'UNFPA (United Nations Population Fund)',
    title: 'Software Engineer & Data Analyst',
    period: '07/2018 - 01/2021',
    bullets: [
      'Built Python microservices and data platforms for public-sector initiatives.',
      'Designed D3-based data visualizations and dashboards.',
      'Delivered decision-support tooling that informed policy work.',
    ],
  },
  {
    company: 'Universidad de los Andes',
    title: 'Research Assistant',
    period: '01/2020 - 01/2021',
    bullets: [
      'Built Django/Python dashboards on IBM Cloud.',
      'Produced urban data visualizations from civic and research datasets.',
      'Extended undergraduate thesis research into a deployable analytical platform.',
    ],
  },
  {
    company: 'Universidad de los Andes',
    title: 'Junior Software Engineer',
    period: '06/2017 - 12/2017',
    bullets: [
      'Built React-based data visualization platforms for public research initiatives.',
      'Implemented analytical modules used by faculty and researchers.',
    ],
  },
];
