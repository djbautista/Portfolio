import Link from 'next/link';
import React from 'react';
import { FileText, GitHub, Linkedin, Mail } from 'react-feather';
import { twMerge } from 'tailwind-merge';

import { contact } from '@portfolio/content';
import { Button, Section, Typography } from '@/components/common';
import { ContactForm } from '@/components/ContactForm';
import { silkscreen } from '@/utils/fonts';

export function ContactSection() {
  return (
    <section
      id="contact"
      className={twMerge([
        'scroll-mt-24',
        'mx-auto w-full p-6 md:py-24',
        'flex flex-col items-center',
        'text-neutral-50',
      ])}
    >
      <Section className="mx-auto w-full max-w-6xl gap-12 md:gap-16 md:gap-24">
        <div className="flex w-full flex-1 flex-col justify-between gap-12">
          <div>
            <Typography
              as="h1"
              className={twMerge([
                silkscreen.className,
                'min-h-9 text-3xl md:min-h-16 md:text-5xl',
              ])}
            >
              Let&apos;s Connect
            </Typography>
            <p className="text-sm text-neutral-200 md:text-lg">
              I&apos;m always open to new opportunities and collaborations.
              Feel free to reach out!
            </p>
          </div>
          <div className="space-y-4 text-xs md:text-sm">
            <Link
              href={`mailto:${contact.email}`}
              className="flex w-fit items-center space-x-2 text-primary-200 hover:text-primary"
            >
              <Mail className="h-5 w-5" />
              <span>{contact.email}</span>
            </Link>

            <Link
              href={contact.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center space-x-2 text-primary-200 hover:text-primary"
            >
              <GitHub className="h-5 w-5" />
              <span>{contact.github.label}</span>
            </Link>

            <Link
              href={contact.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center space-x-2 text-primary-200 hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
              <span>{contact.linkedin.name}</span>
            </Link>
          </div>

          <div className="flex w-fit flex-col space-y-4 md:mt-4">
            <Link
              href={contact.resumePath}
              target="_blank"
              rel="noopener noreferrer"
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
        <div className="flex w-full max-w-lg flex-col gap-4">
          <p className="px-2 text-xs text-neutral-400 md:hidden">
            Prefer to share your email? Fill out the form and I&apos;ll get
            back to you as soon as possible.
          </p>
          <ContactForm />
        </div>
      </Section>
    </section>
  );
}

export default ContactSection;
