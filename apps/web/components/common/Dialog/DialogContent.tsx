import React from 'react';
import clsx from 'clsx';
import { Content, Title } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;

export const getDialogContentClassName = ({
  className,
}: DialogContentProps = {}) =>
  clsx(
    [
      'relative',
      'flex',
      'flex-col',
      'bg-white',
      'dark:bg-neutral-85',
      'dark:text-neutral-10',
      'rounded-lg',
      'shadow-elevation-50',
    ],
    className,
  );

export const DialogContent = ({ children, ...props }: DialogContentProps) => (
  <Content {...props} className={getDialogContentClassName(props)}>
    <VisuallyHidden>
      <Title>Dialog</Title>
    </VisuallyHidden>
    {children}
  </Content>
);

export default DialogContent;
