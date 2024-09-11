import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ProjectProps extends React.HTMLAttributes<HTMLDivElement> {
  project: {
    title: string;
    src: string;
    color: string;
  };
  index: number;
  setModal: React.Dispatch<
    React.SetStateAction<{ active: boolean; index: number }>
  >;
}

const animationClasses = 'transition-all duration-200 ease-linear';

export function Project({
  index,
  project,
  setModal,
  className,
  ...props
}: ProjectProps) {
  const { title } = project;

  return (
    <div
      {...props}
      className={twMerge([
        'flex w-full items-center justify-between border-t border-gray-200 px-8 py-12',
        'cursor-pointer hover:opacity-50',
        'group',
        animationClasses,
        className,
      ])}
      onMouseEnter={() => setModal({ active: true, index })}
      onMouseLeave={() => setModal({ active: false, index })}
    >
      <span
        className={twMerge([
          'text-2xl font-medium group-hover:translate-x-2 md:text-5xl',
          animationClasses,
        ])}
      >
        {title}
      </span>
      <span
        className={twMerge([
          'text-xs md:text-sm',
          'group-hover:translate-x-2',
          animationClasses,
        ])}
      >
        Design & Development
      </span>
    </div>
  );
}

export default Project;
