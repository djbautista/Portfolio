import React from 'react';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'retro-button-primary',
  secondary: 'retro-button-secondary',
  demoted: 'bg-transparent',
};

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  ...props
}) => {
  return (
    <button
      {...props}
      className={twMerge(
        'inline-flex items-center gap-2 rounded-lg border border-b-4 px-4 py-2 md:font-bold',
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;
