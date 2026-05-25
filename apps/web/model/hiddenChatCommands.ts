import type { useRouter } from 'next/navigation';

// Hidden chat keywords: never advertised in the slash popover, never in
// suggested prompts, never sent to the agent API. Intercepted client-side in
// the widget's send pipeline so typing the keyword stays a private affordance.

export interface HiddenCommandContext {
  router: ReturnType<typeof useRouter>;
  appendAssistantMessage: (text: string) => void;
  closePanel: () => void;
}

export function tryHandleHiddenCommand(
  text: string,
  ctx: HiddenCommandContext,
): boolean {
  const keyword = text.trim().toLowerCase();
  if (keyword === '/twilio') {
    ctx.appendAssistantMessage(
      'I prepared a focused Twilio interview room for this conversation. Opening it now.',
    );
    ctx.closePanel();
    ctx.router.push('/twilio-interview');
    return true;
  }
  return false;
}

export function isHiddenCommand(text: string): boolean {
  return text.trim().toLowerCase() === '/twilio';
}
