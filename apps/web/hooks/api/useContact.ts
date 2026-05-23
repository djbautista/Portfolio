import { ContactFormData } from '@/model';
import { useState } from 'react';

interface SendEmailData extends Omit<ContactFormData, 'propertyImages'> {
  propertyImages?: File[];
}

export const useContact = ({
  onEmailSent,
  onError,
}: {
  onEmailSent: () => void;
  onError: () => void;
}) => {
  const [sending, setSending] = useState(false);

  const sendEmail = async (data: SendEmailData) => {
    try {
      setSending(true);

      const response = await fetch('/api/contact', {
        method: 'post',
        body: JSON.stringify({ ...data }),
      });

      if (!response.ok) {
        throw new Error(`response status: ${response.status}`);
      }

      await response.json();

      onEmailSent();
    } catch (err) {
      console.error(err);
      onError();
    }

    setSending(false);
  };

  return { sendEmail, sendingEmail: sending };
};
