import {
  ChatResponseSchema,
  ErrorResponseSchema,
} from '@portfolio/contracts';
import type {
  ChatRequest,
  ChatResponse,
  ErrorCode,
  ErrorResponse,
} from '@portfolio/contracts';

export class AgentClientError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(response: ErrorResponse, options?: { cause?: unknown }) {
    super(response.message, options);
    this.name = 'AgentClientError';
    this.code = response.code;
    this.details = response.details;
  }
}

// Single seam for all agent network access — UI components must not call fetch directly.
export async function sendAgentMessage(
  input: ChatRequest,
): Promise<ChatResponse> {
  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (cause) {
    throw new AgentClientError(
      {
        code: 'internal_error',
        message: 'Failed to reach the agent service.',
      },
      { cause },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await response.json();
  } catch (cause) {
    throw new AgentClientError(
      {
        code: 'internal_error',
        message: 'Agent service returned a non-JSON response.',
      },
      { cause },
    );
  }

  if (!response.ok) {
    const parsed = ErrorResponseSchema.safeParse(rawBody);
    if (parsed.success) {
      throw new AgentClientError(parsed.data);
    }
    throw new AgentClientError(
      {
        code: 'internal_error',
        message: `Agent service returned an unrecognised error (HTTP ${response.status}).`,
      },
      { cause: parsed.error },
    );
  }

  const parsed = ChatResponseSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new AgentClientError(
      {
        code: 'internal_error',
        message: 'Agent service returned an unrecognised response shape.',
      },
      { cause: parsed.error },
    );
  }
  return parsed.data;
}
