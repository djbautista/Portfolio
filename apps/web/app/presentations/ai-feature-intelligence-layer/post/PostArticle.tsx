import type { ReactNode } from 'react';

import { manrope, spaceGrotesk } from '@/utils/fonts';
import {
  architectureSlide,
  deckMeta,
  personas,
  solutionSlide,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

import {
  BeforeAfter,
  CapabilityFlow,
  FormulaLine,
  Funnel,
  PersonaJourney,
  PipelineFan,
  Portrait,
  QuestionCluster,
  RagFlow,
  VectorCluster,
} from './diagrams';
import './post.css';

/**
 * A long-form, read-anywhere version of the "AI Feature Intelligence Layer"
 * deck. Same story and the same diagrams the panel saw live, rewritten in an
 * informal blog voice and re-drawn to reflow on a phone. It's a static server
 * component — no JS ships — and all copy/labels are sourced from the deck's
 * {@link ../data} so the two can't drift apart. See {@link ./diagrams} for the
 * simplified figures.
 */
function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="afil-post-section">
      <p className="afil-post-eyebrow">{eyebrow}</p>
      <h2 className="afil-post-h2">{title}</h2>
      {children}
    </section>
  );
}

export function PostArticle() {
  const [rachel, daniel, peter] = personas;

  return (
    <div className={`afil-post ${spaceGrotesk.variable} ${manrope.variable}`}>
      <article className="afil-post-article">
        <header className="afil-post-hero">
          <p className="afil-post-eyebrow">{deckMeta.title}</p>
          <h1 className="afil-post-h1">What happens after you hit “ship”?</h1>
          <p className="afil-post-lede">
            Every feature we build leaves a trail of context behind it — and the
            moment we release, most of that trail goes cold. This is a proposal to
            stop throwing it away, and turn it into something every team can
            actually use.
          </p>
          <p className="afil-post-byline">
            David Bautista · a proposal for cutting post-release friction
          </p>
        </header>

        <Section eyebrow="The part nobody talks about" title="Shipping isn’t the finish line">
          <p>
            We pour an enormous amount of attention into the road <em>to</em>{' '}
            release — discovery, design, engineering, QA, ship. Every step creates
            rich context about <em>why</em> a feature works the way it does. And
            then we release, and almost all of that context just… stops at the
            release line.
          </p>
          <p>
            But release isn’t the end of the story. It’s where the work fans out.
            Support has to answer “is this a bug or expected?”. Docs need to match
            what actually shipped. QA revisits behavior months after the spec went
            cold. Product reads signals to plan what’s next. New hires ramp on
            features nobody wrote down. On-call gets paged at 2am with no context.
            Features change hands and the “why” doesn’t come with them.
          </p>
          <PipelineFan />
          <p>
            Eight different jobs, all hungry for the <strong>same</strong> context
            the build already produced. Today that context lives in scattered docs
            and people’s heads. I think there’s a better answer, and I’m calling it
            an <strong>AI Feature Intelligence Layer</strong> — one shared place
            that turns the artifacts we already create into knowledge any of those
            jobs can pull from. We’ll get there. First, why it’s worth doing.
          </p>
        </Section>

        <Section eyebrow="Quick hello" title="Who’s proposing this">
          <p>
            I’m David, a senior engineer. The thing that actually drives me is
            building with <em>impact</em> — thinking past the code to the product
            outcome it’s supposed to create. The rough formula I keep coming back
            to:
          </p>
          <FormulaLine />
          <p>
            And this isn’t a new itch for me. Back in 2018 I worked on ECHO at the
            UN — an NLP platform that linked the messy, conversational language
            real people use to the formal language of the Sustainable Development
            Goals. Same instinct as this proposal: take scattered, human language
            and turn it into something usable.
          </p>
          <Portrait />
        </Section>

        <Section eyebrow="The problem" title="Three people, one root cause">
          <p>
            The fastest way to feel the problem is to meet three people. They don’t
            know each other, and they’d never describe their day the same way — but
            they’re all stuck on the exact same thing.
          </p>

          <p>
            <strong>Rachel</strong> is a product designer. She starts closest to
            the user, turns research into insight, and hands it to engineering in
            live sessions. Then, slowly, the original context thins out — and she
            spends her time re-explaining things she already knew.
          </p>
          {rachel && <PersonaJourney persona={rachel} />}

          <p>
            <strong>Daniel</strong> shipped the feature and moved on. He knew it
            cold — for about a week. Months later an on-call alert yanks him back,
            and he investigates his own code from scratch. The person who knew the
            most is now the bottleneck.
          </p>
          {daniel && <PersonaJourney persona={daniel} />}

          <p>
            <strong>Peter</strong> has used the same workflow for six years. We ship
            a change, his muscle memory breaks, and he can’t tell if it’s a bug or
            on purpose — so he files a ticket. That ticket lands straight on our
            mean-time-to-respond.
          </p>
          {peter && <PersonaJourney persona={peter} />}

          <p>
            Three journeys, one cause: the context exists, it’s just never put to
            work after release. And it isn’t only these three — multiply it across
            the whole org.
          </p>
        </Section>

        <Section eyebrow="The core insight" title="Knowledge we make, then waste">
          <p>
            Strip away the stories and one idea is left standing:{' '}
            <strong>
              feature knowledge is created during the SDLC, but it’s never
              operationalized after release.
            </strong>{' '}
            We build the understanding while we build the product — and then we
            just don’t use it.
          </p>
          <p>
            So after release, teams fall back on fragmented artifacts and human
            memory to answer the same questions, over and over:
          </p>
          <QuestionCluster />
          <p>
            Every one of those is answered today by memory and guesswork. That’s the
            gap.
          </p>
        </Section>

        <Section eyebrow="The solution" title="The fix, in one sentence">
          <p className="afil-post-thesis">
            {solutionSlide.thesisLead}
            <strong>{solutionSlide.thesisHl}</strong>
            {solutionSlide.thesisTrail}
          </p>
          <p>
            Here’s the shape of it. Everything we already produce — PRs, tickets,
            specs, Figma, docs, tests, release notes, incidents — funnels into one
            layer, and comes back out as knowledge the whole org can use.
          </p>
          <Funnel />
        </Section>

        <Section eyebrow="System design" title="How it actually works">
          <p>
            Under the hood it’s three capabilities sitting on one layer, with three
            rules baked in: {architectureSlide.note.join(' · ')}.
          </p>
          <CapabilityFlow />
          <p>
            <strong>01 · Feature Memory</strong> is how knowledge gets <em>in</em>:
            SDLC sources flow through ingestion and a context builder into a
            knowledge base. <strong>02 · AI Triage Assistant</strong> is how it gets{' '}
            <em>used</em>: a question in, a classification with sources and next
            steps out. <strong>03 · Feedback Loop</strong> is how it gets{' '}
            <em>better</em>: analytics spots repeated issues and docs gaps, then
            feeds them back into the build.
          </p>

          <h3 className="afil-post-h3">Wait — what’s that “RAG” box?</h3>
          <p>
            Fair question, and it’s the heart of the whole thing. You might ask: why
            not just hand the question to ChatGPT? Because a base model never
            trained on <em>your</em> PRDs, tickets, runbooks, Slack threads, or
            incidents. Ask it about your product and it’ll confidently make things
            up. So we have to feed it your context.
          </p>
          <p>
            The trick is turning your documents into a <em>map of meaning</em>. Each
            passage becomes a point in “meaning space”, and similar ideas sit close
            together — so you can search by meaning instead of keywords. “Template
            stuck in pending” and “approval status delay” land right next to each
            other; “billing invoice error” sits far away.
          </p>
          <VectorCluster />
          <p>
            That technique has a name: <strong>RAG</strong>, or Retrieval-Augmented
            Generation. Two steps — index all your knowledge once, then for every
            question fetch the most relevant chunks and answer <em>with</em> them.
          </p>
          <RagFlow />
          <p>
            The whole principle in four words: retrieve first, answer second.
            Grounded in your sources, not guessed.
          </p>
        </Section>

        <Section eyebrow="The payoff" title="What this actually buys you">
          <p>
            Picture the same ticket landing two different ways. Today, it drops into
            the fog of scattered sources, and your only real exit is “go find
            whoever built it” — slow, human-dependent, and it doesn’t scale.
          </p>
          <p>
            With the layer, that same ticket already has its context waiting. Out
            comes an answer, the evidence behind it, and a next step — so you
            resolve or escalate with confidence. And the resolution feeds back in,
            so next time is easier.
          </p>
          <BeforeAfter />
        </Section>
      </article>
    </div>
  );
}
