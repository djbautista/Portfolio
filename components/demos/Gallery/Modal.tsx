'use client';

import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  state: { active: boolean; index: number };
  projects: { title: string; src: string; color: string }[];
}

const modalVariants = {
  initial: { scale: 0 },
  open: {
    scale: 1,
    x: '-50%',
    y: '-50%',
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
  closed: {
    scale: 0,
    x: '-50%',
    y: '-50%',
    transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] },
  },
};

export function Modal({ state, projects }: ModalProps) {
  const { active, index } = state;
  const modalRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const cursorLabelRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveModalX = gsap.quickTo(modalRef.current, 'left', {
      duration: 0.8,
      ease: 'power3',
    });
    const moveModalY = gsap.quickTo(modalRef.current, 'top', {
      duration: 0.8,
      ease: 'power3',
    });

    const moveCursorX = gsap.quickTo(cursorRef.current, 'left', {
      duration: 0.5,
      ease: 'power3',
    });
    const moveCursorY = gsap.quickTo(cursorRef.current, 'top', {
      duration: 0.5,
      ease: 'power3',
    });

    const moveCursorLabelX = gsap.quickTo(cursorLabelRef.current, 'left', {
      duration: 0.45,
      ease: 'power3',
    });
    const moveCursorLabelY = gsap.quickTo(cursorLabelRef.current, 'top', {
      duration: 0.45,
      ease: 'power3',
    });

    window.addEventListener('mousemove', (event: MouseEvent) => {
      const { clientX, clientY } = event;

      moveModalX(clientX);
      moveModalY(clientY);

      moveCursorX(clientX);
      moveCursorY(clientY);

      moveCursorLabelX(clientX);
      moveCursorLabelY(clientY);
    });
  }, []);

  return (
    <>
      <motion.div
        className="pointer-events-none absolute flex h-[300px] w-[350px] items-center justify-center overflow-hidden"
        initial="initial"
        variants={modalVariants}
        animate={active ? 'open' : 'closed'}
        ref={modalRef}
      >
        <div
          className={twMerge([
            'absolute h-full w-full',
            'transition-top ease-in-out-quart duration-500',
          ])}
          style={{
            top: index * -100 + '%',
          }}
        >
          {projects.map((project, index) => {
            const { title, src, color } = project;
            return (
              <div
                className={twMerge([
                  'relative h-full',
                  'flex items-center justify-center',
                ])}
                key={`modal_${index}`}
                style={{
                  backgroundColor: color,
                }}
              >
                <Image
                  src={src}
                  width={250}
                  height={0}
                  alt={title}
                  className="h-auto"
                />
              </div>
            );
          })}
        </div>
      </motion.div>
      <motion.div
        ref={cursorRef}
        className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 font-semibold text-white"
        initial="initial"
        variants={modalVariants}
        animate={active ? 'open' : 'closed'}
      />
      <motion.span
        ref={cursorLabelRef}
        className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-transparent font-semibold text-white"
        initial="initial"
        variants={modalVariants}
        animate={active ? 'open' : 'closed'}
      >
        View
      </motion.span>
    </>
  );
}

export default Modal;
