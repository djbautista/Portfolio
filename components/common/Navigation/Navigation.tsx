import Link from 'next/link';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button';

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean;
  current?: string;
}

const links = [
  {
    href: '/',
    label: <FaHouse className="h-5 w-5 -translate-y-[1px]" />,
  },
  { href: '/about', label: 'About' },
  {
    href: '/demos',
    label: 'Demos',
  },
  {
    href: '/contact',
    label: <span>Contact</span>,
    custom: (
      <Button variant="secondary">
        <span>Contact</span>
      </Button>
    ),
  },
];

export function Navigation({
  className,
  current,
  floating = true,
  ...props
}: NavigationProps) {
  return (
    <nav
      {...props}
      className={twMerge([
        'flex items-center space-x-8 rounded-lg bg-black bg-opacity-50 px-6 py-3 backdrop-blur-sm',
        'shadow shadow-secondary/30',
        'min-h-20',
        className,
      ])}
    >
      {links.map(({ href, label, custom }) => (
        <Link
          key={href}
          href={href}
          className={twMerge(
            'flex items-center justify-center gap-2',
            'text-gray-300 transition-colors hover:text-white',
            current === href && 'pointer-events-none text-gray-400',
          )}
        >
          {custom && current !== href ? custom : label}
        </Link>
      ))}
    </nav>
  );
}

export default Navigation;
