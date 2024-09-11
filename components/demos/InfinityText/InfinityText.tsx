'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { ReactLenis } from 'lenis/react';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import background from '@/public/demos/infinity-text/background.jpg';

export function InfinityText() {
  const sliderRef = React.createRef<HTMLDivElement>();
  let xPercent = 0;
  let direction = -1;

  const animate = () => {
    if (xPercent <= -100) {
      xPercent = 0;
    }

    if (xPercent > 0) {
      xPercent = -100;
    }
    gsap.set(sliderRef.current, {
      xPercent,
    });

    xPercent += 0.05 * direction;
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(sliderRef.current, {
      x: '-100px',
      scrollTrigger: {
        trigger: document.documentElement,
        scrub: 0.1,
        start: 0,
        end: window.innerHeight,
        onUpdate: (e) => {
          direction = e.direction * -1;
        },
      },
    });
    requestAnimationFrame(animate);
  }, []);

  const textClassName = (index: number) =>
    twMerge(
      ['text-[8vw] font-semibold uppercase', 'text-nowrap'],
      index === 0 ? 'relative' : 'absolute left-full top-0',
    );

  return (
    <ReactLenis root>
      <div className="relative h-screen w-screen overflow-hidden">
        <Image
          className="object-cover"
          alt="Mountains"
          src={background}
          placeholder="blur"
          quality={100}
          fill
          sizes="100vw"
          style={{ filter: 'brightness(0.75)' }}
        />
        <div className="absolute bottom-0 w-screen">
          <div ref={sliderRef} className="relative">
            <p className={textClassName(0)}>Full Stack Developer -</p>
            <p className={textClassName(1)}>Full Stack Developer -</p>
          </div>
        </div>
      </div>
      <div className="h-screen bg-black" />
    </ReactLenis>
  );
}

export default InfinityText;
