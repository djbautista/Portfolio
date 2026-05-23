'use client';

import { ReactNode, useState } from 'react';

import {
  Dialog,
  DialogModal,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@/components/common';

interface ContactFormProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content?: ReactNode;
}

export function Modal({ children, content }: ContactFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogModal onOpenAutoFocus={(e) => e.preventDefault()}>
            {content}
          </DialogModal>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

export default Modal;
