import { retrieveChunks } from "../src/knowledge/retrieve.js";
import { prisma } from "../src/index.js";

const QUERY = "What is David's stack?";
const TOP_K = 5;

async function main(): Promise<void> {
  console.log(`[smoke] query: ${QUERY}`);
  const results = await retrieveChunks({ query: QUERY, topK: TOP_K });

  if (results.length === 0) {
    console.error("[smoke] no chunks returned — corpus is empty or retrieval is broken.");
    process.exitCode = 1;
    return;
  }

  for (const r of results) {
    const preview = r.content.replace(/\s+/g, " ").slice(0, 200);
    console.log(
      JSON.stringify({
        rank: r.rank,
        score: Number(r.score.toFixed(4)),
        sourceType: r.sourceType,
        title: r.title,
        content: preview + (r.content.length > 200 ? "…" : "")
      })
    );
  }
}

main()
  .catch((err) => {
    console.error("[smoke] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
