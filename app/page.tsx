import Image from 'next/image';
import Link from 'next/link';
import { Send, Terminal } from 'react-feather';

import { Button, Navigation, Section, Typography } from '@/components/common';
import { silkscreen } from '@/utils/fonts';

export default function Home() {
  return (
    <>
      <Navigation
        className="fixed left-[50%] top-8 z-20 w-fit -translate-x-1/2 transform"
        current="/"
      />
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
