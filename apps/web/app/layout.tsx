import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { twMerge } from 'tailwind-merge';
import { siteMetadata } from '@portfolio/content';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
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
