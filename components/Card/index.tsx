import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@/components/Slot';

const variants = {
  primary: 'bg-primary-500/20 shadow-primary-500',
  secondary: 'bg-secondary-500/20 shadow-secondary-500',
};

export type CardColor = 'green' | 'red' | 'blue' | 'yellow' | 'orange';

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
} as { [key in CardColor]: string };

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  color?: CardColor;
  asChild?: boolean;
}

const Card: React.FC<CardProps> = ({
  className,
  children,
  color,
  variant = 'primary',
  asChild = false,
  ...rest
}) => {
  const Comp = asChild ? Slot : 'div';

  console.log('Comp', Comp);

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

export default Card;
