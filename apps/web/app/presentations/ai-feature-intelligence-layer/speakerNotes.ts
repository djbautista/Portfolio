/**
 * Speaker notes for the deck — a parallel, presenter-only track keyed to every
 * beat the live deck can be on. The companion notes view ({@link ./notes/page})
 * looks these up by the same (slide, stage) the deck broadcasts, so the story
 * advances in lock-step with the slides.
 *
 * Each bullet is a key `idea` plus a few `say` variants — short, simple-word
 * ways to voice that idea out loud. The phrasings are deliberately telegraphic
 * (keyword-dense, minimal grammar); the only connectors kept are the ones that
 * help bridge one idea into the next ("So", "Now", "But", "Then", "Here").
 *
 * Keyed by `"<slide>:<stage>"`; missing keys fall back to an empty note. The
 * (slide, stage) space is defined in {@link ./steps} — when a slide's step count
 * changes there, add/adjust the matching keys here.
 */

export interface NoteBullet {
  /** the key point to land on this beat */
  idea: string;
  /** a few simple ways to say it out loud */
  say: string[];
}

export interface SpeakerNote {
  /** short orienting label for the beat */
  headline?: string;
  bullets: NoteBullet[];
}

export const speakerNotes: Record<string, SpeakerNote> = {
  // --- Slide 0 · Title + SDLC pipeline (stages 0–11) ---
  '0:0': {
    headline: 'Open — the big idea',
    bullets: [
      { idea: 'This talk is about what happens AFTER release.', say: ['Today: what happens after we ship.', 'Not building features — what comes next.'] },
      { idea: 'Name it: the AI Feature Intelligence Layer.', say: ['I’m proposing an AI Feature Intelligence Layer.', 'One name to hold: Feature Intelligence Layer.'] },
      { idea: 'Turn SDLC artifacts into operational knowledge.', say: ['It turns our build artifacts into usable knowledge.', 'Docs, tickets, code → knowledge teams can use.'] },
    ],
  },
  '0:1': {
    headline: 'The pre-release pipeline',
    bullets: [
      { idea: 'Walk the flow: Discovery → Design → Engineering → QA → Release.', say: ['First, the path every feature takes.', 'Discovery, design, build, QA, ship.'] },
      { idea: 'Rich context gets created here…', say: ['Along the way we create tons of context.', 'Every stage leaves knowledge behind.'] },
      { idea: '…and today it stops at the release line.', say: ['But it mostly dies at release.', 'Then — ship — and it’s lost.'] },
    ],
  },
  '0:2': {
    headline: 'Post-release: Support',
    bullets: [
      { idea: 'Release isn’t the finish line — work fans out.', say: ['Shipping isn’t the end.', 'After release, the real work fans out.'] },
      { idea: 'Support is first: “bug or expected?”', say: ['Support asks: bug, or expected?', 'First stop — support fielding questions.'] },
    ],
  },
  '0:3': {
    headline: 'Post-release: Docs',
    bullets: [{ idea: 'Docs must reflect what actually shipped.', say: ['Docs need to match what we shipped.', 'Then docs — usually out of date.'] }],
  },
  '0:4': {
    headline: 'Post-release: QA',
    bullets: [{ idea: 'QA revisits behavior after the spec is cold.', say: ['QA comes back long after the spec.', 'QA re-checks behavior months later.'] }],
  },
  '0:5': {
    headline: 'Post-release: Product Feedback',
    bullets: [{ idea: 'Product reads signals to decide what’s next.', say: ['Product watches signals for the next move.', 'Then product — planning what’s next.'] }],
  },
  '0:6': {
    headline: 'Post-release: Onboarding',
    bullets: [{ idea: 'New teammates ramp on undocumented features.', say: ['New folks ramp on what nobody wrote down.', 'Onboarding — learning the undocumented.'] }],
  },
  '0:7': {
    headline: 'Post-release: Incident Response',
    bullets: [{ idea: 'On-call acts fast, usually without context.', say: ['On-call has to move fast, blind.', 'Incidents — no time to dig.'] }],
  },
  '0:8': {
    headline: 'Post-release: Ownership Transfer',
    bullets: [{ idea: 'Features change hands; the “why” doesn’t transfer.', say: ['Features change owners; the “why” is lost.', 'Handoffs drop the reasoning.'] }],
  },
  '0:9': {
    headline: 'Post-release: Future Development',
    bullets: [{ idea: 'Next iteration builds on fading knowledge.', say: ['The next version builds on fading memory.', 'Future work — on half-remembered context.'] }],
  },
  '0:10': {
    headline: 'Step back',
    bullets: [
      { idea: 'Eight post-release jobs, all need the same context.', say: ['Eight jobs — all hungry for the same context.', 'Step back: one need, eight places.'] },
      { idea: 'Today it lives in scattered docs and people’s heads.', say: ['Today it’s in scattered docs and heads.', 'It’s all tribal knowledge.'] },
    ],
  },
  '0:11': {
    headline: 'Reveal the layer',
    bullets: [
      { idea: 'The proposal: one layer feeding all of them.', say: ['My fix: one layer feeding all eight.', 'Here’s the idea — a shared layer.'] },
      { idea: 'Spine connects release → every post-release need.', say: ['A spine from release to every need.', 'One source, every team.'] },
      { idea: 'This is what the talk builds toward.', say: ['That’s where we’re headed.', 'Hold that picture.'] },
    ],
  },

  // --- Slide 1 · About (stages 0–2) ---
  '1:0': {
    headline: 'Who I am',
    bullets: [
      { idea: 'David Bautista — Senior Engineer.', say: ['Quick intro — I’m David, senior engineer.', 'Me in one line: senior engineer.'] },
      { idea: 'Personal thesis: build with impact.', say: ['What drives me: build with impact.', 'I care about impact, not just shipping.'] },
    ],
  },
  '1:1': {
    headline: 'Software → Product',
    bullets: [
      { idea: 'I think past code to the product outcome.', say: ['I think beyond code — to outcomes.', 'Software mind, product mind.'] },
      { idea: 'The role swap signals how I work.', say: ['That’s the shift in how I work.', 'Engineer who thinks like a PM.'] },
    ],
  },
  '1:2': {
    headline: 'How I work + a story',
    bullets: [
      { idea: 'Curiosity + Ownership + Attention to Detail = great products.', say: ['My formula: curiosity, ownership, detail.', 'Three traits, one outcome: great products.'] },
      { idea: '2018 UNFPA ECHO — NLP linking citizen language to the SDGs.', say: ['Back in 2018 — ECHO, at the UN.', 'NLP turning everyday words into UN goals.'] },
      { idea: 'Same instinct as today: messy language → usable knowledge.', say: ['Same instinct then and now.', 'Messy language into usable knowledge.'] },
    ],
  },

  // --- Slide 2 · Persona journeys (stages 0–18) ---
  '2:0': {
    headline: 'Rachel — Product Designer',
    bullets: [{ idea: 'Meet Rachel; she owns the earliest context.', say: ['First, Rachel — a product designer.', 'Rachel holds the earliest context.'] }],
  },
  '2:1': { bullets: [{ idea: 'Starts closest to the user — raw research.', say: ['She starts with user research.', 'Closest to the user.'] }] },
  '2:2': { bullets: [{ idea: 'Turns research into discovery insights.', say: ['Research becomes insights.', 'She shapes the findings.'] }] },
  '2:3': { bullets: [{ idea: 'Hands off to engineering in live sessions.', say: ['Then hands off to engineering.', 'Live handoff sessions.'] }] },
  '2:4': { bullets: [{ idea: 'Over time the original context dilutes.', say: ['But over time, context fades.', 'The original “why” thins out.'] }] },
  '2:5': {
    bullets: [
      { idea: 'Ends in clarification loops — re-explaining what she knew.', say: ['She’s stuck re-explaining herself.', 'Endless clarification loops.'] },
      { idea: 'Her deep context evaporates after handoff.', say: ['Her knowledge evaporates post-handoff.', 'Gone once she hands off.'] },
    ],
  },
  '2:6': {
    headline: 'Daniel — Engineer',
    bullets: [{ idea: 'Now Daniel — he ships, then moves on.', say: ['Next, Daniel — an engineer.', 'Daniel ships and moves on.'] }],
  },
  '2:7': { bullets: [{ idea: 'Feature shipped — context fresh, briefly.', say: ['He ships; it’s fresh — for now.', 'Day one, he knows it cold.'] }] },
  '2:8': { bullets: [{ idea: 'Time passes; he’s deep in other work.', say: ['Time passes, new projects.', 'Months go by.'] }] },
  '2:9': { bullets: [{ idea: 'An on-call alert yanks him back.', say: ['Then — a 2am alert.', 'On-call pulls him back.'] }] },
  '2:10': { bullets: [{ idea: 'He re-investigates his own feature from scratch.', say: ['He digs into his own code again.', 'Starting from zero — on his own work.'] }] },
  '2:11': {
    bullets: [
      { idea: 'Pure interruption — context had to be rebuilt.', say: ['Total interruption.', 'He rebuilds context he once had.'] },
      { idea: 'The one who knew is now the bottleneck.', say: ['The expert becomes the bottleneck.', 'Knowing it makes him the blocker.'] },
    ],
  },
  '2:12': {
    headline: 'Peter — End User (6 yrs on it)',
    bullets: [{ idea: 'Finally Peter, the long-time user.', say: ['Last, Peter — our user.', 'Six years on the same feature.'] }],
  },
  '2:13': { bullets: [{ idea: 'Lived in the old workflow for years.', say: ['He knows the old way by heart.', 'Years of muscle memory.'] }] },
  '2:14': { bullets: [{ idea: 'A product change lands.', say: ['Then we change it.', 'An update ships.'] }] },
  '2:15': { bullets: [{ idea: 'His muscle memory breaks.', say: ['His habits break.', 'Nothing’s where it was.'] }] },
  '2:16': { bullets: [{ idea: 'Confusion — is it broken, or intended?', say: ['He’s confused — bug or feature?', 'Broken, or on purpose?'] }] },
  '2:17': {
    bullets: [
      { idea: 'He raises a ticket.', say: ['So he files a ticket.', 'And now support’s involved.'] },
      { idea: 'This directly hits Mean Time To Respond.', say: ['This drives up response time.', 'A straight hit to MTTR.'] },
      { idea: 'Longer support digs, longer Peter waits.', say: ['The longer the dig, the longer he waits.', 'His wait equals our dig time.'] },
    ],
  },
  '2:18': {
    headline: 'One problem, everyone',
    bullets: [
      { idea: 'Three journeys, one root cause: context isn’t operationalized.', say: ['Three stories, one cause.', 'Same gap every time — lost context.'] },
      { idea: 'Not just three — the crowd is everyone.', say: ['And it’s not just them — it’s everyone.', 'Multiply by the whole org.'] },
      { idea: 'Sets up the core insight.', say: ['Which brings the core insight.', 'So — here’s the real problem.'] },
    ],
  },

  // --- Slide 3 · Core insight (stages 0–2) ---
  '3:0': {
    headline: 'The core insight',
    bullets: [
      { idea: 'Feature knowledge is created during the SDLC…', say: ['We create the knowledge while building.', 'It’s all there during development.'] },
      { idea: '…but it is NOT operationalized after release.', say: ['But we never put it to work after.', 'We just don’t use it post-release.'] },
    ],
  },
  '3:1': {
    headline: 'The questions teams ask',
    bullets: [
      { idea: 'What changed? Bug or expected? Who owns this? How to troubleshoot?', say: ['These questions hit every day.', 'What changed? Who owns it? Bug or not?'] },
      { idea: 'Today each is answered by memory and guesswork.', say: ['Answered today by memory and guessing.', 'All tribal knowledge.'] },
    ],
  },
  '3:2': {
    headline: 'Back to the insight',
    bullets: [
      { idea: 'Strip the noise — one idea remains.', say: ['Clear the noise — one truth.', 'Boil it down.'] },
      { idea: 'Teams lean on fragmented artifacts + human memory.', say: ['We rely on scattered docs and memory.', 'Fragments plus people’s heads.'] },
      { idea: 'That’s the gap we close.', say: ['That’s exactly what we’ll fix.', 'Here’s the gap to close.'] },
    ],
  },

  // --- Slide 4 · Systematic solution (stages 0–1) ---
  '4:0': {
    headline: 'The thesis',
    bullets: [
      { idea: 'An AI layer that turns SDLC artifacts into reusable operational knowledge.', say: ['One layer: artifacts → reusable knowledge.', 'The whole thesis in a sentence.'] },
      { idea: 'Pause — this is the spine of the proposal.', say: ['This is the heart of it.', 'Everything hangs on this.'] },
    ],
  },
  '4:1': {
    headline: 'Fragmented → layer → knowledge',
    bullets: [
      { idea: 'Left: artifacts funnel in — PRs, tickets, specs, Figma, docs, tests, release notes, incidents.', say: ['On the left, all our artifacts feed in.', 'Everything we already produce goes in.'] },
      { idea: 'Center: the AI Feature Intelligence Layer.', say: ['In the middle, the layer.', 'It all flows through one layer.'] },
      { idea: 'Right: fans out — Support, Triage, Handoffs, Onboarding, Continuous improvement.', say: ['On the right, it powers every team.', 'Out comes knowledge for everyone.'] },
    ],
  },

  // --- Slide 5 · System architecture (ARCH_STAGE 0–10) ---
  '5:0': {
    headline: 'Three capabilities, one layer',
    bullets: [
      { idea: 'Zoom to the system design.', say: ['Let’s look under the hood.', 'Now — the architecture.'] },
      { idea: 'Three capabilities on one intelligence layer.', say: ['Three capabilities, one layer.', 'It does three things.'] },
      { idea: 'Guardrails: permission-aware, RAG-first, evidence-backed.', say: ['Always: permissions, RAG, evidence.', 'Three rules baked in.'] },
    ],
  },
  '5:1': {
    headline: '01 · Feature Memory',
    bullets: [
      { idea: 'How knowledge gets IN.', say: ['First — how knowledge gets in.', 'Capability one: memory.'] },
      { idea: 'SDLC sources → Ingestion → Context Builder → Knowledge Base.', say: ['Pull in, build context, store.', 'Jira, GitHub, Figma flow into the base.'] },
      { idea: 'The Knowledge Base holds a vector index — let’s open it.', say: ['At its core, a vector index.', 'Let me open that up.'] },
    ],
  },
  '5:2': {
    headline: 'Into the Knowledge Base',
    bullets: [
      { idea: 'Push the camera inside to explain how it works.', say: ['Let’s go inside.', 'Zoom in on the knowledge base.'] },
      { idea: 'Start with the obvious objection…', say: ['First, the obvious question.', 'You might ask…'] },
    ],
  },
  '5:3': {
    headline: 'Why not just ask the AI?',
    bullets: [
      { idea: 'A base model never trained on YOUR PRDs, tickets, runbooks, Slack, incidents.', say: ['ChatGPT never saw your internal stuff.', 'The model doesn’t know your product.'] },
      { idea: 'So it confidently makes things up.', say: ['So it just makes things up.', 'Confident — and wrong.'] },
      { idea: 'We have to feed it your context.', say: ['We must give it your context.', 'That’s why we feed it our data.'] },
    ],
  },
  '5:4': {
    headline: 'Documents → a map of meaning',
    bullets: [
      { idea: 'Chunk + embed every doc into points.', say: ['We break docs into points.', 'Each chunk becomes a dot.'] },
      { idea: 'Close together = similar topic.', say: ['Close dots mean similar meaning.', 'Nearby — related.'] },
      { idea: 'You search by meaning, not keywords.', say: ['Search by meaning, not words.', 'No keyword matching here.'] },
    ],
  },
  '5:5': {
    headline: 'Text becomes vectors',
    bullets: [
      { idea: 'Each passage becomes numbers in “meaning space”.', say: ['Text turns into numbers.', 'Each phrase, a point in meaning-space.'] },
      { idea: 'Similar meaning = closer vectors.', say: ['Similar meaning, closer numbers.', 'Meaning becomes distance.'] },
      { idea: '“Approval delay” and “stuck in pending” cluster; “billing error” sits apart.', say: ['Same idea lands together.', 'Different topic lands far away.'] },
    ],
  },
  '5:6': {
    headline: 'RAG · Step 1 — Index',
    bullets: [
      { idea: 'This is Retrieval-Augmented Generation.', say: ['This technique is called RAG.', 'Meet RAG.'] },
      { idea: 'Step 1: index all knowledge sources into the vector DB.', say: ['Step one — index everything.', 'First we load it all in.'] },
    ],
  },
  '5:7': {
    headline: 'RAG · Step 2 — Retrieve + generate',
    bullets: [
      { idea: 'Question in → retrieve top-K chunks → answer WITH that context.', say: ['Question comes, fetch the right bits, then answer.', 'Find first, then respond.'] },
      { idea: 'Principle: retrieve first, answer second.', say: ['The rule: retrieve first, answer second.', 'Look it up, then speak.'] },
      { idea: 'Grounded, not guessed.', say: ['Grounded in facts, not guesses.', 'Backed by sources.'] },
    ],
  },
  '5:8': {
    headline: 'Zoom back out',
    bullets: [
      { idea: 'Close the explainer; return to the system.', say: ['Okay — back to the big picture.', 'Let’s zoom back out.'] },
      { idea: 'That’s the engine inside Feature Memory.', say: ['That’s the engine inside memory.', 'So — that’s capability one.'] },
    ],
  },
  '5:9': {
    headline: '02 · AI Triage Assistant',
    bullets: [
      { idea: 'How knowledge gets USED.', say: ['Next — how we use it.', 'Capability two: triage.'] },
      { idea: 'Query in (Support/QA/PM/Eng) → RAG runtime → Output Parser.', say: ['Anyone asks; RAG answers.', 'Question in, structured answer out.'] },
      { idea: 'Returns classification, sources, next steps — evidence-backed.', say: ['You get a verdict, sources, next steps.', 'Always with evidence.'] },
    ],
  },
  '5:10': {
    headline: '03 · Feedback Loop',
    bullets: [
      { idea: 'Knowledge improves itself.', say: ['Last — it gets smarter over time.', 'Capability three: feedback.'] },
      { idea: 'Analytics spots repeated issues + docs gaps.', say: ['It spots patterns and gaps.', 'Sees what keeps breaking.'] },
      { idea: 'Feeds learnings back to the SDLC — the loop closes.', say: ['Then feeds it back into building.', 'Closing the loop.'] },
    ],
  },

  // --- Slide 6 · The payoff (stages 0–2) ---
  '6:0': {
    headline: 'Before',
    bullets: [
      { idea: 'A ticket drops into the fog of scattered sources.', say: ['Before — a ticket lands in the fog.', 'Today, a question hits chaos.'] },
      { idea: 'Only exit today: “ask the original engineer.”', say: ['Your only option — find whoever built it.', 'Go ask the original engineer.'] },
      { idea: 'Slow, human-dependent, doesn’t scale.', say: ['Slow and people-dependent.', 'It just doesn’t scale.'] },
    ],
  },
  '6:1': {
    headline: 'After',
    bullets: [
      { idea: 'Same ticket enters the layer — context already there.', say: ['After — the same ticket hits the layer.', 'Now the context is ready.'] },
      { idea: 'Out comes: an answer, the evidence, and a next step.', say: ['You get an answer, evidence, a next step.', 'Three things, instantly.'] },
    ],
  },
  '6:2': {
    headline: 'The payoff',
    bullets: [
      { idea: 'Resolve or escalate WITH context — confidently.', say: ['Now you act with confidence.', 'Resolve or escalate — with context.'] },
      { idea: 'And it feeds back into the SDLC for next time.', say: ['And it improves the next cycle.', 'Plus it loops back.'] },
      { idea: 'The whole before/after in one glance.', say: ['That’s the before and after.', 'Night and day.'] },
    ],
  },

  // --- Slide 7 · Demo (stage 0) ---
  '7:0': {
    headline: 'Demo time',
    bullets: [
      { idea: 'Hand off to the live demo.', say: ['Enough slides — let’s see it.', 'Time for the live demo.'] },
      { idea: 'Watch the layer field a real ticket, end to end.', say: ['Watch it handle a real ticket.', 'Live, start to finish.'] },
    ],
  },
};

const EMPTY_NOTE: SpeakerNote = { bullets: [] };

/** Note for a (slide, stage) beat; empty (never null) if none is authored. */
export function getNote(slide: number, stage: number): SpeakerNote {
  return speakerNotes[`${slide}:${stage}`] ?? EMPTY_NOTE;
}
