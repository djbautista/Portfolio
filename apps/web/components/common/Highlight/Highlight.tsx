import React from 'react';
import { twMerge } from 'tailwind-merge';

interface HighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary';
}

export function Highlight({
  children,
  variant,
  className,
  ...props
}: HighlightProps) {
  return (
    <span
      {...props}
      className={twMerge(
        'font-light',
        variant === 'secondary' ? 'text-secondary-500' : 'text-primary-500',
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Highlight;
