export interface SuggestedPrompt {
  label: string;
  // Optional reference to a slashCommands[].command. When set, clicking the chip
  // dispatches via the slash command path; when undefined, the label is sent as
  // plain user text.
  commandRef?: string;
}

export const suggestedPrompts: readonly SuggestedPrompt[] = [
  { label: "What's David's technical stack?", commandRef: '/stack' },
  { label: "Show me David's projects", commandRef: '/projects' },
  { label: 'What kind of engineer is David?' },
  { label: 'Tell me about his leadership', commandRef: '/leadership' },
  { label: 'How can I contact David?', commandRef: '/contact' },
];
