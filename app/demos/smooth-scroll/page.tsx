'use client';

import { Description, Intro, Projects } from '@/components/demos/SmothScroll';
import React, { useEffect } from 'react';

export default function SmoothScrollPage() {
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      new LocomotiveScroll();
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col gap-2">
      <Intro />
      <Description />
      <Projects />
    </main>
  );
}
