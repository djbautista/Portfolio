import Button from '@/components/Button';
import Image from 'next/image';
import Link from 'next/link';

import { FiArrowLeft } from 'react-icons/fi';

export default function Tailwind() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral p-12 text-neutral-50">
      <Link href="/" className="fixed left-8 top-8">
        <Button className="bg-neutral lg:demoted" variant="secondary">
          <FiArrowLeft />
          <span className="hidden text-lg font-medium md:block">GO BACK</span>
        </Button>
      </Link>
      <div className="text-center">
        <div className="relative">
          <div className="absolute z-0 flex h-full w-full items-center justify-center">
            <div className="h-full max-h-[120px] w-full max-w-[120px] rounded-full bg-neutral-900 object-contain neon-primary lg:max-h-[280px] lg:max-w-[280px]" />
          </div>
          <Image
            src="/floating-home.png"
            width={400}
            height={400}
            alt="Home hero"
            className="relative z-10 mx-auto max-h-[200px] w-full max-w-[200px] object-contain lg:max-h-[400px] lg:max-w-[400px]"
          />
        </div>
        <h1 className="mb-12 text-3xl font-bold lg:text-5xl">
          Why Tailwind Feels Like Home
        </h1>

        <article className="mx-auto mb-12 flex max-w-2xl flex-col gap-8 text-justify text-lg font-light text-neutral-200 lg:text-xl">
          <p>
            Hey Tailwind Labs Team, writing this section you from the land of
            coffee and emeralds—Colombia. Taking the risk of reaching you in a
            more personal way than just a simple CV. Let&apos;s see if it works.
          </p>
          <p>
            I&apos;ve been a full-stack engineer for over 8 years, maybe more.
            I&apos;ve led teams, tangled with code, and even taught a few
            bright-eyed devs the ropes. Now, I&apos;m looking to join a crew
            that&apos;s as passionate about crafting top-notch tools as I am.
            And from what I&apos;ve seen, you folks at Tailwind Labs are my kind
            of people, my dream place to work at. Let me paint you a picture of
            myself: I&apos;m the guy who gets a kick out of turning a jumble of
            code into a sleek, accessible UI that even my dog could navigate
            with ease. I&apos;ve been in love with Javascript, TypeScript, and
            React for many years, and I&apos;ve got a soft spot for the elegance
            of Tailwind CSS. Trust me, I&apos;ve tried other frameworks like
            Bootstrap, Material UI, and you guys simply rock.
          </p>
          <p>
            I&apos;ve always been a bit of a speed demon when it comes to
            learning—&apos;crazy-fast&apos; as some have called it. I dive
            headfirst into new tech, and before you know it, I&apos;m the one
            giving the lowdown to the rest of the team. And when it comes to
            details, I&apos;m the guy squinting at the screen making sure every
            pixel is in its right place. Now, I&apos;m not just about the code.
            I&apos;ve got stories to tell, like the time I helped my team at
            Torre.ai beat the clock on a project that was behind schedule,
            without any knowledge of Nuxt or even Vue. But I picked up those in
            a week—yeah, a week—and we crossed the finish line with time to
            spare.
          </p>
          <p>
            But why Tailwind Labs? Well, your tools are the kind that make
            developers&apos; lives a breeze, and I want in on that action.
            I&apos;ve been following your work, and let&apos;s just say,
            I&apos;m a fan. The way you value performance, the way you put
            —finally— order in CSS; the attention to detail you want in your
            engineers, the commitment to keeping things lean and mean—it&apos;s
            like you&apos;re speaking my language.
          </p>
          <p>
            Of course I&apos;m not perfect, but I&apos;m pretty sure that my
            fast learning skill will allow me to tackle every challenge in this
            new way. I also want to have that opportunity to cross Design
            Engineering with Software Engineering, I&apos;ve always been getting
            prepared for it as a User-Focused Software Engineer. That&apos;s
            something I want to become an expert in, and I know I can do it with
            your boost.
          </p>
          <p className="text-right">― David.</p>
        </article>
      </div>
    </main>
  );
}
