import Image from 'next/image';
import Link, { LinkProps } from 'next/link';
import React from 'react';
import { FaGithubSquare, FaLinkedin, FaTwitterSquare } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

import { Box, Highlight, Navigation, Section } from '@/components/common';
import { projects } from '@/data';

const SocialLink = ({
  children,
  ...props
}: LinkProps & React.HTMLAttributes<HTMLAnchorElement>) => (
  <Link {...props} className="group relative" target="_blank">
    <div className="absolute inset-0 h-full w-full scale-75 group-hover:bg-white" />
    {React.cloneElement(children as React.ReactElement, {
      className: 'text-secondary-200 relative z-10 group-hover:text-secondary',
    })}
  </Link>
);

const getRandom = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export default function AboutMePage() {
  return (
    <>
      <Navigation
        className="fixed left-[50%] top-8 z-20 w-fit -translate-x-1/2 transform"
        current="/about"
      />
      <main
        className={twMerge([
          'mt-24',
          'mx-auto min-h-screen max-w-3xl px-6 py-12 md:py-24',
          'flex-col items-center',
          'text-neutral-50',
        ])}
      >
        <Section className="mx-auto max-w-4xl flex-col items-center gap-16 md:gap-24">
          <div className="flex w-full flex-wrap items-center gap-8 md:gap-12">
            <Image
              className="overflow-hidden rounded-full"
              src="/profile.jpg"
              width={200}
              height={200}
              alt="Profile Picture"
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black text-secondary-50">
                David Bautista
              </h1>
              <h2 className="mb-4 text-2xl">
                <Highlight
                  variant="secondary"
                  className="text-secondary-100/70"
                >
                  Senior Software Engineer
                </Highlight>
              </h2>
              <span className="flex gap-2 text-3xl text-secondary-200 text-white">
                <SocialLink href="https://www.linkedin.com/in/davidjoelbautista/?locale=en_US">
                  <FaLinkedin />
                </SocialLink>
                <SocialLink href="https://github.com/djbautista">
                  <FaGithubSquare />
                </SocialLink>
                <SocialLink href="https://x.com/djbautista10">
                  <FaTwitterSquare />
                </SocialLink>
              </span>
            </div>
          </div>
          <div
            className={twMerge([
              'flex w-full flex-col items-center justify-center gap-8',
              'bg-gradient-radial from-primary/10 from-10% to-transparent to-70%',
              'font-light leading-7 md:text-lg md:leading-8',
            ])}
          >
            <p>
              I&apos;m a Software Engineer and <b>Product Engineer</b> with over
              7 years of experience in Full-Stack development and more than 3
              years leading Front-End teams. I&apos;m passionate about building
              high-quality, accessible user interfaces that prioritize
              performance.
            </p>
            <p>
              My stack is HTML/CSS, Tailwind CSS, JavaScript, React, React
              Native, GSAP, Node.Js, and a bit of Scala. My expertise spans the
              full stack: from databases, micro-services architecture, to
              responsive front-end complex applications.
            </p>
            <p>
              I&apos;m a lifelong learner, currently pursuing a Master&apos;s in
              Software Engineering. I love tackling challenges, mentoring teams,
              and leading projects to success.
            </p>
            <p className="my-3 flex flex-col">
              <span>I am a problem solver, and I love to be one.</span>
              <span>I am a mentor, and I love to be one.</span>
              <span>I am a leader, and I love to be one.</span>
              <span>I am a team player, and I love to be one.</span>
              <span className="mt-4">
                I am a Software/Product Engineer, and{' '}
                <Highlight className="font-normal" variant="secondary">
                  I love to be one.
                </Highlight>
              </span>
            </p>
            <p>
              Still reading? When I&apos;m not coding, I&apos;m probably
              learning a new tech stack over a weekend, or learning how to play
              guitar.
            </p>
            <p className="w-full">Peace ✌️</p>
          </div>
        </Section>
        <Section className="block text-center">
          <h3 className="mb-12 text-2xl font-medium">— I&apos;m proud of —</h3>
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-6">
            {projects.map(
              ({ description, role, company, year, relevance }, index) => {
                const relevances = {
                  1: 'md:col-span-2 text-sm leading-5',
                  2: 'md:col-span-3 text-md leading-6',
                  2.5: 'md:col-span-4 text-lg font-light',
                  3: 'md:col-span-6 text-xl font-light',
                };
                return (
                  <div
                    key={index}
                    className={twMerge([
                      'h-full w-full font-extralight',
                      relevance && relevances[relevance],
                    ])}
                  >
                    <Box
                      variant={index % 2 === 0 ? 'primary' : 'secondary'}
                      className={twMerge([
                        'w-full',
                        'h-full',
                        'rounded-3xl',
                        'shadow-xs',
                        'p-8',
                        'md:p-0',
                        getRandom(1, 2) % 2 === 0
                          ? 'bg-primary-200/10'
                          : 'bg-secondary-200/10',
                      ])}
                    >
                      <div className="flex h-full flex-col justify-between space-y-4 text-left md:p-8">
                        <p>{description}</p>
                        <div className="font-medium">
                          <p className="text-sm text-neutral-400">{role}</p>
                          <p className="text-xs text-neutral-500">
                            {company}, {year}
                          </p>
                        </div>
                      </div>
                    </Box>
                  </div>
                );
              },
            )}
          </div>
        </Section>
      </main>
    </>
  );
}
