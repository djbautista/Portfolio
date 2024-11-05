import Image from 'next/image';
import React from 'react';

import BackgroundImage from '@/public/demos/smooth-scroll/background.jpeg';
import IntroImage from '@/public/demos/smooth-scroll/intro.png';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function Intro() {
  const backgroundRef = React.useRef<HTMLDivElement>(null);
  const introImageRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        scrub: true,
        start: 'top',
        end: '+=300px',
      },
    });

    timeline
      .from(backgroundRef.current, { clipPath: `inset(15%)` })
      .to(backgroundRef.current, { clipPath: `inset(0%)` }, 0)
      .to(introImageRef.current, { height: '200px' }, 0);
  }, []);

  return (
    <div className="relative flex w-full justify-center">
      <div
        className="absolute h-[140vh] w-full bg-red-500 brightness-50"
        ref={backgroundRef}
      >
        <Image
          alt="Pelicans"
          src={BackgroundImage}
          placeholder="blur"
          quality={100}
          fill
          sizes="100vw"
          priority
          style={{
            objectFit: 'cover',
          }}
        />
      </div>
      <div className="mt-[35vh] flex justify-center">
        <div
          className="absolute h-[475px] w-[350px] brightness-75"
          ref={introImageRef}
          data-scroll
          data-scroll-speed="0.3"
        >
          <Image
            className="object-cover object-top"
            alt="Intro"
            src={IntroImage}
            placeholder="blur"
            quality={100}
            priority
            fill
          />
        </div>
        <h1
          className="z-30 text-nowrap text-center text-[7vw] font-bold uppercase text-white"
          data-scroll
          data-scroll-speed="0.7"
        >
          Smooth Scroll
        </h1>
      </div>
    </div>
  );
}

export default Intro;
