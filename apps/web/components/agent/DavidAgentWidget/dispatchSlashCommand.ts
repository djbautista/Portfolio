import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { SlashCommand } from '@/model/slashCommands';

export interface DispatchContext {
  router: AppRouterInstance;
  send: (text: string) => void;
  closePanel: () => void;
}

// Translates a SlashCommand into a side effect. Kept out of components so the
// `kind` branching is trivially testable and so components don't need to know
// about navigation, window.open, or the send pipeline at the same time.
export function dispatchSlashCommand(
  command: SlashCommand,
  ctx: DispatchContext,
): void {
  switch (command.kind) {
    case 'prompt':
      ctx.send(command.prompt);
      return;
    case 'navigate':
      ctx.router.push(command.href);
      ctx.closePanel();
      return;
    case 'external':
      window.open(command.href, '_blank', 'noopener,noreferrer');
      return;
  }
}
