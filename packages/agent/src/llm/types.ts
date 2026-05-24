export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResult {
  content: string;
  model: string;
  finishReason?: string;
  usage?: ChatUsage;
}

export interface ChatProvider {
  readonly model: string;
  chat(request: ChatRequest): Promise<ChatResult>;
}
