import { Box, Highlight, Section } from '@/components/common';
import { projects } from '@/data';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function AboutMePage() {
  return (
    <main className="min-h-screen flex-col p-12 text-neutral-50">
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
            ecosystems —particularly with <Highlight>React</Highlight>, and{' '}
            <Highlight>Node.js</Highlight>— allows me to bring all the time the
            best practices and the latest technologies to the table.
          </p>
          <p>
            Of course, I am still under construction, all we are forever.
            However, with my Master&apos;s in Software Engineering underway, I
            am pretty sure that I am on the right path to join eventually a team
            like <Highlight>Tailwind Labs</Highlight>. And that&apos;s something
            else that makes me shine all the time:{' '}
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
              <Highlight className="font-normal" variant="secondary">
                I love to be one.
              </Highlight>
            </span>
          </p>
          <p className="lg:text-xl">
            I am truly eager to give this experience to contribute to Tailwind
            CSS, Headless UI, and new projects comming soon.
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
