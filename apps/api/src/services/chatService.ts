import { runAgent } from "@portfolio/agent";
import type { ChatRequest, ChatResponse } from "@portfolio/contracts/chat";
import { Prisma, prisma } from "@portfolio/db";
import type { FastifyBaseLogger } from "fastify";

import { AgentFailureError, ConversationNotFoundError } from "#errors";

export interface ChatServiceContext {
  log: FastifyBaseLogger;
}

export async function handleChat(
  request: ChatRequest,
  ctx: ChatServiceContext,
): Promise<ChatResponse> {
  const conversationId = await resolveConversation(request);
  ctx.log.info({ conversationId, channel: request.channel }, "chat.start");

  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      role: "user",
      content: request.message,
      metadata: toJsonInput(request.metadata),
    },
  });

  let agentResponse;
  try {
    agentResponse = await runAgent({
      conversationId,
      userMessageId: userMessage.id,
      userId: request.userId,
      message: request.message,
      channel: request.channel,
      metadata: request.metadata,
    });
  } catch (err) {
    ctx.log.error({ err, conversationId }, "chat.agent_failed");
    throw new AgentFailureError(err);
  }

  const assistantMessage = await prisma.message.create({
    data: {
      conversationId,
      role: "assistant",
      content: agentResponse.answer,
      metadata: toJsonInput({
        traceId: agentResponse.traceId,
        confidence: agentResponse.confidence,
        shouldEscalate: agentResponse.shouldEscalate,
      }),
    },
  });

  // Best-effort back-fill of the agent trace. A failure here must not fail
  // the user-visible request — the answer is already produced and the
  // assistant Message row is already persisted. Just log and move on.
  try {
    await prisma.agentTrace.update({
      where: { id: agentResponse.traceId },
      data: { assistantMessageId: assistantMessage.id },
    });
  } catch (err) {
    ctx.log.warn(
      { err, traceId: agentResponse.traceId },
      "chat.trace_backfill_failed",
    );
  }

  ctx.log.info(
    {
      conversationId,
      traceId: agentResponse.traceId,
      confidence: agentResponse.confidence,
      shouldEscalate: agentResponse.shouldEscalate,
    },
    "chat.complete",
  );

  return {
    conversationId,
    answer: agentResponse.answer,
    confidence: agentResponse.confidence,
    sources: agentResponse.sources,
    traceId: agentResponse.traceId,
    shouldEscalate: agentResponse.shouldEscalate,
    metadata: agentResponse.metadata,
  };
}

async function resolveConversation(request: ChatRequest): Promise<string> {
  if (request.conversationId) {
    const existing = await prisma.conversation.findUnique({
      where: { id: request.conversationId },
      select: { id: true },
    });
    if (!existing) {
      throw new ConversationNotFoundError(request.conversationId);
    }
    return existing.id;
  }

  const created = await prisma.conversation.create({
    data: {
      userId: request.userId ?? null,
      channel: request.channel,
      metadata: toJsonInput(request.metadata),
    },
    select: { id: true },
  });
  return created.id;
}

function toJsonInput(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}
