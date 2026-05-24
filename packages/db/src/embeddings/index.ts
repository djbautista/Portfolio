import { createOpenAIEmbeddingProvider } from "./openai.js";
import type { EmbeddingProvider } from "./types.js";

let provider: EmbeddingProvider | undefined;

export function getEmbeddingProvider(): EmbeddingProvider {
  return (provider ??= createOpenAIEmbeddingProvider());
}

export { createOpenAIEmbeddingProvider };
export type { EmbeddingProvider };
