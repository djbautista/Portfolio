import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { twMerge } from 'tailwind-merge';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'David Bautista | Senior Software Engineer',
  description:
    'Senior Software Engineer with a passion for building great UI/UX products.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={twMerge(poppins.className, ['bg-black'])}>
        {children}
      </body>
    </html>
  );
}
