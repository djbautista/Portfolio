import OpenAI from "openai";

import { getChatEnv } from "@/env";
import type { ChatProvider } from "./types";

export interface OpenAIChatProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export function createOpenAIChatProvider(
  options: OpenAIChatProviderOptions = {},
): ChatProvider {
  const env = getChatEnv();
  const model = options.model ?? env.CHAT_MODEL;
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? env.CHAT_MAX_TOKENS;
  const timeoutMs = options.timeoutMs ?? env.CHAT_TIMEOUT_MS;

  let client: OpenAI | undefined;

  function getClient(): OpenAI {
    if (client) return client;
    // Chat completions tolerate the same transient 429/5xx classes as
    // embeddings; reuse the SDK's exponential backoff with a per-request
    // timeout so a hung call doesn't stall the whole run.
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      maxRetries: 3,
      timeout: timeoutMs,
    });
    return client;
  }

  return {
    model,
    async chat({ messages, temperature: t, maxTokens: m, signal }) {
      const openai = getClient();

      const response = await openai.chat.completions.create(
        {
          model,
          temperature: t ?? temperature,
          max_tokens: m ?? maxTokens,
          messages,
        },
        { signal },
      );

      const choice = response.choices[0];
      const content = choice?.message?.content;
      if (!content) {
        throw new Error(
          `OpenAI chat completion returned no content for model ${model}.`,
        );
      }

      return {
        content,
        model,
        finishReason: choice?.finish_reason ?? undefined,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    },
  };
}
