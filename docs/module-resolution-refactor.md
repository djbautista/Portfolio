# Module Resolution Refactor: Removing the `.js` Suffix from Imports

> Status: Implemented
> Author: Engineering
> Date: 2026-05-24
> Applies to: `packages/contracts`, `packages/db`, `packages/portfolio-content`, `packages/typescript-config`, and the (future) `apps/api`, `apps/worker`

---

## TL;DR

Today, files inside our shared packages contain imports that look like this:

```ts
// packages/contracts/src/index.ts
export * from "./common.js";
export * from "./channel.js";
```

That `.js` suffix on a `.ts` file looks wrong — and in 2026, in a Turborepo monorepo whose only consumers are our own TypeScript apps, it largely *is* wrong. This document explains:

1. Why those `.js` suffixes exist in the first place.
2. Why they made some sense at scaffold time but no longer fit our actual architecture.
3. What pattern we're switching to and why it's the one Turborepo's own docs lead with.
4. The full tradeoff space so the decision is reversible if our assumptions ever break.
5. Step-by-step refactor instructions.

**The chosen pattern:** "Just-in-Time Packages" — shared packages export raw `./src/index.ts`, and every consuming app (Next, Fastify API, Worker) transpiles them as part of its own build. No `.js` suffixes. No build step inside the shared packages.

---

## Part 1 — Background: Why does this question even exist?

If you've only ever written modern TypeScript inside a bundler (Vite, Next, webpack, esbuild), you may have never seen a `.js` suffix on a relative import in your life. Here's why it shows up at all.

### Two different module systems

JavaScript has two module systems that coexist in the ecosystem:

| System | Syntax | How files reference each other |
|---|---|---|
| **CommonJS (CJS)** | `const x = require("./foo")` | Node's resolver tries `./foo.js`, `./foo/index.js`, etc. automatically. |
| **ES Modules (ESM)** | `import x from "./foo.js"` | Node's ESM resolver **does not guess extensions**. You must spell it out. |

ESM is the "modern" standard. It's what browsers ship natively. It's what Node has supported since v12 and made first-class in v20. It's what every modern tool is moving toward.

But the ESM specification, and Node's implementation of it, made one decision that bites TypeScript users: **relative imports between ESM files must include the runtime file extension.**

### Where TypeScript gets caught in the middle

When you write TypeScript, you write `.ts` files. But your code, when it actually runs, runs as `.js` files (after `tsc` or a bundler turns them into JavaScript). So a question arises:

> When I write `import { foo } from "./bar"` in `bar.ts`, what extension should appear in the source?

TypeScript's answer depends on a config setting called **`moduleResolution`**:

- **`"NodeNext"` / `"Node16"`** — TS will mirror Node's native ESM rules. You must write the *runtime* extension, which is `.js`, even though the source file is `bar.ts`. TS rewrites `.ts → .js` on emit. This is correct for code that will be executed by `node` directly.
- **`"Bundler"`** — TS knows a bundler will handle resolution, so it allows extensionless imports (`./bar`) and doesn't enforce ESM's strictness. This is correct for code that will be processed by Next, Vite, esbuild, webpack, tsup, tsx, etc.

That's the entire mystery. The `.js` suffix isn't a style choice. It's the price of telling TypeScript: *"resolve my imports the same way Node does at runtime."*

### "But it's a `.ts` file, why `.js`?"

Because in TypeScript-with-NodeNext, the import path refers to **what will exist at runtime**, not what exists in source. After compilation, `bar.ts` becomes `bar.js`. The import has to point at the runtime artifact. TS is doing the compile-time mapping for you — it sees `./bar.js`, knows there's no `bar.js` in source, finds `bar.ts`, and uses it for type-checking. At emit time it leaves the path alone because by then the file *will* be `bar.js`.

This is genuinely confusing the first time you see it, and it's why most teams avoid the configuration that requires it unless they have a specific reason.

---

## Part 2 — Where our repo is today

### The configuration

`packages/typescript-config/base.json`:

```jsonc
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    // ...
  }
}
```

`packages/contracts/package.json` and `packages/db/package.json` both declare:

