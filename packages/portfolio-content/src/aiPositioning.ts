// Applied AI positioning copy. Consumed by the RAG seed so the agent can
// answer "what is David's AI positioning?" / "what AI systems has David
// worked on?" from a dedicated, well-titled chunk. Written in first person
// to keep voice consistent with the rest of the public-facing site.

export const aiPositioning = {
  headline: 'Applied AI & Product Engineering',
  summary:
    "I design and ship production-grade AI systems that real users can rely on. My focus is the part of AI that lives next to product engineering: RAG, agentic workflows, tool calling, evaluation, observability, and the architectural choices that make an LLM-powered feature behave predictably under load.",
  paragraphs: [
    "I work on production-grade LLM applications end-to-end: prompt design, retrieval over embeddings and vector databases (pgvector and friends), agentic orchestration with LangGraph, tool/function calling against OpenAI and Anthropic APIs, and the surrounding evaluation, guardrails, and observability that keep those systems honest.",
    "I treat AI features the same way I treat any other production system: clear contracts, measurable behavior, fast feedback loops, and a UI that earns the user's trust. That means investing in retrieval quality, structured outputs, deterministic fallbacks, and tracing — not just demo-quality prompts.",
    "I'm most useful where Applied AI meets product engineering and technical leadership: choosing the right architecture for an AI-powered workflow, aligning frontend and backend teams around it, and shipping something that holds up beyond the first prototype.",
  ],
  capabilities: [
    'Production-grade LLM applications and chat experiences',
    'Retrieval-Augmented Generation (RAG) with embeddings and vector search',
    'Agentic workflows and orchestration with LangGraph',
    'Tool calling and function calling against OpenAI and Anthropic APIs',
    'Prompt engineering, structured outputs, and deterministic fallbacks',
    'AI evaluation, observability, and guardrails for reliable behavior',
    'pgvector and vector database design for product-scale retrieval',
    'AI-assisted decision support layered on existing product data',
  ],
} as const;
