import { twMerge } from 'tailwind-merge';

export function Section({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...rest}
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
