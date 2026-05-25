import { prisma } from "@portfolio/db";
import type { AgentResponse } from "@portfolio/contracts/agent";

import { runAgent } from "#runAgent";

interface SmokeCase {
  label: string;
  question: string;
  expectAnswerable: boolean;
}

const CASES: SmokeCase[] = [
  {
    label: "answerable",
    question: "What is David's technical stack?",
    expectAnswerable: true,
  },
  {
    label: "unanswerable",
    question: "What is David's favorite database indexing strategy?",
    expectAnswerable: false,
  },
];

function pickRewritten(metadata: unknown): string | null {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const rewritten = (metadata as Record<string, unknown>).rewrittenQuery;
  return typeof rewritten === "string" ? rewritten : null;
}

async function readRewrites(traceId: string): Promise<string[]> {
  const rows = await prisma.agentStep.findMany({
    where: { traceId, stepName: "rewrite_query" },
    orderBy: { createdAt: "asc" },
    select: { metadata: true },
  });

  return rows
    .map((row) => pickRewritten(row.metadata))
    .filter((value): value is string => value !== null);
}

function printResult(
  label: string,
  question: string,
  response: AgentResponse,
  rewrites: string[],
): void {
  console.log(`\n[smoke-agent] === ${label} ===`);
  console.log(`[smoke-agent] question:      ${question}`);
  console.log(`[smoke-agent] answer:        ${response.answer}`);
  console.log(`[smoke-agent] confidence:    ${response.confidence}`);
  console.log(`[smoke-agent] shouldEscalate: ${response.shouldEscalate}`);
  console.log(`[smoke-agent] traceId:       ${response.traceId}`);

  const retryCount = response.metadata?.retryCount;
  console.log(`[smoke-agent] retryCount:    ${retryCount ?? 0}`);
  console.log(`[smoke-agent] model:         ${response.metadata?.model ?? "—"}`);

  if (rewrites.length > 0) {
    console.log(`[smoke-agent] rewrites:      ${rewrites.length}`);
    rewrites.forEach((rewritten, i) => {
      console.log(`[smoke-agent]   #${i + 1}: ${rewritten}`);
    });
  } else {
    console.log(`[smoke-agent] rewrites:      none`);
  }

  if (response.sources.length === 0) {
    console.log(`[smoke-agent] sources:       []`);
  } else {
    console.log(`[smoke-agent] sources:`);
    for (const source of response.sources) {
      const snippet = source.content.replace(/\s+/g, " ").slice(0, 120);
      const ellipsis = source.content.length > 120 ? "…" : "";
      console.log(
        `[smoke-agent]   #${source.rank} score=${source.score.toFixed(4)} title=${source.title ?? "—"} :: ${snippet}${ellipsis}`,
      );
    }
  }
}

async function main(): Promise<void> {
  let hadFailure = false;

  for (const testCase of CASES) {
    console.log(`\n[smoke-agent] running case: ${testCase.label}`);

    let response: AgentResponse;
    try {
      response = await runAgent({
        message: testCase.question,
        channel: "web",
      });
    } catch (err) {
      console.error(`[smoke-agent] FAIL: case "${testCase.label}" threw:`, err);
      hadFailure = true;
      continue;
    }

    const rewrites = await readRewrites(response.traceId);
    printResult(testCase.label, testCase.question, response, rewrites);

    if (testCase.expectAnswerable && response.confidence === "low") {
      console.error(
        `[smoke-agent] FAIL: expected answerable case "${testCase.label}" to return high/medium confidence, got "low"`,
      );
      hadFailure = true;
    }
    if (!testCase.expectAnswerable && response.confidence !== "low") {
      console.error(
        `[smoke-agent] FAIL: expected unanswerable case "${testCase.label}" to return "low" confidence, got "${response.confidence}"`,
      );
      hadFailure = true;
    }
  }

  if (hadFailure) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("[smoke-agent] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
