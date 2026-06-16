/**
 * Beat-to-beat transition cues — a parallel, presenter-only track that runs
 * alongside {@link ./speakerNotes}. Where a speaker note tells you what to *say*
 * on a beat, a transition tells you how to *bridge into the next* one: a single
 * spoken segue that carries the story from this beat to the one after it.
 *
 * Keyed by the SOURCE beat `"<slide>:<stage>"` — `transitions['0:1']` is the line
 * that moves you off beat 0:1 and into 0:2. The final beat of the deck has no
 * successor, so it has no entry (and {@link getTransition} returns null there).
 *
 * The (slide, stage) space is defined in {@link ./steps}; keep these keys in step
 * with it — when a slide gains or loses a beat, add/adjust the matching bridges.
 */

export const transitions: Record<string, string> = {
  // --- Slide 0 · Title + SDLC pipeline ---
  '0:0': 'Before the after — trace the path every feature takes to ship.',
  '0:1': 'Now cross the release line, and watch the work fan back out — starting with support.',
  '0:2': 'But support only helps if the docs behind it are right — so, docs.',
  '0:3': 'And the team re-checking those docs against reality is QA, months later.',
  '0:4': 'Past QA, product is reading the same feature for signal on what’s next.',
  '0:5': 'Someone has to act on that “next” — and new hires ramp on it cold.',
  '0:6': 'New or not, when it breaks at 2am, on-call needs that context fast.',
  '0:7': 'Even the owner moves on — features change hands, the “why” doesn’t follow.',
  '0:8': 'Whoever inherits it then builds the next version on fading memory.',
  '0:9': 'Pull back now and look at all of it at once.',
  '0:10': 'Then reveal the one thing that could feed every one of those eight jobs.',
  '0:11': 'Hold that picture — and let me tell you who’s proposing it.',

  // --- Slide 1 · About ---
  '1:0': 'That drive toward impact is really about thinking past the code.',
  '1:1': 'Here’s how that shows up day to day — with a story to prove it.',
  '1:2': 'Let’s make it concrete with three people, starting with Rachel.',

  // --- Slide 2 · Persona journeys ---
  '2:0': 'Walk her timeline — it starts right next to the user.',
  '2:1': 'That raw research becomes the discovery insights.',
  '2:2': 'Which she then hands to engineering in live sessions.',
  '2:3': 'But the moment she hands off, the context starts to thin.',
  '2:4': 'And that leaves her re-explaining what she already knew.',
  '2:5': 'Same gap, new seat — meet Daniel, the engineer.',
  '2:6': 'Day one, he knows the feature cold.',
  '2:7': 'Then time passes, and he’s deep in other work.',
  '2:8': 'Until an on-call alert drags him back.',
  '2:9': 'And he digs into his own feature from scratch.',
  '2:10': 'Name the cost — the one who knew is now the blocker.',
  '2:11': 'Now the person it all lands on: Peter, six years a user.',
  '2:12': 'He’s lived in the old workflow for years.',
  '2:13': 'Then a product change lands.',
  '2:14': 'And his muscle memory breaks.',
  '2:15': 'Leaving him unsure — is it broken, or intended?',
  '2:16': 'So he files a ticket, and now it costs us.',
  '2:17': 'Pull the three stories together.',
  '2:18': 'Name the single root cause underneath them all.',

  // --- Slide 3 · Core insight ---
  '3:0': 'Make it tangible — the questions teams actually ask.',
  '3:1': 'Now strip the noise back to the one idea.',
  '3:2': 'Then turn that gap into the fix — the thesis.',

  // --- Slide 4 · Systematic solution ---
  '4:0': 'Show the shape of it: fragments in, knowledge out.',
  '4:1': 'Now open the hood — how the layer actually works.',

  // --- Slide 5 · System architecture ---
  '5:0': 'Start with capability one — how knowledge gets in.',
  '5:1': 'Zoom into the heart of it: the knowledge base.',
  '5:2': 'Lead with the obvious objection.',
  '5:3': 'Answer it — turn your documents into a map of meaning.',
  '5:4': 'Get concrete on how text becomes that map.',
  '5:5': 'This technique has a name — RAG, step one.',
  '5:6': 'Then the part that answers: step two.',
  '5:7': 'Close the explainer and zoom back out.',
  '5:8': 'Capability two — how that knowledge gets used.',
  '5:9': 'And capability three — how it improves itself.',
  '5:10': 'Make the payoff real — picture today, before the layer.',

  // --- Slide 6 · The payoff ---
  '6:0': 'Now run the same ticket through the layer.',
  '6:1': 'And name what that buys you.',
  '6:2': 'Enough slides — let’s watch it happen live.',

  // Slide 7 · Demo — final beat, no successor (intentionally absent).
};

/** Bridge line from a (slide, stage) beat into the next; null if it's the last beat. */
export function getTransition(slide: number, stage: number): string | null {
  return transitions[`${slide}:${stage}`] ?? null;
}
