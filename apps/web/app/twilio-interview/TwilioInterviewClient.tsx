'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ExternalLink, X } from 'react-feather';

import {
  Dialog,
  DialogModal,
  DialogOverlay,
  DialogPortal,
} from '@/components/common';

import {
  twilioInterviewContent,
  type InterviewStory,
  type VisualResource,
} from '@/model/twilioInterviewContent';

const ANCHORS = [
  { id: 'why', label: 'Why this conversation' },
  { id: 'technical', label: 'Technical stories' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'proud', label: 'Proud moments' },
  { id: 'resources', label: 'Resources' },
];

export function TwilioInterviewClient() {
  const [activeStory, setActiveStory] = useState<InterviewStory | null>(null);
  const { hero, whyThisConversation, technicalStories, leadershipStories, proudMoments, visualResources } =
    twilioInterviewContent;

  return (
    <div className="min-h-screen bg-black text-neutral-50">
      <header className="border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-black px-6 pb-16 pt-12 md:px-12 md:pt-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
          >
            <ArrowLeft size={14} />
            <span>Back to portfolio</span>
          </Link>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary-700/50 bg-secondary-950/40 px-3 py-1 text-xs uppercase tracking-widest text-secondary-300">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            <span>Interview companion · unlisted</span>
          </div>
          <h1 className="text-balance text-4xl font-light leading-tight md:text-6xl">
            {hero.title}
          </h1>
          <p className="max-w-3xl text-balance text-lg font-light text-neutral-300 md:text-xl">
            {hero.subtitle}
          </p>
          <p className="max-w-3xl text-base font-extralight leading-relaxed text-neutral-400">
            {hero.intro}
          </p>
          <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:gap-6">
            <span className="inline-flex w-fit items-center rounded-md border border-primary-700/50 bg-primary-950/40 px-3 py-1.5 text-sm font-medium text-primary-200">
              {hero.positioning}
            </span>
            <p className="max-w-2xl text-sm font-light text-neutral-300">
              {hero.pitch}
            </p>
          </div>
        </div>
      </header>

      <nav
        aria-label="Section navigation"
        className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-6 py-3 text-xs uppercase tracking-wider text-neutral-400 md:px-12 md:text-sm">
          {ANCHORS.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="transition-colors hover:text-secondary-300"
            >
              {a.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto flex max-w-5xl flex-col gap-20 px-6 py-16 md:px-12">
        <Section id="why" title={whyThisConversation.heading}>
          <p className="max-w-3xl text-base font-light leading-relaxed text-neutral-200">
            {whyThisConversation.body}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {whyThisConversation.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 rounded-md border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-200"
              >
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="technical"
          title="Featured technical stories"
          subtitle="Click any card for context, decision, impact, and discussion prompts."
        >
          <StoryGrid stories={technicalStories} onOpen={setActiveStory} />
        </Section>

        <Section
          id="leadership"
          title="Leadership stories"
          subtitle="How I show up around architecture, alignment, and coaching."
        >
          <StoryGrid stories={leadershipStories} onOpen={setActiveStory} />
        </Section>

        <Section
          id="proud"
          title="Proud moments"
          subtitle="The chapters I’d be glad to talk about in person."
        >
          <StoryGrid stories={proudMoments} onOpen={setActiveStory} />
        </Section>

        <Section
          id="resources"
          title="Visual resources"
          subtitle="Diagrams, screenshots, and links — placeholders today, real assets soon."
        >
          <ResourceGrid resources={visualResources} />
        </Section>

        <footer className="flex flex-col items-center gap-3 border-t border-neutral-900 pt-10 text-sm text-neutral-400">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors hover:text-neutral-100"
          >
            <ArrowLeft size={14} />
            <span>Back to portfolio</span>
          </Link>
          <p className="text-xs text-neutral-500">
            Unlisted interview companion · noindex
          </p>
        </footer>
      </main>

      <StoryModal
        story={activeStory}
        onClose={() => setActiveStory(null)}
      />
    </div>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 flex flex-col gap-6"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex flex-col gap-2">
        <h2 id={`${id}-title`} className="text-2xl font-light md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-3xl text-sm font-light text-neutral-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StoryGrid({
  stories,
  onOpen,
}: {
  stories: InterviewStory[];
  onOpen: (story: InterviewStory) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} onOpen={() => onOpen(story)} />
      ))}
    </div>
  );
}

