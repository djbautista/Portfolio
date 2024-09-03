'use client';

import { Button, Card } from '@/components/common';
import { useContact } from '@/hooks/api/useContact';
import { ContactFormData } from '@/model/ContactFormData';
import { useCallback } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface ContactFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContactForm() {
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
    onEmailSent: () => {
      reset();
      alert('Email sent!');
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
      <Card className="text-neutral" size="md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-1 flex-col space-y-8 px-12 py-8"
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
            <label htmlFor="email" className="mb-2 block text-neutral-500">
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
            <label htmlFor="message" className="mb-2 block text-neutral-500">
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
    </div>
  );
}

export default ContactForm;
