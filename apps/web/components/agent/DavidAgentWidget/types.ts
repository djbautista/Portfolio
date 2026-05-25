// Local view-model — never sent to the API. The wire shape is ChatRequest /
// ChatResponse in @portfolio/contracts; this struct adds rendering metadata
// (stable id, optimistic ordering) the renderer needs but the agent does not.
// Conversation-level status (`sending`, `error`) lives on the widget itself,
// not on individual messages, so it has no slot here.
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}
