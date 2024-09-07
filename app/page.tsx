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

import {
  Box,
  BoxColor,
  Button,
  Highlight,
  Modal,
  Navigation,
  Section,
  Typography,
} from '@/components/common';
import { projects } from '@/data';
import { ContactForm } from '@/components/ContactForm';
import { silkscreen } from '@/utils/fonts';

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

const Preface = ({ className }: React.HTMLAttributes<HTMLDivElement>) => (
  <Box
    className={twMerge(['flex', 'w-fit', 'flex-col', 'gap-2'], className)}
    variant="secondary"
  >
    <p className="text-italic max-w-[500px] text-sm font-light leading-6">
      With over 6 years of Full-Stack experience, I specialize in delivering
      seamless web applications using the latest Back-End and Front-End stacks.
    </p>
  </Box>
);

export default function Home() {
  return (
    <>
      <Navigation className="fixed left-[50%] top-8 z-20 w-fit -translate-x-1/2 transform" />
      <main className="h-screen flex-col overflow-hidden p-8 text-neutral-50">
        <Section className="mx-auto h-screen max-w-6xl flex-col items-center justify-center pb-0 md:flex-row">
          <div className="flex w-full flex-col items-start justify-start gap-8 md:justify-evenly lg:w-auto lg:py-8">
            <div className="flex w-full flex-col gap-2">
              <h3 className="text-2xl font-light lg:text-4xl xl:text-5xl">
                Hi, I&apos;m
              </h3>
              <div className="mb-2 min-h-20 w-full max-w-xl text-4xl md:min-h-36 md:text-6xl xl:text-7xl">
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
              <Link href="/contact">
                <Button>
                  <span>Say Hi</span>
                  <Send />
                </Button>
              </Link>
              <Link
                href="/davidbautista.pdf"
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
      </main>
    </>
  );
}
