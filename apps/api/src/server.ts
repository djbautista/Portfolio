import { buildApp } from "#app";
import { getApiEnv } from "#env";

async function main(): Promise<void> {
  const env = getApiEnv();
  const app = await buildApp();

  // Defensive: the Twilio webhook fires deferred work via setImmediate; if
  // a future code path forgets the .catch, log instead of crashing the
  // process (Node's default behavior on newer versions).
  process.on("unhandledRejection", (reason) => {
    app.log.error({ reason }, "process.unhandled_rejection");
  });

  try {
    const address = await app.listen({
      host: env.API_HOST,
      port: env.API_PORT,
    });
    app.log.info({ address, environment: env.NODE_ENV }, "api.listening");
  } catch (err) {
    app.log.error({ err }, "api.listen_failed");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[@portfolio/api] fatal:", err);
  process.exit(1);
});
