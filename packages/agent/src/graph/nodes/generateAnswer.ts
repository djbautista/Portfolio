import type { AgentDeps } from "@/deps";
import type { GraphState } from "@/graph/state";
import { buildSystemPrompt } from "@/prompts/systemPrompt";

import { withStep } from "./step";

export function makeGenerateAnswer(deps: AgentDeps) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { result, step } = await withStep("answer_generator", async () => {
      const system = buildSystemPrompt(state.acceptedChunks);

      const chatResult = await deps.chatProvider.chat({
        messages: [
          { role: "system", content: system },
          { role: "user", content: state.originalQuery },
        ],
      });

      return {
        result: { answer: chatResult.content, model: chatResult.model },
        metadata: {
          finishReason: chatResult.finishReason,
          usage: chatResult.usage,
          acceptedChunkCount: state.acceptedChunks.length,
        },
      };
    });

    return {
      answer: result.answer,
      model: result.model,
      pendingSteps: [step],
    };
  };
}
