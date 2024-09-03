import { Silkscreen } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Send, Terminal } from 'react-feather';
import {
  FaAws,
  FaDocker,
  FaNodeJs,
  FaReact,
  FaRust,
  FaVuejs,
} from 'react-icons/fa';
import {
  SiAngular,
  SiD3Dotjs,
  SiFigma,
  SiGraphql,
  SiHeadlessui,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiScala,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';
import { twMerge } from 'tailwind-merge';

import { Box, BoxColor, Button, Typography } from '@/components/common';
import ContactForm from '@/components/ContactForm';

const silkscreen = Silkscreen({ weight: ['700'], subsets: ['latin'] });

interface TailwindnizerProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary';
}

const mainSkills = [
  {
    title: 'Front-End',
    content: (
      <span>
        +7 years building web applications. I started with vanilla JavaScript,
        then jQuery, then Angular CLI, then React, then Vue with Nuxt, and
        finally got back to React with Next.js.
      </span>
    ),
  },
  {
    title: 'Back-End',
    content: (
      <span>
        +8 years building back-end services with Node.js, Express, and MongoDB.
        But my beginnings were with Java, Spring Boot, and Oracle DB. From 3
        years ago, I specialized in building apps in Scala with Play Framework,
        Node.js with NestJS, and Rust with Rocket.
      </span>
    ),
  },
  {
    title: 'DevOps',
    content: (
      <span>
        In my previous job at Torre.ai, as a Full-Stack Engineer, I was in
        charge of the deployment of entire microservices and micro-frontends
        with Docker, Kubernetes, and AWS ECS. I also have experience with CI/CD
        pipelines with GitHub Actions, and AWS Code Pipelines. Lastly, I had the
        opportunity to work with Terraform to automate the infrastructure
        deployment of new environments, and work with other AWS services to
        monitor and debug (CloudWatch) complex issues in production.
      </span>
    ),
  },
  {
    title: 'SEO & Growth',
    content: (
      <span>
        During my journey at Torre.ai, I was leading the User Generated Growth
        team by 2 years. I was in charge of the SEO optimization of the entire
        platform, and the performance tuning of the web application, including
        Meta SEO tags, Open Graph tags, and Twitter Boxs. Everything there
        stored and managed with Nuxt.js to optimize the SSR of each page. I led
        also the indexing system of the new profiles, job postings, and new
        content in general.
      </span>
    ),
  },
];

const hardSkills = [
  {
    name: 'JavaScript',
    icon: <SiJavascript />,
    type: 'Front-End',
    color: 'yellow',
  },
  {
    name: 'TypeScript',
    icon: <SiTypescript />,
    type: 'Front-End',
    color: 'blue',
  },
  {
    name: 'React',
    icon: <FaReact />,
    type: 'Front-End',
    color: 'sky',
  },
  {
    name: 'Vue',
    icon: <FaVuejs />,
    type: 'Front-End',
    color: 'green',
  },
  {
    name: 'Angular',
    icon: <SiAngular />,
    type: 'Front-End',
    color: 'red',
  },
  {
    name: 'Node.js',
    icon: <FaNodeJs />,
    type: 'Back-End',
    color: 'black',
  },
  {
    name: 'Rust',
    icon: <FaRust />,
    type: 'Back-End',
    color: 'red',
  },
  {
    name: 'GraphQL',
    icon: <SiGraphql />,
    type: 'Back-End',
    color: 'pink',
  },
  {
    name: 'Scala',
    icon: <SiScala />,
    type: 'Back-End',
    color: 'red',
  },
  {
    name: 'Docker',
    icon: <FaDocker />,
    type: 'DevOps',
    color: 'blue',
  },
  {
    name: 'MongoDB',
    icon: <SiMongodb />,
    type: 'Back-End',
    color: 'green',
  },
  {
    name: 'MySQL',
    icon: <SiMysql />,
    type: 'Back-End',
    color: 'orange',
  },
  {
    name: 'AWS',
    icon: <FaAws />,
    type: 'DevOps',
    color: 'yellow',
  },
  {
    name: 'Figma',
    icon: <SiFigma />,
    type: 'Front-End',
    color: 'pink',
  },
  {
    name: 'Tailwind CSS',
    icon: <SiTailwindcss />,
    type: 'Front-End',
    color: 'sky',
  },
  {
    name: 'Headless UI',
    icon: <SiHeadlessui />,
    type: 'Front-End',
    color: 'sky',
  },
  {
    name: 'D3.js',
    icon: <SiD3Dotjs />,
    type: 'Front-End',
    color: 'black',
  },
  {
    name: 'React Native',
    icon: <FaReact />,
    type: 'Front-End',
    color: 'sky',
  },
] as {
  name: string;
  icon: React.ReactNode;
  type: string;
  color: BoxColor;
}[];

