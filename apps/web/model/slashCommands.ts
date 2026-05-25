import { contact } from '@portfolio/content';

export type SlashCommand =
  | {
      command: string;
      label: string;
      description: string;
      kind: 'prompt';
      prompt: string;
    }
  | {
      command: string;
      label: string;
      description: string;
      kind: 'navigate';
      href: string;
    }
  | {
      command: string;
      label: string;
      description: string;
      kind: 'external';
      href: string;
    };

// UI-only affordance. Never sent to the API in any form (not even metadata).
// `command` is the unique key — no separate id field.
//
// `/whatsapp` is only included when a WhatsApp number is actually configured
// (NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER). Otherwise we drop the entry so the
// command list never advertises a broken affordance.
const baseCommands: readonly SlashCommand[] = [
  {
    command: '/projects',
    label: 'Projects',
    description: "Browse what I'm proud of",
    kind: 'navigate',
    href: '/#projects',
  },
  {
    command: '/stack',
    label: 'Stack',
    description: 'My tech stack & tools',
    kind: 'prompt',
    prompt: "What is David's technical stack?",
  },
  {
    command: '/ai',
    label: 'AI Engineering',
    description: 'Applied AI, RAG, agentic workflows',
    kind: 'prompt',
    prompt: 'What AI systems has David worked on?',
  },
  {
    command: '/leadership',
    label: 'Leadership',
    description: '3+ years leading engineering teams',
    kind: 'prompt',
    prompt: "Tell me about David's leadership experience.",
  },
  {
    command: '/contact',
    label: 'Contact',
    description: 'Email, LinkedIn, GitHub',
    kind: 'navigate',
    href: '/#contact',
  },
];

const whatsappCommand: SlashCommand | null = contact.whatsapp.enabled
  ? {
      command: '/whatsapp',
      label: 'WhatsApp',
      description: 'Continue this chat on WhatsApp',
      kind: 'external',
      href: `https://wa.me/${contact.whatsapp.number.replace(/^\+/, '')}`,
    }
  : null;

export const slashCommands: readonly SlashCommand[] = whatsappCommand
  ? [...baseCommands, whatsappCommand]
  : baseCommands;
