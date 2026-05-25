import Image from 'next/image';
import Link, { LinkProps } from 'next/link';
import React from 'react';
import { FaGithubSquare, FaLinkedin, FaTwitterSquare } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';

import {
  bioParagraphs,
  contact,
  fullName,
  projects,
  roleTitle,
} from '@portfolio/content';
import { Box, Highlight, Navigation, Section } from '@/components/common';

const SocialLink = ({
  children,
  ...props
}: LinkProps & React.HTMLAttributes<HTMLAnchorElement>) => (
  <Link {...props} className="group relative" target="_blank">
    <div className="absolute inset-0 h-full w-full scale-75 group-hover:bg-white" />
    {React.cloneElement(
      children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
      {
        className:
          'text-secondary-200 relative z-10 group-hover:text-secondary',
      },
    )}
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
                {fullName.first} {fullName.last}
              </h1>
              <h2 className="mb-4 text-2xl">
                <Highlight
                  variant="secondary"
                  className="text-secondary-100/70"
                >
                  {roleTitle}
                </Highlight>
              </h2>
              <span className="flex gap-2 text-3xl text-secondary-200 text-white">
                <SocialLink href={contact.linkedin.url}>
                  <FaLinkedin />
                </SocialLink>
                <SocialLink href={contact.github.url}>
                  <FaGithubSquare />
                </SocialLink>
                <SocialLink href={contact.twitter.url}>
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
              '[&_strong]:font-bold',
            ])}
          >
            {bioParagraphs.map((paragraph, index) => (
              <ReactMarkdown key={index}>{paragraph}</ReactMarkdown>
            ))}
          </div>
        </Section>
        <Section id="projects" className="block text-center">
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
