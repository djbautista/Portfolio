import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FileText, GitHub, Linkedin, Mail } from 'react-feather';
import { twMerge } from 'tailwind-merge';

import { Button, Navigation, Section, Typography } from '@/components/common';
import { ContactForm } from '@/components/ContactForm';
import { silkscreen } from '@/utils/fonts';

export default function ContactPage() {
  return (
    <>
      <Navigation className="fixed left-[50%] top-8 z-20 w-fit -translate-x-1/2 transform" />
      <main
        className={twMerge([
          'mt-24',
          'mx-auto px-6 py-12 md:py-24',
          'flex-col items-center',
          'text-neutral-50',
        ])}
      >
        <Section className="mx-auto w-full max-w-6xl gap-16 md:gap-24">
          <div className="flex w-full flex-1 flex-col justify-between">
            <div>
              <Typography
                as="h1"
                className={twMerge([
                  silkscreen.className,
                  'text-4xl md:min-h-16 md:text-5xl',
                ])}
              >
                Let&apos;s Connect
              </Typography>
              <p className="text-lg text-neutral-200">
                I&apos;m always open to new opportunities and collaborations.
                Feel free to reach out!
              </p>
            </div>
            <div className="space-y-4">
              <Link
                href="mailto:david@davidbautista.co"
                className="flex w-fit items-center space-x-2 text-primary-200 hover:text-primary"
              >
                <Mail className="h-5 w-5" />
                <span>david@davidbautista.co</span>
              </Link>

              <Link
                href="https://github.com/djbautista"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center space-x-2 text-primary-200 hover:text-primary"
              >
                <GitHub className="h-5 w-5" />
                <span>Davidjba</span>
              </Link>

              <Link
                href="https://www.linkedin.com/in/davidjoelbautista/?locale=en_US"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center space-x-2 text-primary-200 hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
                <span>David Bautista</span>
              </Link>
            </div>

            <div className="mt-4 flex w-fit flex-col space-y-4">
              <Link
                href="/davidbautista.pdf"
                target="_blank"
                rel="noopener noreferrer"
                locale={false}
              >
                <Button variant="secondary">
                  Download Resume
                  <FileText className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Button
                className="pointer-events-none opacity-50 demoted"
                variant="primary"
              >
                View Projects
                <span className="text-xs opacity-50">(soon)</span>
              </Button>
            </div>
            <p className="hidden px-2 text-sm text-neutral-300 md:block">
              Prefer to share your email? Fill out the form and I&apos;ll get
              back to you as soon as possible.
            </p>
          </div>
          <div className="w-full max-w-lg space-y-4">
            <ContactForm />
            <p className="px-2 text-sm text-neutral-300 md:hidden">
              Prefer to share your email? Fill out the form and I&apos;ll get
              back to you as soon as possible.
            </p>
          </div>
        </Section>
      </main>
    </>
  );
}
