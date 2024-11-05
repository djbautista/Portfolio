import React from 'react';
import { twMerge } from 'tailwind-merge';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const phrases = [
  'Los Flamencos National Reserve',
  'is a nature reserve located',
  'in the commune of San Pedro de Atacama',
  'The reserve covers a total area',
  'of 740 square kilometres (290 sq mi)',
];

interface AnimatedTextProps extends React.HTMLProps<HTMLParagraphElement> {}

function AnimatedText({ className, ...props }: AnimatedTextProps) {
  const textRef = React.useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: textRef.current,
        scrub: true,
        start: '0px bottom',
        end: 'bottom+=400px bottom',
      },
    });

    timeline
      .from(textRef.current, { opacity: 0, left: '-200px' })
      .to(textRef.current, { opacity: 1, left: 0 });
  }, []);

  return (
    <p
      {...props}
      ref={textRef}
      className={twMerge('relative text-[2vw] uppercase text-white', className)}
    />
  );
}

export function Description() {
  return (
    <div className="relative z-10 mt-[54vh] p-[10%] text-left">
      {phrases.map((phrase, index) => (
        <AnimatedText key={index}>{phrase}</AnimatedText>
      ))}
    </div>
  );
}

export default Description;
