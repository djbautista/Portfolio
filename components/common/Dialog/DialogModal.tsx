import React from 'react';
import classNames from 'classnames';
import {
  Content as Modal,
  DialogContentProps,
  Title,
} from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export interface DialogModalProps extends DialogContentProps {}

export const getDialogModalClassName = ({ className }: DialogModalProps = {}) =>
  classNames(
    [
      'z-30',
      'w-max',
      'max-w-full',
      'fixed',
      'top-1/2',
      'left-1/2',
      '-translate-x-1/2',
      '-translate-y-1/2',
      'px-[18px]',
      'md:px-0',
      'focus:outline-none',
      'data-open:animate-contentShow',
    ],
    className,
  );

export const DialogModal = React.forwardRef<HTMLDivElement, DialogModalProps>(
  ({ children, ...props }, ref) => (
    <Modal ref={ref} {...props} className={getDialogModalClassName(props)}>
      <VisuallyHidden>
        <Title>Dialog</Title>
      </VisuallyHidden>
      {children}
    </Modal>
  ),
);

DialogModal.displayName = 'DialogModal';

export default DialogModal;