const projects = [
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

const SkillBox = ({
  name,
  icon,
  color,
  className,
  ...props
}: {
  name: string;
  icon: React.ReactNode;
  className?: string;
  color: BoxColor;
}) => (
  <Box
    {...props}
    className={twMerge(
      [
        'flex',
        'h-24',
        'w-24',
        'flex-col',
        'items-center',
        'justify-center',
        'text-center',
        'gap-2',
        'px-2',
        'rounded-full',
        'lg:h-28',
        'lg:w-28',
        'lg:px-4',
      ],
      className,
    )}
    color={color as BoxColor}
  >
    <div className="text-4xl lg:text-5xl">{icon}</div>
    <span className="text-xs lg:text-sm">{name}</span>
  </Box>
);

const Tailwindnizer = ({
  children,
  variant,
  className,
  ...props
}: TailwindnizerProps) => (
  <span
    {...props}
    className={twMerge(
      'font-light',
      variant === 'secondary' ? 'text-secondary-500' : 'text-primary-500',
      className,
    )}
  >
    {children}
  </span>
);

const Preface = ({ className }: React.HTMLAttributes<HTMLDivElement>) => (
  <Box
    className={twMerge(['flex', 'w-fit', 'flex-col', 'gap-2'], className)}
    variant="secondary"
  >
    <p className="text-md text-italic max-w-[500px] font-light leading-6">
      I truly feel in my heart that there&apos;s a spot for me here, a space
      where I could share my creativity and quick-thinking, fueled by the
      passion and unique skills I&apos;ve honed so far.
    </p>
    <p className="pr-3 text-right">— David B.</p>
  </Box>
);

const Section = ({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <section
    className={twMerge(
      ['flex', 'w-full', 'flex-wrap', 'justify-evenly', 'gap-12', 'pb-24'],
      className,
    )}
  >
    {children}
  </section>
);

export default function Home() {
  return (
    <main className="min-h-screen flex-col p-12 text-neutral-50">
      <Section className="mx-auto max-w-6xl">
        <div className="flex w-full flex-col items-start justify-evenly gap-8 lg:w-auto lg:gap-12 lg:py-8">
          <div className="w-full">
            <h3 className="mb-2 text-2xl font-light lg:mb-4 lg:text-4xl xl:mb-6 xl:text-5xl">
              Hi, I&apos;m
            </h3>
            <div className="mb-4 min-h-36 w-full max-w-xl text-4xl md:text-6xl lg:mb-6 xl:mb-8 xl:text-7xl">
              <Typography as="h1" className={silkscreen.className}>
                DAVID
              </Typography>
              <Typography as="h1" className={silkscreen.className}>
                BAUTISTA
              </Typography>
            </div>
            <h2 className="text-xl font-extralight lg:text-2xl xl:text-3xl">
              YOUR NEXT STAFF SOFTWARE ENGINEER
            </h2>
          </div>
          <div className="flex gap-8">
            <ContactForm>
              <Button>
                <span>Say Hi</span>
                <Send />
              </Button>
            </ContactForm>

            <Link
              href="/davidbautista.pdf"
              download
              target="_blank"
              rel="noopener noreferrer"
              locale={false}
            >
              <Button className="demoted" variant="secondary">
                <span>Resume</span>
                <Terminal />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative h-fit w-full max-w-lg lg:flex-1 xl:max-w-xl">
          <div className="absolute bottom-20 left-20 right-20 top-20 z-0 rounded-full bg-neutral-900 neon-secondary" />
          <Image
            className="relative z-10 w-full object-contain"
            src="/myself.png"
            alt="Myself"
            width="1024"
            height="1024"
          />
        </div>
      </Section>
      <Section className="mx-auto max-w-6xl flex-col items-center text-xl">
        <h3 className="mb-4 text-2xl font-medium">— About Me —</h3>
        <div className="flex w-full flex-col items-center justify-center gap-4 bg-gradient-radial from-primary/10 from-10% to-transparent to-70% text-center text-justify font-extralight lg:gap-8 lg:p-12 lg:pb-0">
          <p>
            I am a Software Engineer —<b>Product Enginner</b>— with more than 8
            years of experience in Full-Stack development, and more than 3
            leading Front-End teams. And when I said Full-Stack, I mean it. I
            have experience in everything end-to-end: from the database, to the
            user interface; from data visualization, to building robust back-end
            services; from SEO optimization and performance tuning, to software
            architecture with AWS services to deploy entire applications... and
            much more.
          </p>
          <p className="hidden lg:block">
            I specialize in crafting high-quality, accessible user interfaces
            with a focus on performance and what I like to call &quot;UX
            Smothness&quot;. My expertise in the JavaScript and TypeScript
            ecosystems —particularly with <Tailwindnizer>React</Tailwindnizer>,
            and <Tailwindnizer>Node.js</Tailwindnizer>— allows me to bring all
            the time the best practices and the latest technologies to the
            table.
          </p>
          <p>
            Of course, I am still under construction, all we are forever.
            However, with my Master&apos;s in Software Engineering underway, I
            am pretty sure that I am on the right path to join eventually a team
            like <Tailwindnizer>Tailwind Labs</Tailwindnizer>. And that&apos;s
            something else that makes me shine all the time:{' '}
            <b>I am a —really— crazy fast learner</b>. I have a couple of
            stories about how I learned a new technology in a weekend and then
            implemented it in a production environment the next Monday without
            any bugs or issues.
          </p>
          <p className="my-3 flex flex-col gap-3 text-center font-light lg:text-left lg:text-2xl">
            <span className="flex flex-col gap-x-1 gap-y-3 lg:flex-row">
              <span>I am a problem solver, and I love to be one.</span>
              <span>I am a team player, and I love to be one.</span>
            </span>
            <span className="hidden lg:block">
              <span>
                I am a mentor, and I love to be one. I am a leader, and I love
                to be one.
              </span>
            </span>
            <span>
              I am a Software/Product Engineer, and{' '}
              <Tailwindnizer className="font-normal" variant="secondary">
                I love to be one.
              </Tailwindnizer>
            </span>
          </p>
          <p className="lg:text-xl">
            I am truly eager to give this experience to contribute to Tailwind
            CSS, Headless UI, and new projects comming soon.
          </p>
        </div>
      </Section>
      <Section className="mx-auto block max-w-6xl text-center">
        <h3 className="mb-12 text-2xl font-medium">— Skills —</h3>
        <div className="flex w-full justify-center gap-24 lg:px-12">
          <div className="inline-flex flex-1 flex-col gap-8 text-left">
            {mainSkills.map(({ title, content }, index) => (
              <div key={index}>
                <h4 className="mb-2 text-xl font-medium">{title}</h4>
                <hr />
                <p className="my-4 text-justify text-xl font-extralight lg:text-left">
                  {content}
                </p>
                <div className="my-8 flex w-full flex-wrap justify-center gap-8 lg:hidden">
                  {hardSkills
                    .filter(({ type }) => type === title)
                    .map((props, index) => (
                      <SkillBox key={index} {...props} />
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden flex-1 flex-wrap items-center justify-center gap-8 lg:inline-flex">
            {hardSkills.map((props, index) => (
              <SkillBox key={index} {...props} />
            ))}
          </div>
        </div>
      </Section>
      <Section className="block text-center">
        <h3 className="mb-12 text-2xl font-medium">— I&apos;m proud of —</h3>
        <div className="mx-auto inline-flex w-full max-w-4xl flex-wrap items-center gap-12">
          {projects.map(
            ({ description, role, company, year, minWidth }, index) => (
              <Box
                key={index}
                variant={index % 2 === 0 ? 'primary' : 'secondary'}
                className={twMerge([
                  'w-full',
                  'h-full',
                  'rounded-3xl',
                  'shadow-xs',
                  'p-8',
                  'lg:flex-1',
                  'lg:p-0',
                  minWidth,
                  index % 2 === 0 ? 'bg-primary-200/10' : 'bg-secondary-200/10',
                ])}
              >
                <div className="flex h-full flex-col justify-between space-y-4 text-left lg:p-8">
                  <p className="text-sm font-light lg:text-lg">{description}</p>
                  <div className="font-medium">
                    <p className="text-neutral-400">{role}</p>
                    <p className="text-xs text-neutral-500">
                      {company}, {year}
                    </p>
                  </div>
                </div>
              </Box>
            ),
          )}
        </div>
      </Section>
    </main>
  );
}
