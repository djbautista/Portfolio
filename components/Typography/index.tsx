'use client';

import React from 'react';
import Typed, { TypedOptions } from 'typed.js';

interface TypographyProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: React.ElementType;
  options?: TypedOptions;
}

export default function Typography({
  as = 'span',
  children,
  options,
  ...props
}: TypographyProps) {
  const element = React.useRef<HTMLSpanElement>(null);
  const Component = as;

  React.useEffect(() => {
    let content: string;
    if (typeof children === 'string') {
      content = children;
    } else if (children) {
      content = children?.toString();
    } else {
      throw new Error('No content provided');
    }

    const typed = new Typed(element.current, {
      strings: [content],
      typeSpeed: 100,
      loop: false,
      backDelay: 2000,
      backSpeed: 30,
      showCursor: false,
      ...options,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return <Component ref={element} {...props} />;
}
