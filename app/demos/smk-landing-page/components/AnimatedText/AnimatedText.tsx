'use client';

import { useEffect, useRef } from 'react';

import clsx from 'clsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import styles from './AnimatedText.module.scss';

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: gsap.TweenVars;
  scrollTrigger?: ScrollTrigger.Vars;
  to?: gsap.TweenVars;
  viewport?: React.RefObject<HTMLElement>;
}

const AnimatedText = ({
  children,
  className,
  from = { opacity: 0.4 },
  scrollTrigger,
  to = { opacity: 1 },
  viewport,
  ...props
}: AnimatedTextProps) => {
  if (!children || typeof children !== 'string') {
    throw new Error('AnimatedText component must have a string as children');
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!textRef.current) return;
    if (!containerRef.current) return;

    const words = textRef.current.querySelectorAll('.character');

    gsap.fromTo(
      words,
      { ...from },
      {
        stagger: 0.1,
        scrollTrigger: {
          trigger: viewport?.current || containerRef.current,
          start: 'top top',
          end: '+=100%',
          scrub: true,
          ...scrollTrigger,
        },
        ...to,
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const parsedText = children.split(' ').map((word, index) => (
    <span key={`word_${index}`} className="word">
      {word.split('').map((character, index) => (
        <span key={`character_${index}`} className="character">
          {character}
        </span>
      ))}
      <span>&nbsp;</span>
    </span>
  ));

  return (
    <div
      {...props}
      ref={containerRef}
      className={clsx(styles.container, className)}
    >
      <div ref={textRef} className={styles.text}>
        {parsedText}
      </div>
    </div>
  );
};

export { AnimatedText };
