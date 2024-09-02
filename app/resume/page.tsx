import Button from '@/components/Button';
import Image from 'next/image';
import Link from 'next/link';

import { FiArrowLeft } from 'react-icons/fi';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-radial from-secondary/20 to-neutral p-12 text-neutral-50">
      <Link href="/" className="fixed left-8 top-8">
        <Button className="bg-neutral demoted" variant="secondary">
          <FiArrowLeft />
          <span className="hidden text-lg font-medium md:block">GO BACK</span>
        </Button>
      </Link>
      <div className="text-center">
        <div className="relative z-0 mx-auto -mb-4 h-[160px] w-[160px] rounded-full bg-transparent shadow-inner shadow-xl shadow-secondary/30 lg:h-[200px] lg:w-[200px]">
          <Image
            src="/resume.png"
            alt="Home hero"
            className="m-auto max-h-[120px] w-full  max-w-[120px] lg:max-h-[160px] lg:max-w-[160px]"
            fill
          />
        </div>
        <h1 className="relative z-20 mb-2 text-5xl font-bold">
          MY AWESOME RESUME
        </h1>
        <p className="mb-12 text-xl text-neutral-200">
          Not as amazing as my personal page!
        </p>
        <div className="mb-6 flex justify-center space-x-4">
          <Link
            href="/davidbautista.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            locale={false}
          >
            <Button>
              <span className="text-xs md:text-lg">DOWNLOAD RESUME</span>
            </Button>
          </Link>
        </div>
        <p className="text-md mx-auto max-w-96 text-neutral-500">
          Your download should start automatically. Not seeing it? Hit above to
          do it manually.
        </p>
      </div>
    </main>
  );
}
