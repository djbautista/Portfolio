import { Section } from '@/components/common';
import { Gallery } from '@/components/demos/Gallery';
import React from 'react';

export default function GalleryPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="mt-16 text-7xl font-bold text-white">Cursor Gallery</h1>
      <p className="mt-8 text-gray-300">
        Move your cursor over the menu and see the magic happen!
      </p>
      <Section className="h-full items-center justify-center pb-0">
        <div className="w-full max-w-4xl">
          <Gallery />
        </div>
      </Section>
    </main>
  );
}
