import { buildApp } from "#app";
import { getApiEnv } from "#env";

async function main(): Promise<void> {
  const env = getApiEnv();
  const app = await buildApp();

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
