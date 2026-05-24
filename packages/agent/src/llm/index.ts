import { createOpenAIChatProvider } from "./openai";
import type { ChatProvider } from "./types";

let provider: ChatProvider | undefined;

export function getChatProvider(): ChatProvider {
  return (provider ??= createOpenAIChatProvider());
}

export { createOpenAIChatProvider };
export type {
  ChatProvider,
  ChatMessage,
  ChatRequest,
  ChatResult,
  ChatRole,
  ChatUsage,
} from "./types";
