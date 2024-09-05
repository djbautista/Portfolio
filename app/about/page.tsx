import Image from 'next/image';
import React from 'react';
import { FaGithubSquare, FaTwitterSquare } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

import { Box, Highlight, Section } from '@/components/common';
import { projects } from '@/data';

export default function AboutMePage() {
  return (
    <main
      className={twMerge([
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
              <Highlight variant="secondary" className="text-secondary-100/70">
                Senior Software Engineer
              </Highlight>
            </h2>
            <span className="flex gap-2 text-3xl text-secondary-200">
              <FaLinkedin /> <FaGithubSquare /> <FaTwitterSquare />
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
            I&apos;m a Software Engineer and <b>Product Engineer</b> with over 7
            years of experience in Full-Stack development and more than 3 years
            leading Front-End teams. I&apos;m passionate about building
            high-quality, accessible user interfaces that prioritize
            performance.
          </p>
          <p>
            My stack is HTML/CSS, Tailwind CSS, JavaScript, React, React Native,
            GSAP, Node.Js, and a bit of Scala. My expertise spans the full
            stack: from databases, micro-services architecture, to responsive
            front-end complex applications.
          </p>
          <p>
            I&apos;m a lifelong learner, currently pursuing a Master&apos;s in
            Software Engineering. I love tackling challenges, mentoring teams,
            and leading projects to success.
          </p>
          {/* <p className="my-3 flex flex-col gap-3">
            <span className="flex flex-col gap-x-1 gap-y-3 md:flex-row">
              <span>I am a problem solver, and I love to be one.</span>
              <span>I am a team player, and I love to be one.</span>
            </span>
            <span className="hidden md:block">
              <span>
                I am a mentor, and I love to be one. I am a leader, and I love
                to be one.
              </span>
            </span>
            <span>
              I am a Software/Product Engineer, and{' '}
              <Highlight className="font-normal" variant="secondary">
                I love to be one.
              </Highlight>
            </span>
          </p> */}
          <p>
            When I&apos;m not coding, I&apos;m probably learning a new tech
            stack over a weekend, or learning how to play guitar.
          </p>
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
                  'md:flex-1',
                  'md:p-0',
                  minWidth,
                  index % 2 === 0 ? 'bg-primary-200/10' : 'bg-secondary-200/10',
                ])}
              >
                <div className="flex h-full flex-col justify-between space-y-4 text-left md:p-8">
                  <p className="text-sm font-light">{description}</p>
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
