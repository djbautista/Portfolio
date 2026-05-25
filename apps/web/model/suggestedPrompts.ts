export interface SuggestedPrompt {
  label: string;
  // Optional reference to a slashCommands[].command. When set, clicking the chip
  // dispatches via the slash command path; when undefined, the label is sent as
  // plain user text.
  commandRef?: string;
}

export const suggestedPrompts: readonly SuggestedPrompt[] = [
  { label: 'What kind of engineer is David?' },
  { label: 'What AI systems has David worked on?', commandRef: '/ai' },
  { label: "Tell me about David's Disney work." },
  { label: "What is David's technical stack?", commandRef: '/stack' },
  { label: "Show me David's strongest projects.", commandRef: '/projects' },
  { label: 'How can I contact David?', commandRef: '/contact' },
];
