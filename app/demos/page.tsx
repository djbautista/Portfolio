import { LuArrowRight } from 'react-icons/lu';
import Image from 'next/image';
import { Button, Navigation } from '@/components/common';

import GalleryPreview from '@/public/demos/previews/gallery.gif';
import InfinityTextPreview from '@/public/demos/previews/infinity-text.gif';
import SmoothScrollPreview from '@/public/demos/previews/smooth-scroll.gif';
import DynamicLandingPagePreview from '@/public/demos/previews/dynamic-landing-page.gif';
import Link from 'next/link';

const demos = [
  {
    id: 1,
    title: 'Gallery',
    slug: 'gallery',
    description:
      'A nice reactive gallery with animations when hovering over the elements.',
    year: 2024,
    image: GalleryPreview,
  },
  {
    id: 2,
    title: 'Infinity Text',
    slug: 'infinity-text',
    description:
      'A simple text animation that creates an infinity effect and dynamically switch direction when scrolling.',
    year: 2023,
    image: InfinityTextPreview,
  },
  {
    id: 3,
    title: 'Smooth Scroll',
    slug: 'smooth-scroll',
    description:
      'Fictional landing page with smooth scroll and parallax effect.',
    year: 2024,
    image: SmoothScrollPreview,
  },
  {
    id: 4,
    title: 'Dynamic Landing Page',
    slug: 'smk-landing-page',
    description:
      'Dynamic landing page for a fictional use case—built using Next.js, GSAP, and SCSS modules',
    year: 2024,
    image: DynamicLandingPagePreview,
  },
];

export default function Component() {
  const sortedDemos = demos.sort((a, b) => {
    if (a.year === b.year) {
      return b.id - a.id;
    }
    return b.year - a.year;
  });

  return (
    <>
      <Navigation
        className="sticky left-[50%] top-8 z-20 w-fit -translate-x-1/2 transform"
        current="/demos"
      />
      <div className="mt-8 min-h-screen p-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {sortedDemos.map((demo) => (
              <Link key={demo.id} href={`/demos/${demo.slug}`}>
                <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:bg-opacity-70">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-pink-700 opacity-50 transition-opacity group-hover:opacity-70" />
                  <div className="relative p-6">
                    <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                      <Image
                        width={200}
                        height={200}
                        src={demo.image}
                        alt={demo.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        priority
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{demo.title}</h3>
                    <p className="mb-4 text-gray-300">{demo.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Year: {demo.year}
                      </span>
                      <Button variant="secondary" className="z-10">
                        See More
                        <LuArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <div className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-full bg-gradient-to-tl from-pink-400 to-purple-600 opacity-30" />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <svg
          className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </>
  );
}
