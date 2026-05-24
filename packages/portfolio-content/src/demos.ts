export interface Demo {
  id: number;
  title: string;
  slug: string;
  description: string;
  year: number;
}

export const demos: readonly Demo[] = [
  {
    id: 1,
    title: 'Gallery',
    slug: 'gallery',
    description:
      'A nice reactive gallery with animations when hovering over the elements.',
    year: 2024,
  },
  {
    id: 2,
    title: 'Infinity Text',
    slug: 'infinity-text',
    description:
      'A simple text animation that creates an infinity effect and dynamically switch direction when scrolling.',
    year: 2023,
  },
];
