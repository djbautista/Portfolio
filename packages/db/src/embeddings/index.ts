import { createOpenAIEmbeddingProvider } from "./openai";
import type { EmbeddingProvider } from "./types";

let provider: EmbeddingProvider | undefined;

export function getEmbeddingProvider(): EmbeddingProvider {
  return (provider ??= createOpenAIEmbeddingProvider());
}

export { createOpenAIEmbeddingProvider };
export type { EmbeddingProvider };
