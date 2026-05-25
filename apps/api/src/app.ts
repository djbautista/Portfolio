import cors from "@fastify/cors";
import {
  ErrorResponseSchema,
  type ErrorResponse,
} from "@portfolio/contracts/errors";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { getApiEnv, parseCorsOrigins } from "#env";
import { HttpError, ValidationError } from "#errors";
import { registerChatRoutes } from "#routes/chat";
import { registerHealthRoutes } from "#routes/health";

export async function buildApp(): Promise<FastifyInstance> {
  const env = getApiEnv();

  const app = Fastify({
    logger: { level: env.NODE_ENV === "production" ? "info" : "debug" },
    disableRequestLogging: false,
  });

  const origins = parseCorsOrigins(env.API_CORS_ORIGINS);
  const corsOrigin =
    origins ?? (env.NODE_ENV === "production" ? false : true);
  await app.register(cors, { origin: corsOrigin });

  app.setErrorHandler((err, req, reply) => {
    const payload = toErrorResponse(err);
    const status = httpStatusFor(err);

    if (status >= 500) {
      req.log.error({ err, requestId: req.id }, "request.error");
    } else {
      req.log.warn(
        { err: serializeForLog(err), requestId: req.id, status },
        "request.client_error",
      );
    }

    reply.code(status).send(payload);
  });

  await registerHealthRoutes(app);
  await registerChatRoutes(app);

  return app;
}

function httpStatusFor(err: unknown): number {
  if (err instanceof HttpError) return err.status;
  if (err instanceof ZodError) return 400;
  return 500;
}

function toErrorResponse(err: unknown): ErrorResponse {
  if (err instanceof HttpError) {
    return ErrorResponseSchema.parse({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }
  if (err instanceof ZodError) {
    const wrapped = new ValidationError(err);
    return ErrorResponseSchema.parse({
      code: wrapped.code,
      message: wrapped.message,
      details: wrapped.details,
    });
  }
  // Unknown errors: never echo internals to the client. The full error is
  // logged server-side in the error handler above.
  return ErrorResponseSchema.parse({
    code: "internal_error",
    message: "An unexpected error occurred.",
  });
}

function serializeForLog(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message };
  }
  return { value: String(err) };
}
