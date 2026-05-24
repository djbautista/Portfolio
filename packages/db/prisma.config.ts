import path from "node:path";

import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load env from the repo-root .env explicitly. Avoids relying on CWD and
// prevents drifting toward a package-level duplicate .env file.
config({ path: path.resolve(import.meta.dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
