import type { ZodError } from "zod";
import type { ErrorCode } from "@portfolio/contracts/errors";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends HttpError {
  constructor(zodError: ZodError) {
    super(400, "validation_error", "Request body failed validation.", {
      issues: zodError.issues.map((i) => ({
        path: i.path,
        message: i.message,
        code: i.code,
      })),
    });
  }
}

export class ConversationNotFoundError extends HttpError {
  constructor(conversationId: string) {
    super(
      404,
      "conversation_not_found",
      `Conversation "${conversationId}" was not found.`,
    );
  }
}

export class AgentFailureError extends HttpError {
  constructor(cause: unknown) {
    super(500, "agent_failure", "The assistant failed to produce a response.");
    this.cause = cause;
  }
}
