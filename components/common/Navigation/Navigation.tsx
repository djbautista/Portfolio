import Link from 'next/link';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button';

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean;
}

const linkClasses =
  'text-gray-300 transition-colors hover:text-white flex items-center justify-center gap-2';

export function Navigation({
  className,
  floating = true,
  ...props
}: NavigationProps) {
  return (
    <nav
      {...props}
      className={twMerge([
        'flex items-center space-x-8 rounded-lg bg-black bg-opacity-50 px-6 py-3 backdrop-blur-sm',
        'shadow shadow-secondary/30',
        className,
      ])}
    >
      <Link href="/" className={linkClasses}>
        <FaHouse />
      </Link>
      <Link href="/about" className={linkClasses}>
        <span>About</span>
      </Link>
      {/* @TODO: Add more links */}
      <span className={twMerge([linkClasses, 'opacity-10'])}>
        <span>Journey</span>
      </span>
      <span className={twMerge([linkClasses, 'opacity-10'])}>
        <span>Contact</span>
      </span>
    </nav>
  );
}

export default Navigation;
