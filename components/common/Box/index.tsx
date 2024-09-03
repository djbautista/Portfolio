import React from 'react';
import { twMerge } from 'tailwind-merge';

import { Slot } from '@/components/common';

const variants = {
  primary: 'bg-primary-500/20 shadow-primary-500',
  secondary: 'bg-secondary-500/20 shadow-secondary-500',
};

export type BoxColor = 'green' | 'red' | 'blue' | 'yellow' | 'orange';

const colorsClassNames = {
  blue: 'bg-blue-500/20 shadow-blue-500',
  green: 'bg-green-500/20 shadow-green-500',
  orange: 'bg-orange-500/20 shadow-orange-500',
  pink: 'bg-pink-500/20 shadow-pink-500',
  red: 'bg-red-500/20 shadow-red-500',
  sky: 'bg-sky-500/20 shadow-sky-500',
  yellow: 'bg-yellow-500/20 shadow-yellow-500',
  black: 'bg-neutral-500/20 shadow-neutral-500',
  purple: 'bg-purple-500/20 shadow-purple-500',
} as { [key in BoxColor]: string };

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  color?: BoxColor;
  asChild?: boolean;
}

export const Box: React.FC<BoxProps> = ({
  className,
  children,
  color,
  variant = 'primary',
  asChild = false,
  ...rest
}) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={twMerge(
        ['bg-white', 'shadow-lg', 'rounded-lg', 'p-4'],
        variants[variant],
        color ? colorsClassNames[color] : null,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export default Box;