function StoryCard({
  story,
  onOpen,
}: {
  story: InterviewStory;
  onOpen: () => void;
}) {
  const hasDetail = Boolean(
    story.context ||
      story.decision ||
      story.impact ||
      story.leadershipAngle ||
      story.twilioRelevance ||
      (story.discussionPrompts && story.discussionPrompts.length > 0),
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col gap-3 rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-950 to-black p-5 text-left transition-all hover:border-secondary-700/60 hover:bg-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
    >
      <h3 className="text-lg font-medium text-neutral-50 transition-colors group-hover:text-secondary-200">
        {story.title}
      </h3>
      <p className="text-sm font-light leading-relaxed text-neutral-300">
        {story.summary}
      </p>
      {hasDetail ? (
        <span className="mt-auto pt-2 text-xs uppercase tracking-wider text-neutral-500 transition-colors group-hover:text-secondary-300">
          Open details →
        </span>
      ) : null}
    </button>
  );
}

function StoryModal({
  story,
  onClose,
}: {
  story: InterviewStory | null;
  onClose: () => void;
}) {
  const open = story !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70" />
        <DialogModal className="w-[min(640px,calc(100vw-32px))]">
          {story ? (
            <div className="relative max-h-[85vh] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-100 shadow-2xl md:p-8">
              <button
                type="button"
                aria-label="Close details"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
              >
                <X size={16} />
              </button>
              <h3 className="pr-10 text-xl font-medium text-neutral-50 md:text-2xl">
                {story.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-neutral-300">
                {story.summary}
              </p>

              <div className="mt-6 flex flex-col gap-5">
                {story.context ? (
                  <DetailBlock label="Context" body={story.context} />
                ) : null}
                {story.decision ? (
                  <DetailBlock label="Decision" body={story.decision} />
                ) : null}
                {story.impact ? (
                  <DetailBlock label="Impact" body={story.impact} />
                ) : null}
                {story.leadershipAngle ? (
                  <DetailBlock
                    label="Leadership angle"
                    body={story.leadershipAngle}
                  />
                ) : null}
                {story.twilioRelevance ? (
                  <DetailBlock
                    label="Twilio relevance"
                    body={story.twilioRelevance}
                  />
                ) : null}
                {story.discussionPrompts && story.discussionPrompts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary-300">
                      I’d be excited to discuss
                    </h4>
                    <ul className="flex flex-col gap-2 text-sm font-light text-neutral-200">
                      {story.discussionPrompts.map((p) => (
                        <li
                          key={p}
                          className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogModal>
      </DialogPortal>
    </Dialog>
  );
}

function DetailBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary-300">
        {label}
      </h4>
      <p className="text-sm font-light leading-relaxed text-neutral-200">
        {body}
      </p>
    </div>
  );
}

function ResourceGrid({ resources }: { resources: VisualResource[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <ResourceTile key={r.id} resource={r} />
      ))}
    </div>
  );
}

function ResourceTile({ resource }: { resource: VisualResource }) {
  const tileClass =
    'group flex h-full flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 transition-colors hover:border-primary-700/60 hover:bg-neutral-900';
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wider text-neutral-500">
          {resource.category}
        </span>
        {resource.href ? (
          <ExternalLink
            size={14}
            className="text-neutral-500 transition-colors group-hover:text-primary-300"
          />
        ) : (
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-400">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-neutral-100">{resource.label}</h3>
      {resource.description ? (
        <p className="text-xs font-light text-neutral-400">
          {resource.description}
        </p>
      ) : null}
    </>
  );

  if (resource.href) {
    return (
      <a
        href={resource.href}
        target={resource.href.startsWith('http') ? '_blank' : undefined}
        rel={resource.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={tileClass}
      >
        {body}
      </a>
    );
  }

  return <div className={tileClass}>{body}</div>;
}
