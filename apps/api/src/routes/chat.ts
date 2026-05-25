import { ChatRequestSchema } from "@portfolio/contracts/chat";
import type { FastifyInstance } from "fastify";

import { ValidationError } from "#errors";
import { handleChat } from "#services/chatService";

export async function registerChatRoutes(app: FastifyInstance): Promise<void> {
  app.post("/chat", async (req, reply) => {
    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error);
    }

    const response = await handleChat(parsed.data, { log: req.log });
    return reply.code(200).send(response);
  });
}