```jsonc
{
  "type": "module",
  "main": "./src/index.ts",
  "exports": { ".": { "default": "./src/index.ts" } }
}
```

That combo — `NodeNext` resolution + `"type": "module"` — is what forces the `.js` suffix in every relative import inside those packages.

### The actual `.js`-suffixed imports

**23 relative-import lines across 12 TypeScript source files**, distributed across `@portfolio/contracts` (5 lines / 3 files) and `@portfolio/db` (18 lines / 9 files, split between `src/` and `scripts/`). The full inventory was confirmed via `grep -rn -E "from ['\"]\.+/[^'\"]+\.js['\"]"` excluding `node_modules` and Prisma-generated paths.

**Two additional `.js`-suffixed imports inside `packages/db/src/index.ts` are kept as-is**: lines 4 and 23, both referencing `./generated/prisma/client.js`. That path resolves to a real generated `.js` file produced by `prisma generate` — it is not TypeScript source, so the extension is correct and intentional.

A separate hit in `apps/web/components/common/Typography/index.tsx` is **not** the same pattern — `import Typed from 'typed.js'` is just the npm package name of the *typed.js* library.

The new `@portfolio/content` package (introduced by PR #7) already opted out of `NodeNext` via a per-package override in its `tsconfig.json` and uses extensionless imports throughout — a precedent that is folded into this refactor (the override becomes redundant once `base.json` switches and is removed for cleanliness).

### Why this configuration exists

It's the default the `create-turbo` starter ships with. It's defensible-by-default because it makes the shared packages portable to Node-native-ESM consumers in theory. It's also why most people who use the starter eventually ask the same question you just asked.

### Who actually consumes the shared packages today

Only `apps/web` (Next.js). Next uses bundler-based resolution. The `.js` suffixes in `packages/contracts` are paying a cost (cognitive overhead, surprised developers) for a benefit nobody is collecting.

---

## Part 3 — What we're about to add changes the math

The upcoming apps:

- `apps/api` — Fastify HTTP server. Pure Node runtime.
- `apps/worker` — Agentic RAG worker. Pure Node runtime, likely long-running.

A reasonable instinct here is: *"Node services? Then we need Node-native ESM. Keep the `.js` suffixes."* That instinct is wrong, and understanding *why* is the crux of this document.

The question is not "are the consumers Node?" The question is **"do the consumers run TypeScript source directly through `node`, or do they go through a transpiler/bundler first?"**

In 2026, nobody ships TypeScript to production by running `tsc` and then `node dist/index.js` with raw Node ESM resolution. The actually-used patterns for production TypeScript Node services are:

| Pattern | How it works | Cares about `.js` suffix? |
|---|---|---|
| **`tsx` (dev)** | Transpiles on the fly via esbuild. | No — extensionless works. |
| **`tsup` / `esbuild` (prod)** | Bundles app + all workspace deps into a single `dist/index.js`. | No — extensions handled at emit. |
| **`ts-node` (legacy)** | Transpiles on the fly via TS. | Depends on config, but usually no. |
| **Raw `node dist/index.js` after `tsc`** | True Node ESM execution of unbundled output. | **Yes — `.js` required.** |

The last row is the only one that needs the `.js` pattern. And nobody does that in a monorepo with shared workspace packages, because then *every* shared package would also need to be pre-built into `dist/` for Node to find at runtime — and you've signed up for a build graph headache for no benefit.

The mainstream production pattern is: **`tsx` in dev, `tsup` in prod, one bundled artifact per app, shared packages stay as source.**

---

## Part 4 — Turborepo's official guidance

Turborepo's docs describe two ways to ship shared packages:

### Just-in-Time Packages (the recommended default)

- The shared package's `exports` field points directly at `./src/index.ts`.
- No `build` script in the shared package.
- Every consuming app transpiles the shared code as part of its own build pipeline.
- Apps' build tools (Next, tsup, tsx) handle TypeScript natively.
- Extensions are not required in source.

### Compiled Packages (the "graduate to this when JIT hurts" option)

- The shared package has a `build` task — usually `tsup` — that emits `dist/index.js`, `dist/index.d.ts`, etc.
- Apps consume the built output via the package's `exports` field.
- Turborepo's task graph handles the build ordering and caching.
- Extensions are handled by the build tool, so source can still be extensionless.

Turborepo's docs are explicit: **start with Just-in-Time. Move to Compiled only when you hit a real reason to.**

Real reasons to graduate include:
- Type-checking is slow because every app re-checks the same shared source.
- Cold-start performance matters and bundling per-app is too slow.
- You publish a package to npm.
- A non-TypeScript consumer needs the package (Deno, Python via codegen, etc.).

None of those apply to our planned architecture in any near-term window.

---

## Part 5 — The decision

**We will adopt the Just-in-Time Packages pattern.**

Concretely:

1. Switch `packages/typescript-config/base.json` from `NodeNext` to `Bundler` resolution.
2. Remove the `.js` suffix from the three import sites that have one.
3. Set up `apps/api` and `apps/worker` from day one with `tsx` for dev and `tsup` for production builds, consuming `@portfolio/contracts` and `@portfolio/db` as raw source.
4. Keep `@portfolio/contracts` and `@portfolio/db` build-script-free.

The shared packages' `exports` field already points at `./src/index.ts`, so no change is needed there.

---

## Part 6 — Tradeoffs, honestly

This is not a free lunch. Here's what we gain, what we lose, and what we're betting on.

### What we gain

- **Cognitive overhead drops to zero.** New contributors stop asking "why `.js` on a `.ts` file." We stop writing this document equivalent in PR review comments.
- **Imports look like every other modern TypeScript codebase.** Mental model transfers in and out of this repo cleanly.
- **One less moving part in the build graph.** No `build` task to coordinate for shared packages, no `tsup` config to maintain, no `dist/` to gitignore-and-occasionally-corrupt.
- **Fast iteration across packages.** Editing `packages/contracts/src/channel.ts` is immediately visible to every app — no rebuild step, no watch-mode coordination.
- **Type-check still works correctly.** TS Project References + Turborepo task caching handle incremental type-checking efficiently across the workspace.

### What we lose

- **The shared packages stop being "import directly from Node" friendly.** If you ran `node -e "import('./packages/contracts/src/index.ts')"` you would get an error. This was theoretically possible under the current config (modulo Node not supporting `.ts` directly anyway, which already made this benefit shaky). We are explicitly saying: *the shared packages are TS-source-only and require a transpiler to consume.*
- **Publishing to npm becomes a deliberate event, not a free side-effect.** If we ever publish `@portfolio/contracts` to npm for external consumers, we'd need to add a build step at that point. This is fine — publishing is a decision that deserves its own setup.
- **A future non-TS consumer would need codegen.** If somebody writes a Go service that consumes `ChannelEventSchema`, they can't just import from the package. They'd need a generated artifact (JSON Schema, OpenAPI, etc.). This was always going to be true regardless of `.js` suffixes.

### What we're betting on

- **Every consumer of shared packages will be a TypeScript app inside this monorepo for the foreseeable future.** True today (web), true for the planned additions (api, worker), and any reasonable next-additions (a second worker, an admin app, a CLI tool) fit the same shape.
- **The Just-in-Time → Compiled migration, if we ever need it, is a contained operation.** It would require adding a `tsup` build to one or two packages and updating their `exports` fields. It does not touch app code. It does not touch shared source files. It does not require rewriting imports. We can take this bet cheaply because backing out is cheap.

If either of those assumptions changes (e.g., we start publishing packages, or we add a Deno-based edge function that wants to import `@portfolio/contracts` directly), we re-open this decision. That's a deliberate signal, not a regression.

---

## Part 7 — The full option space, for the record

So future readers can see we considered the alternatives:

### Option A: Keep `NodeNext` + `.js` suffixes (status quo)

- **Pros:** Shared packages remain valid Node ESM at the source level.
- **Cons:** Confusing for every developer who reads them. Pays a cost nobody is collecting. Doesn't actually solve any problem for our architecture, since no consumer runs source through bare Node.
- **Verdict:** Rejected. Wrong-headed for our shape.

### Option B: Bundler resolution + extensionless (CHOSEN)

- **Pros:** Idiomatic, low-friction, aligns with Turborepo docs, aligns with how all three of our apps will actually consume the packages.
- **Cons:** Shared packages not directly runnable via raw `node`. We don't care.
- **Verdict:** Chosen.

### Option C: Compiled Packages from day one (tsup in shared packages)

- **Pros:** Strict separation of contract and implementation. Faster type-check at scale. Publish-ready.
- **Cons:** Build step adds friction (especially during shared-code iteration). Watch-mode dance between packages. Turbo cache helps but doesn't eliminate the wait. Premature for our scale.
- **Verdict:** Deferred. We will graduate here if and when JIT hurts.

### Option D: TS 5.7+ `rewriteRelativeImportExtensions` + `.ts` in source

- **Pros:** You write `.ts` in source (less weird than `.js`), TS rewrites to `.js` on emit. Newer official TS support for the Node-ESM pattern.
- **Cons:** Still requires a build step for unbundled Node consumers. Still ties you to NodeNext semantics. Less ecosystem support. Solves a problem we no longer have once we go Bundler.
- **Verdict:** Rejected. Solves the wrong problem for us.

---

## Part 8 — The refactor: step by step

### Step 1 — Update the shared TypeScript base config

File: `packages/typescript-config/base.json`

```jsonc
// before
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    // ... rest unchanged
  }
}

// after
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    // ... rest unchanged
  }
}
```

`packages/typescript-config/nextjs.json` previously re-declared `"module": "ESNext"` and `"moduleResolution": "Bundler"` as overrides; with `base.json` now matching, those lines are removed as redundant. `packages/portfolio-content/tsconfig.json` had the same overrides for the same reason and was also slimmed down.

`packages/db/tsconfig.json`'s `include` array is broadened to cover `scripts/**/*.ts` so `tsc --noEmit` checks the `tsx`-executed scripts (`seed-knowledge.ts`, `seed-knowledge-data.ts`, `smoke-retrieval.ts`) that were previously outside the type-check scope.

### Step 2 — Strip `.js` suffixes from relative imports

**Pattern, applied uniformly:** in every `.ts` file under `packages/contracts/src/`, `packages/db/src/`, and `packages/db/scripts/`, rewrite each relative import of the form `from "./<path>.js"` (and `export * from "./<path>.js"`) to drop the `.js` suffix — **except** when the path resolves to a Prisma-generated file under `generated/prisma/`. Those two lines in `packages/db/src/index.ts` keep their `.js` extension because they point at real generated JavaScript artifacts, not TypeScript source.

In practice this was a 23-line edit across 12 files, executed with a single guarded `sed` pass:

```sh
for f in $(grep -rln --include="*.ts" -E "from ['\"]\.+/[^'\"]+\.js['\"]" packages \
            | grep -v node_modules | grep -v generated/prisma); do
  sed -i '' -E 's|(from[[:space:]]+"\.[^"]*)\.js"|\1"|g' "$f"
done
```

The `generated/prisma` exclusion is enforced by filtering the file list before applying `sed` — `packages/db/src/index.ts` (which contains both a real TS-source import and Prisma-generated imports) is handled with a targeted `Edit` for the single TS-source line, leaving the Prisma lines untouched.

After running, a verification grep should return only the two intentionally-preserved Prisma lines:

```sh
grep -rn --include="*.ts" -E "from ['\"]\.+/[^'\"]+\.js['\"]" packages | grep -v node_modules
# Expected output:
# packages/db/src/index.ts:4:import { PrismaClient } from "./generated/prisma/client.js";
# packages/db/src/index.ts:23:export * from "./generated/prisma/client.js";
```

**Bonus type-error caught during verification:** broadening `packages/db/tsconfig.json` to type-check `scripts/` exposed a pre-existing bug in `seed-knowledge.ts` — the cast `as Prisma.JsonFilter<"Document">` references a type that Prisma 7 does not export for nullable JSON columns. Corrected to `Prisma.JsonNullableFilter<"Document">` (the `metadata` column is `Json?` in the schema). Unrelated to the resolution change, but folded into the same commit as it would have surfaced the moment `scripts/` started being checked.

### Step 3 — Verify nothing broke

```sh
pnpm install        # noop, but proves the workspace still links
pnpm check-types    # must pass across all packages
pnpm build          # web should still build
pnpm dev            # web should still start
```

If `check-types` fails, the most likely cause is a path that resolved differently under NodeNext (e.g., an `index` file resolution that NodeNext required to be explicit). Bundler resolution is more permissive, so failures here are rare, but if you see one, the fix is almost always to spell out the path more explicitly.

### Step 4 — Scaffold `apps/api` and `apps/worker` with the new pattern

When these apps are created, their `package.json` should follow this shape:

```jsonc
{
  "name": "@portfolio/api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm --target node20 --clean",
    "start": "node dist/index.js",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@portfolio/contracts": "workspace:*",
    "@portfolio/db": "workspace:*",
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "@portfolio/typescript-config": "workspace:*",
    "tsx": "^4.0.0",
    "tsup": "^8.0.0",
    "typescript": "5.9.2"
  }
}
```

Key points:

- `dev` uses `tsx` — transpiles `.ts` directly, no build step, hot reload via `watch`.
- `build` uses `tsup` — produces a single bundled ESM artifact. Workspace dependencies (`@portfolio/contracts`, `@portfolio/db`) get inlined into that bundle automatically.
- `start` runs the bundled output with bare `node`. No transpiler needed in production.
- Imports inside this app are extensionless: `import { ChannelEventSchema } from "@portfolio/contracts";`.

`apps/worker` follows the same shape with its own entry point.

### Step 5 — Update `docs/architecture.md`

Add a short "Module Resolution" subsection pointing at this document, so future contributors find the rationale without having to ask.

---

## Part 9 — FAQ

### "What if `pnpm check-types` passes but the production app crashes?"

It won't, because the apps don't consume the shared packages as Node ESM at runtime. They bundle them. The crash mode this document is preempting (`Cannot find module './common'`) cannot occur in any of our three deployment paths.

### "What if I prefer the `.ts` extension via `rewriteRelativeImportExtensions`?"

It's a real option, but it locks us back into NodeNext semantics and requires a build step in the shared packages. We're going *the other direction* — toward less ceremony, not different ceremony. If TS ecosystem opinion shifts decisively toward `.ts` extensions in the next few years, we can revisit. Today, extensionless is the broader convention.

### "Won't this hurt type-check performance once we have three apps?"

Possibly, at some scale. Turborepo's task cache and TypeScript's incremental mode handle a lot of it. If type-check time becomes a real bottleneck, the response is *not* to add `.js` suffixes back — it's to graduate `@portfolio/contracts` (and maybe `@portfolio/db`) to Compiled Packages via `tsup`. That migration is small and contained; this decision does not block it.

### "What about Prisma's generated client?"

Prisma 7 generates real `.js` and `.d.ts` files into `packages/db/src/generated/prisma/`. Those *are* compiled JavaScript at rest. Importing them with `.js` is correct and unrelated to the source-file-pattern question. Bundler resolution doesn't require the extension but accepts it, and keeping it makes the path clearer.

### "What if we publish `@portfolio/contracts` to npm someday?"

We add a `tsup` build to that package at that time. The work involved: ~20 lines of `tsup.config.ts`, `exports` field update to point at `dist/`, `prepublishOnly` script. No source files change. We are not foreclosing this future; we're declining to pre-pay for it.

### "Can I just rewrite the imports without changing the tsconfig?"

No. `NodeNext` resolution *requires* the `.js` suffix; dropping it without changing `moduleResolution` would cause `tsc` to fail with `Relative import paths need explicit file extensions in ECMAScript imports`. The two changes go together.

---

## Part 10 — One-line summary for future-you

> We are a monorepo of TypeScript apps that all use a transpiler. Shared packages should be raw TypeScript source. The `.js` suffix only earns its keep when something runs unbundled Node ESM against unbuilt package source. Nothing in this repo does that, and nothing in the foreseeable plan does either.
