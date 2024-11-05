import React from 'react';

import clsx from 'clsx';

import styles from './Card.module.scss';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div {...props} className={clsx(styles.card, className)}>
      {children}
    </div>
  );
};

export { Card };
