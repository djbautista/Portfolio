'use client';

import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogModal,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@/components/common';
import { useContact } from '@/hooks/api/useContact';
import { ContactFormData } from '@/model';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

interface ContactFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ContactForm({ children }: ContactFormProps) {
  const [open, setOpen] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const { sendEmail, sendingEmail } = useContact({
    onEmailSent: async () => {
      reset();
      setOpen(false);
      await sleep(100);
      alert(
        `Message received! I'll get back to you faster than you can say Supercalifragilisticexpialidocious... well, almost.`,
      );
    },
    onError: () => {
      alert('Failed to send email');
    },
  });

  const onSubmit: SubmitHandler<ContactFormData> = useCallback(
    (data) => {
      if (sendingEmail) return;

      sendEmail({ ...data });
    },
    [sendEmail, sendingEmail],
  );

  const inputClasses = `
    w-full bg-white text-gray-800 border border-gray-300 rounded-md p-2
    transition duration-300 ease-in-out
    hover:border-transparent hover:ring-1 hover:ring-neutral-500 hover:shadow-[0_0_6px_rgba(59,130,246,0.5)]
    focus:outline-none focus:border-transparent focus:ring-1 focus:ring-purple-400 focus:shadow-[0_0_6px_rgba(147,51,234,0.5)]
  `;

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogModal onOpenAutoFocus={(e) => e.preventDefault()}>
            <Card className="relative text-neutral" size="md">
              {sendingEmail && (
                <div className="absolute left-[50%] top-[50%] z-40 flex h-20 w-20 translate-x-[-50%] translate-y-[-50%] transform items-center justify-center rounded-full bg-primary">
                  <svg
                    className="h-20 w-20 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-15"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="6"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M12 2a10 10 0 00-2.5 19.5L12 22l2.5-2.5A10 10 0 0012 2z"
                      scale={3}
                    ></path>
                  </svg>
                </div>
              )}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className={twMerge(
                  'flex w-full flex-1 flex-col space-y-8 px-12 py-8',
                  sendingEmail && 'pointer-events-none opacity-20',
                )}
              >
                <div className="w-full">
                  <label htmlFor="name" className="mb-2 block text-neutral-500">
                    Name
                  </label>
                  <input
                    {...register('name', { required: true })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-neutral-500"
                  >
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: true,
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'This email looks weird',
                      },
                    })}
                    className={inputClasses}
                    required
                  />
                  <div className="min-h-6">
                    <span className="w-full text-ellipsis text-xs text-red-500">
                      {errors.email ? errors.email.message : ''}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-neutral-500"
                  >
                    Message <span>(Optional)</span>
                  </label>
                  <textarea
                    {...register('message')}
                    className={inputClasses}
                    rows={2}
                  />
                </div>
                <Button
                  variant="demoted"
                  className="border-neutral bg-neutral text-white hover:border-neutral-700 hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
                >
                  Contact me!
                </Button>
              </form>
            </Card>
          </DialogModal>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

export default ContactForm;
