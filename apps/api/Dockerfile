# syntax=docker/dockerfile:1.7

# Single-stage image for the @portfolio/api Fastify server.
# tsx runs the TypeScript directly — no build step.
FROM node:20-bookworm-slim

WORKDIR /app

# OpenSSL silences a Prisma compatibility warning; not strictly required since
# the @prisma/adapter-pg adapter uses node-postgres, but cheap insurance.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# pnpm via corepack (matches packageManager in root package.json).
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace manifests first for build-cache friendliness.
# All manifests must be present so pnpm-lock.yaml resolves cleanly,
# but --filter below skips installing apps/web (heavy: Next.js, GSAP, etc.).
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/agent/package.json packages/agent/
COPY packages/contracts/package.json packages/contracts/
COPY packages/db/package.json packages/db/
COPY packages/portfolio-content/package.json packages/portfolio-content/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/

# `@portfolio/api...` = api plus its transitive workspace deps. Skips apps/web.
RUN pnpm install --frozen-lockfile --filter @portfolio/api...

# Source for what we actually run.
COPY apps/api apps/api
COPY packages/agent packages/agent
COPY packages/contracts packages/contracts
COPY packages/db packages/db
COPY packages/portfolio-content packages/portfolio-content
COPY packages/eslint-config packages/eslint-config
COPY packages/typescript-config packages/typescript-config

# Prisma client is gitignored — must be generated inside the image.
# prisma.config.ts validates DATABASE_URL at load time but `generate` never
# connects — a placeholder satisfies the config check.
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder \
    pnpm --filter @portfolio/db exec prisma generate

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001
EXPOSE 3001

CMD ["pnpm", "--filter", "@portfolio/api", "run", "start:prod"]
