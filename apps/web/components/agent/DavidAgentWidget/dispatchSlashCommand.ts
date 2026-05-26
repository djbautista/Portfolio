import type { useRouter } from 'next/navigation';

import type { SlashCommand } from '@/model/slashCommands';
import { buildWhatsAppHref } from '@/utils/whatsapp';

export interface DispatchContext {
  router: ReturnType<typeof useRouter>;
  send: (text: string) => void;
  closePanel: () => void;
  // Read at dispatch time (not at module load) so /whatsapp picks up the
  // current conversationId for the cross-channel handoff.
  getConversationId: () => string | undefined;
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
    case 'whatsapp': {
      const href = buildWhatsAppHref(command.number, {
        conversationId: ctx.getConversationId(),
      });
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
  }
}
