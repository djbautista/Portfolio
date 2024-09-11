import { Section } from '@/components/common';
import { InfinityText } from '@/components/demos/InfinityText';
import React from 'react';

export default function InfinityTextPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <Section className="relative h-full items-center justify-center px-0 pb-0">
        <div className="absolute left-0 top-0 z-10 h-screen w-screen bg-gradient-to-b from-black/75 to-transparent" />
        <div className="absolute top-0 z-20 flex w-full flex-col items-center justify-center gap-8 p-8 text-center">
          <h1 className="text-7xl font-bold text-white">
            Infinity Text Banner
          </h1>
          <p className="text-gray-300">
            This text banner will keep on scrolling infinitely to the right, and
            will go back to the left once you scroll past the end.
          </p>
        </div>
        <div className="w-full">
          <InfinityText />
        </div>
      </Section>
    </main>
  );
}
