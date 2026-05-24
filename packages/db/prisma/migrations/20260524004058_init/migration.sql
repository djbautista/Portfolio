-- pgvector extension required for DocumentChunk.embedding
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "channel" TEXT NOT NULL,
    "title" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUri" TEXT,
    "contentHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTrace" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "userMessageId" TEXT,
    "assistantMessageId" TEXT,
    "input" TEXT NOT NULL,
    "output" TEXT,
    "confidence" TEXT,
    "shouldEscalate" BOOLEAN NOT NULL DEFAULT false,
    "retrievedContextCount" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "model" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentStep" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT,
    "latencyMs" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetrievedContext" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "documentChunkId" TEXT,
    "documentId" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetrievedContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelEvent" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT,
    "providerMessageId" TEXT,
    "channel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT,
    "from" TEXT,
    "to" TEXT,
    "body" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "rawPayload" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Conversation_channel_idx" ON "Conversation"("channel");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_role_idx" ON "Message"("role");

-- CreateIndex
CREATE INDEX "Message_providerMessageId_idx" ON "Message"("providerMessageId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Document_sourceType_idx" ON "Document"("sourceType");

-- CreateIndex
CREATE INDEX "Document_isActive_idx" ON "Document"("isActive");

-- CreateIndex
CREATE INDEX "Document_contentHash_idx" ON "Document"("contentHash");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_documentId_chunkIndex_key" ON "DocumentChunk"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "AgentTrace_conversationId_idx" ON "AgentTrace"("conversationId");

-- CreateIndex
CREATE INDEX "AgentTrace_confidence_idx" ON "AgentTrace"("confidence");

-- CreateIndex
CREATE INDEX "AgentTrace_createdAt_idx" ON "AgentTrace"("createdAt");

-- CreateIndex
CREATE INDEX "AgentStep_traceId_idx" ON "AgentStep"("traceId");

-- CreateIndex
CREATE INDEX "AgentStep_stepName_idx" ON "AgentStep"("stepName");

-- CreateIndex
CREATE INDEX "AgentStep_status_idx" ON "AgentStep"("status");

-- CreateIndex
CREATE INDEX "RetrievedContext_traceId_idx" ON "RetrievedContext"("traceId");

-- CreateIndex
CREATE INDEX "RetrievedContext_documentChunkId_idx" ON "RetrievedContext"("documentChunkId");

-- CreateIndex
CREATE INDEX "RetrievedContext_rank_idx" ON "RetrievedContext"("rank");

-- CreateIndex
CREATE INDEX "ChannelEvent_conversationId_idx" ON "ChannelEvent"("conversationId");

-- CreateIndex
CREATE INDEX "ChannelEvent_provider_idx" ON "ChannelEvent"("provider");

-- CreateIndex
CREATE INDEX "ChannelEvent_channel_idx" ON "ChannelEvent"("channel");

-- CreateIndex
CREATE INDEX "ChannelEvent_providerMessageId_idx" ON "ChannelEvent"("providerMessageId");

-- CreateIndex
CREATE INDEX "ChannelEvent_providerEventId_idx" ON "ChannelEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "ChannelEvent_provider_providerEventId_idx" ON "ChannelEvent"("provider", "providerEventId");

-- CreateIndex
CREATE INDEX "ChannelEvent_eventType_idx" ON "ChannelEvent"("eventType");

-- CreateIndex
CREATE INDEX "ChannelEvent_status_idx" ON "ChannelEvent"("status");

-- CreateIndex
CREATE INDEX "ChannelEvent_createdAt_idx" ON "ChannelEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrace" ADD CONSTRAINT "AgentTrace_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentStep" ADD CONSTRAINT "AgentStep_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "AgentTrace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetrievedContext" ADD CONSTRAINT "RetrievedContext_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "AgentTrace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetrievedContext" ADD CONSTRAINT "RetrievedContext_documentChunkId_fkey" FOREIGN KEY ("documentChunkId") REFERENCES "DocumentChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelEvent" ADD CONSTRAINT "ChannelEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- HNSW index for approximate nearest-neighbor search on chunk embeddings.
-- Cosine distance is the retrieval metric selected for semantic similarity search.
-- Partial index: DocumentChunk rows may be created before embeddings are
-- generated, so embedding can be NULL. Skip those rows from the index.
CREATE INDEX "DocumentChunk_embedding_hnsw"
    ON "DocumentChunk"
    USING hnsw ("embedding" vector_cosine_ops)
    WHERE "embedding" IS NOT NULL;
