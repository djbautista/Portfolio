import type { KnowledgeDocumentInput } from "@portfolio/contracts/knowledge";

import { getEmbeddingProvider } from "@/embeddings/index";
import { chunkText } from "@/knowledge/chunking";
import { replaceDocumentChunks } from "@/knowledge/chunks";
import { upsertDocument } from "@/knowledge/documents";
import { prisma, Prisma } from "@/index";

import { allSeedDocuments } from "./seed-knowledge-data";

// Identifies rows this seed owns. The cleanup pass only removes documents
// whose metadata.source matches one of these values — production rows
// without the flag are never touched.
const SEED_MANAGED_SOURCES = ["existing_portfolio", "dev_fixture"] as const;

type Status = "inserted" | "updated" | "skipped";

interface DocReport {
  title: string;
  sourceType: string;
  status: Status;
  chunks: number;
  ms: number;
}

async function main(): Promise<void> {
  const provider = getEmbeddingProvider();
  console.log(`[seed] using embedding provider model=${provider.model} dimensions=${provider.dimensions}`);

  const reports: DocReport[] = [];

  for (const input of allSeedDocuments) {
    const started = Date.now();

    const { document, changed, created } = await upsertDocument(input);

    if (!changed) {
      const existingChunkCount = await prisma.documentChunk.count({
        where: { documentId: document.id }
      });
      if (existingChunkCount > 0) {
        reports.push({
          title: input.title,
          sourceType: input.sourceType,
          status: "skipped",
          chunks: existingChunkCount,
          ms: Date.now() - started
        });
        continue;
      }
    }

    const chunks = chunkText(input.content).map((chunk) => ({
      ...chunk,
      title: input.title,
      metadata: input.metadata ?? null
    }));

    if (chunks.length === 0) {
      throw new Error(`[seed] document "${input.title}" produced zero chunks; refusing to embed.`);
    }

    const embeddings = await provider.embed(chunks.map((c) => c.content));
    const result = await replaceDocumentChunks(document.id, chunks, embeddings);

    reports.push({
      title: input.title,
      sourceType: input.sourceType,
      status: created ? "inserted" : "updated",
      chunks: result.inserted,
      ms: Date.now() - started
    });
  }

  console.log("[seed] per-document results:");
  for (const r of reports) {
    console.log(JSON.stringify(r));
  }

  const totals = reports.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      acc.chunks += r.chunks;
      return acc;
    },
    { inserted: 0, updated: 0, skipped: 0, chunks: 0 }
  );

  const removed = await pruneStaleSeedDocuments(allSeedDocuments);
  if (removed > 0) {
    console.log(`[seed] pruned ${removed} stale seed-managed document(s).`);
  }

  console.log(
    `[seed] totals: documents=${reports.length} inserted=${totals.inserted} updated=${totals.updated} skipped=${totals.skipped} chunks=${totals.chunks} pruned=${removed}`
  );
}

function seedKey(sourceType: string, sourceUri: string | null, title: string): string {
  return `${sourceType}|${sourceUri ?? ""}|${title}`;
}

async function pruneStaleSeedDocuments(current: readonly KnowledgeDocumentInput[]): Promise<number> {
  const managed = await prisma.document.findMany({
    where: {
      OR: SEED_MANAGED_SOURCES.map((source) => ({
        metadata: {
          path: ["source"],
          equals: source
        } as Prisma.JsonNullableFilter<"Document">
      }))
    },
    select: { id: true, sourceType: true, sourceUri: true, title: true }
  });

  const currentKeys = new Set(current.map((d) => seedKey(d.sourceType, d.sourceUri ?? null, d.title)));
  const stale = managed.filter((row) => !currentKeys.has(seedKey(row.sourceType, row.sourceUri, row.title)));

  if (stale.length === 0) return 0;
  const result = await prisma.document.deleteMany({
    where: { id: { in: stale.map((s) => s.id) } }
  });
  return result.count;
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
