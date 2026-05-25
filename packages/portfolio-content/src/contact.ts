// Read once at module load. `?.trim()` so an env var that's set but blank
// (e.g. `NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER=` in .env) still counts as
// "unset" — consumers should only branch on `whatsapp.enabled`.
const rawWhatsapp = process.env.NEXT_PUBLIC_PORTFOLIO_WHATSAPP_NUMBER?.trim();

export type Whatsapp =
  | { readonly enabled: true; readonly number: string }
  | { readonly enabled: false };

const whatsapp: Whatsapp = rawWhatsapp
  ? { enabled: true, number: rawWhatsapp }
  : { enabled: false };

export const contact = {
  email: 'davidjoelbautistacosta@gmail.com',
  github: {
    url: 'https://github.com/djbautista',
    handle: 'djbautista',
    label: 'djbautista',
  },
  linkedin: {
    url: 'https://www.linkedin.com/in/davidjoelbautista/',
    handle: 'davidjoelbautista',
    name: 'David Bautista',
  },
  portfolio: {
    url: 'https://davidbautista.co',
    label: 'davidbautista.co',
  },
  resumePath: '/davidbautista.pdf',
  whatsapp,
} as const;
