'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const ROTATION_RANGE = 8;
const HALF_ROTATION_RANGE = 4;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-full',
  md: 'w-full md:min-w-80 lg:min-w-96',
  lg: 'w-full md:min-w-96 lg:min-w-112',
};

export const getCardClassName = ({
  className,
  size = 'sm',
}: Partial<CardProps>) => {
  return twMerge([
    'relative',
    'place-content-center',
    'rounded-xl',
    'bg-white',
    'shadow-lg shadow-neutral',
    sizes[size],
    className,
  ]);
};

export const Card = ({ children, className, size, ...props }: CardProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return [0, 0];

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform,
      }}
      className="relative rounded-xl bg-gradient-to-br from-primary to-secondary p-3 shadow-lg shadow-neutral"
    >
      <div
        {...props}
        className={getCardClassName({ className, size })}
        style={{
          transform: 'translateZ(75px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
