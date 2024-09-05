import { twMerge } from 'tailwind-merge';

export function Section({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={twMerge(
        ['flex', 'w-full', 'flex-wrap', 'justify-evenly', 'gap-12', 'pb-24'],
        className,
      )}
    >
      {children}
    </section>
  );
}

export default Section;
