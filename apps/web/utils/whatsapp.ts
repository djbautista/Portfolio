// Single source of truth for the `wa.me` deep link used by the chat header
// icon, the persistent WhatsApp line, and the /whatsapp slash command.
//
// `wa.me` requires digits-only after the slash (no `+`, no spaces, no
// punctuation). `?text=` is URL-encoded so emojis and punctuation in the
// prefilled message round-trip safely.
//
// When `conversationId` is provided, the prefill embeds a `(ref: <id>)`
// marker the API's WhatsApp webhook parses to keep the user's WhatsApp
// thread tied to their existing web conversation. The marker is plaintext
// — see /Users/davidbautista/personal-portfolio/Portfolio/apps/api/src/services/whatsappService.ts
// for the matching regex and the security tradeoffs.

// Receiver-agnostic. The WhatsApp number reaches David's AI agent, not
// David personally — keep the prefill from sounding like it addresses a
// human. The ref marker is parsed server-side; once matched, the agent
// loads the prior conversation history on its own, so no meta-instruction
// to the model is needed in the prefill.
export const WHATSAPP_HANDOFF_PREFILL_FRESH = 'Hello from your portfolio.';

export interface BuildWhatsAppHrefOptions {
  conversationId?: string;
}

export function buildWhatsAppHref(
  number: string,
  options: BuildWhatsAppHrefOptions = {},
): string {
  const digits = number.replace(/[^\d]/g, '');
  const base = `https://wa.me/${digits}`;
  const prefill = buildPrefill(options.conversationId);
  return `${base}?text=${encodeURIComponent(prefill)}`;
}

function buildPrefill(conversationId: string | undefined): string {
  if (!conversationId) return WHATSAPP_HANDOFF_PREFILL_FRESH;
  // The ref tells the server which web conversation to adopt; the question
  // tells the agent what to do if the visitor sends the prefill as-is
  // (which is the common path — they tap the link, hit send, expect a
  // meaningful reply). Visitors can still edit before sending.
  return `Continue conversation (ref: ${conversationId}) — remind me what we just discussed and suggest where to go next.`;
}
