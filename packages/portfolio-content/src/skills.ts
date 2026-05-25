export interface SkillGroup {
  category: string;
  items: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    category: 'Frontend',
    items: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'Redux',
      'Modular UI Architecture',
    ],
  },
  {
    category: 'Backend',
    items: [
      'Node.js',
      'Python',
      'Django',
      'REST',
      'GraphQL',
      'Microservices',
      'Scala',
      'Go/Golang',
    ],
  },
  {
    category: 'Cloud / DevOps',
    items: [
      'AWS',
      'Docker',
      'Kubernetes',
      'Terraform',
      'GitHub Actions',
      'Serverless',
      'CI/CD',
      'IBM Cloud',
    ],
  },
  {
    category: 'Data / Analytics',
    items: [
      'PostgreSQL',
      'MySQL',
      'SQL',
      'Snowflake',
      'Snowplow',
      'ETL',
      'Data Pipelines',
      'Product Analytics',
      'Event Tracking',
      'pgvector',
      'Vector Databases',
    ],
  },
  {
    category: 'Testing / Reliability',
    items: [
      'Jest',
      'Cypress',
      'Vitest',
      'React Testing Library',
      'Playwright',
      'E2E Testing',
      'Quality Gates',
      'Observability',
      'SLA Delivery',
    ],
  },
  {
    category: 'AI Engineering',
    items: [
      'LLM Applications',
      'RAG',
      'LangChain',
      'LangGraph',
      'Agentic Workflows',
      'Tool Calling',
      'Function Calling',
      'OpenAI API',
      'Anthropic API',
      'Prompt Engineering',
      'Embeddings',
      'Vector Search',
      'AI Evaluation',
      'Guardrails',
      'AI-Assisted Decision Support',
    ],
  },
];
