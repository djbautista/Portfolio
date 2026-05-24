import { createHash } from "node:crypto";

import type { KnowledgeDocumentInput } from "@portfolio/contracts/knowledge";

import { prisma, Prisma, type Document } from "../index";

export function computeContentHash(content: string): string {
  const normalized = content.trim().replace(/[ \t]+\n/g, "\n");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

export interface UpsertDocumentResult {
  document: Document;
  changed: boolean;
  created: boolean;
}

export async function upsertDocument(input: KnowledgeDocumentInput): Promise<UpsertDocumentResult> {
  const contentHash = computeContentHash(input.content);

  const existing = await prisma.document.findFirst({
    where: input.sourceUri
      ? { sourceType: input.sourceType, sourceUri: input.sourceUri }
      : { sourceType: input.sourceType, sourceUri: null, title: input.title },
    orderBy: { updatedAt: "desc" }
  });

  if (existing && existing.contentHash === contentHash) {
    return { document: existing, changed: false, created: false };
  }

  const metadata = input.metadata == null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue);
  const sharedFields = {
    title: input.title,
    sourceUri: input.sourceUri ?? null,
    contentHash,
    metadata,
    isActive: true
  };

  if (existing) {
    const document = await prisma.document.update({
      where: { id: existing.id },
      data: sharedFields
    });
    return { document, changed: true, created: false };
  }

  const document = await prisma.document.create({
    data: { ...sharedFields, sourceType: input.sourceType }
  });
  return { document, changed: true, created: true };
}
