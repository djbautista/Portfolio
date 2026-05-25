import type { FastifyInstance } from "fastify";

import { getApiEnv } from "#env";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => {
    const env = getApiEnv();
    return {
      status: "ok",
      service: "@portfolio/api",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });
}
