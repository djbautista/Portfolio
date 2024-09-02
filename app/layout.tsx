import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { twMerge } from 'tailwind-merge';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'My application to Tailwind Labs',
  description: 'Why Tailwind Feels Like Home',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={twMerge(poppins.className, ['bg-boxes-neutral'])}>
        {children}
      </body>
    </html>
  );
}
