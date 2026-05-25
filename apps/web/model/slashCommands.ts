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
export const slashCommands: readonly SlashCommand[] = [
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
    command: '/leadership',
    label: 'Leadership',
    description: '3+ years leading Front-End teams',
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
  {
    command: '/whatsapp',
    label: 'WhatsApp',
    description: 'Continue this chat on WhatsApp',
    kind: 'external',
    href: `https://wa.me/${contact.whatsappNumber.replace(/^\+/, '')}`,
  },
];
