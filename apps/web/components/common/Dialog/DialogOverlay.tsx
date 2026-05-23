import { DialogOverlayProps, Overlay } from '@radix-ui/react-dialog';
import clsx from 'clsx';
import React from 'react';

export type { DialogOverlayProps };

export const getDialogOverlayClassName = ({
  className,
}: DialogOverlayProps = {}) =>
  clsx(
    [
      'z-30',
      'fixed',
      'inset-0',
      'bg-neutral',
      'bg-opacity-30',
      'p-4',
      'data-open:animate-overlayShow',
    ],
    className,
  );

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  DialogOverlayProps
>((props, ref) => (
  <Overlay ref={ref} {...props} className={getDialogOverlayClassName(props)} />
));

DialogOverlay.displayName = 'DialogOverlay';

export default DialogOverlay;
