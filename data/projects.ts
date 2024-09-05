import { Project } from '@/model';

export const projects: Project[] = [
  {
    title: 'High-complexity critical feature development',
    description:
      'I currently lead the entire Front-End development of an internal core application called Content Restrictor for Disney, using Tailwind, Headless UI and Next 13.',
    role: 'Front-End Technical Lead',
    company: 'Globant',
    year: '2023-Present',
    minWidth: 'lg:max-w-96',
  },
  {
    title: 'Software architecture and library design',
    description:
      'Drove high-quality product development from design to completion, optimizing team performance and product quality with Snowplow, TypeScript, Lerna.js, Jest, and AWS.',
    role: 'Associate Sr. Tech-Lead',
    company: 'Torre.ai',
    year: '2022-2023',
    minWidth: 'lg:w-auto',
  },
  {
    title: 'Innovative data gathering and analysis tool',
    description:
      'Developed a tool from inception to implementation for data gathering and analysis from social networks using React, JavaScript, D3, and Bootstrap, aiding informed policy-making.',
    role: 'Software Engineer and Front-End Data Analyst',
    company: 'United Nations Population Fund (UNFPA)',
    year: '2018-2021',
    minWidth: 'lg:min-w-full',
  },
  {
    title: 'Performance optimization and user tracking system',
    description:
      'Led performance optimization, reducing LCP from 22 to 2 seconds, and implemented an end-to-end user tracking system with Snowplow JS, improving UX and SEO metrics.',
    role: 'Sr. Software Engineer',
    company: 'Torre.ai',
    year: '2021-2022',
    minWidth: 'lg:max-w-1/3 lg:min-h-96',
  },
  {
    title: 'Subscription management system with Stripe integration',
    description:
      'Created a robust subscription management system, integrating Stripe Checkout for payment processing, leveraging TypeScript stack with Nuxt.js and Nest.js.',
    role: 'Mid-Level Software Engineer',
    company: 'Torre.ai',
    year: '2021',
    minWidth: 'lg:max-w-1/3 lg:min-h-96',
  },
  {
    title: 'Urban planning research project',
    description:
      'Extended undergraduate thesis research into a project providing insights for urban planning with D3, React.js, and Django Rest Framework.',
    role: 'Graduated Research Assistant',
    company: 'Universidad de los Andes',
    year: '2020-2021',
    minWidth: 'lg:max-w-1/3 lg:min-h-96',
  },
  {
    title: 'Dynamic advertising system',
    description:
      'Developed a dynamic advertising system utilizing Node.js and Raspberry Pi systems for efficient promotion of services and products.',
    role: 'Junior Software Engineer Intern',
    company: 'Valdivieso Consulting S.A.S',
    year: '2017',
    minWidth: 'lg:min-w-[500px]',
  },
];

export default projects;
