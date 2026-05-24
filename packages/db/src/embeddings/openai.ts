import OpenAI from "openai";

import { getEmbeddingEnv } from "../env.js";
import type { EmbeddingProvider } from "./types.js";

// OpenAI documents a 2048-input cap on embeddings; we chunk requests at this
// boundary and concatenate results in order.
const OPENAI_BATCH_CAP = 2048;

export interface OpenAIEmbeddingProviderOptions {
  model?: string;
  dimensions?: number;
}

export function createOpenAIEmbeddingProvider(
  options: OpenAIEmbeddingProviderOptions = {},
): EmbeddingProvider {
  const env = getEmbeddingEnv();
  const model = options.model ?? env.EMBEDDING_MODEL;
  const dimensions = options.dimensions ?? env.EMBEDDING_DIMENSIONS;

  let client: OpenAI | undefined;

  function getClient(): OpenAI {
    if (client) return client;
    // Batch ingestion is sensitive to transient 429/5xx; the SDK retries on
    // both with exponential backoff. Timeout caps an individual request so a
    // hung call doesn't stall the whole seed.
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      maxRetries: 3,
      timeout: 30_000,
    });
    return client;
  }

  return {
    model,
    dimensions,
    async embed(texts, signal) {
      if (texts.length === 0) return [];

      const openai = getClient();
      const vectors: number[][] = [];

      for (let i = 0; i < texts.length; i += OPENAI_BATCH_CAP) {
        const batch = texts.slice(i, i + OPENAI_BATCH_CAP);
        const response = await openai.embeddings.create(
          {
            model,
            dimensions,
            input: batch,
          },
          { signal },
        );

        if (response.data.length !== batch.length) {
          throw new Error(
            `OpenAI returned ${response.data.length} embeddings for a batch of ${batch.length}.`,
          );
        }

        for (const [j, item] of response.data.entries()) {
          if (item.embedding.length !== dimensions) {
            throw new Error(
              `OpenAI embedding at index ${i + j} has ${item.embedding.length} dimensions, expected ${dimensions}.`,
            );
          }
          vectors.push(item.embedding);
        }
      }

      return vectors;
    },
  };
}
