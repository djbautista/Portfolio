'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaHouse } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button';

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  current?: string;
}

const links = [
  {
    href: '/',
    label: <FaHouse className="h-5 w-5 -translate-y-[1px]" />,
  },
  { href: '/#about', label: 'About' },
  {
    href: '/demos',
    label: 'Demos',
  },
  {
    href: '/#contact',
    label: <span>Contact</span>,
    custom: (
      <Button variant="secondary">
        <span>Contact</span>
      </Button>
    ),
  },
];

const SECTION_IDS = ['home', 'about', 'contact'];

export function Navigation({
  className,
  current,
  ...props
}: NavigationProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isHome) {
      setActiveSection(null);
      return;
    }

    const elements = SECTION_IDS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const isActive = (href: string): boolean => {
    if (isHome && href.startsWith('/#')) {
      return activeSection === href.slice(2);
    }
    if (isHome && href === '/') {
      return activeSection === 'home' || activeSection === null;
    }
    return current === href;
  };

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
      {links.map(({ href, label, custom }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={twMerge(
              'flex items-center justify-center gap-2',
              'text-gray-300 transition-colors hover:text-white',
              active && 'pointer-events-none text-gray-400',
            )}
          >
            {custom && !active ? custom : label}
          </Link>
        );
      })}
    </nav>
  );
}

export default Navigation;
