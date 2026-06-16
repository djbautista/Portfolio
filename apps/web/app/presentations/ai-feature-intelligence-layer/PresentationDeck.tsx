'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { manrope, spaceGrotesk } from '@/utils/fonts';

import { SLIDE_COUNT, personaStageCount } from './data';
import { SlideNavigation } from './SlideNavigation';
import { useDeckScale } from './useDeckScale';
import { TitleSlide } from './slides/TitleSlide';
import { AboutSlide } from './slides/AboutSlide';
import { PersonaJourneysSlide } from './slides/PersonaJourneysSlide';
import { InsightSlide } from './slides/InsightSlide';
import { SystematicSolutionSlide } from './slides/SystematicSolutionSlide';
import { ArchitectureSlide, MAX_ARCH_STAGE } from './slides/ArchitectureSlide';
import { PayoffSlide } from './slides/PayoffSlide';
import { DemoSlide } from './slides/DemoSlide';

import './presentation.css';

const TITLE_INDEX = 0;
// 0 resting · 1 focus diagram · 2–9 spotlight each of the 8 post-release bullets
// one at a time · 10 restore all bullets to normal · 11 reveal the AI layer
// (caption + spine + red release).
const MAX_TITLE_STAGE = 11;
const ABOUT_INDEX = 1;
// 0 centered · 1 swap role Software→Product · 2 column home + right column reveal.
const MAX_ABOUT_STAGE = 2;
const PERSONA_INDEX = 2;
// Each persona reveals its identity, then its steps one at a time (see
// personaStageCount); the final beat (personaStageCount) is the synthesis
// moment — profiles recenter, journeys fade, the anonymous crowd appears.
const MAX_STAGE = personaStageCount;
const INSIGHT_INDEX = 3;
// 0 resting (main insight prominent, questions dim) · 1 bring the scattered
// questions forward and dim the central insight behind them · 2 fade the
// questions out and restore the central insight, clean on its own.
const MAX_INSIGHT_STAGE = 2;
const SOLUTION_INDEX = 4;
// 0 thesis sentence alone, centered in the window · 1 thesis settles into its
// header slot and the diagram + chrome reveal.
const MAX_SOLUTION_STAGE = 1;
const ARCH_INDEX = 5;
const PAYOFF_INDEX = 6;
// 0 the "Before" section alone · 1 crossfade to the "After" section · 2 slide
// "After" into the left half (compact card) + fade the SDLC diagram in on the right.
const MAX_PAYOFF_STAGE = 2;
// Closing interstitial — no internal stages; navigate() falls straight through
// to slide change at both ends.
const DEMO_INDEX = 7;

type Direction = 'next' | 'prev';

/**
 * Top-level deck: owns the active slide index, the persona slide's 1/3 → 3/3
 * reveal stage, keyboard navigation, and the 1920×1080 scale-to-fit wrapper.
 *
 * Arrow keys (and the bottom nav arrows) advance the persona reveal first and
 * only fall through to slide navigation at its boundaries — recreating the
 * prototype's behavior in React state instead of its vanilla controller.
 */
export function PresentationDeck() {
  const [index, setIndex] = useState(0);
  const [titleStage, setTitleStage] = useState(0);
  const [aboutStage, setAboutStage] = useState(0);
  const [personaStage, setPersonaStage] = useState(0);
  const [insightStage, setInsightStage] = useState(0);
  const [solutionStage, setSolutionStage] = useState(0);
  const [archStage, setArchStage] = useState(0);
  const [payoffStage, setPayoffStage] = useState(0);
  const scale = useDeckScale();
  const reduceMotion = useReducedMotion();

  const goToSlide = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, target));
      if (clamped !== index) {
        // re-entering an interactive slide restarts its reveal; staying put
        // (e.g. ArrowRight past the deck's end clamping back) must not
        if (clamped === TITLE_INDEX) setTitleStage(0);
        if (clamped === ABOUT_INDEX) setAboutStage(0);
        if (clamped === PERSONA_INDEX) setPersonaStage(0);
        if (clamped === INSIGHT_INDEX) setInsightStage(0);
        if (clamped === SOLUTION_INDEX) setSolutionStage(0);
        if (clamped === ARCH_INDEX) setArchStage(0);
        if (clamped === PAYOFF_INDEX) setPayoffStage(0);
      }
      setIndex(clamped);
    },
    [index],
  );

  const navigate = useCallback(
    (dir: Direction) => {
      if (index === TITLE_INDEX) {
        if (dir === 'next' && titleStage < MAX_TITLE_STAGE) {
          setTitleStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && titleStage > 0) {
          setTitleStage((s) => s - 1);
          return;
        }
      }
      if (index === ABOUT_INDEX) {
        if (dir === 'next' && aboutStage < MAX_ABOUT_STAGE) {
          setAboutStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && aboutStage > 0) {
          setAboutStage((s) => s - 1);
          return;
        }
      }
      if (index === PERSONA_INDEX) {
        if (dir === 'next' && personaStage < MAX_STAGE) {
          setPersonaStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && personaStage > 0) {
          setPersonaStage((s) => s - 1);
          return;
        }
      }
      if (index === INSIGHT_INDEX) {
        if (dir === 'next' && insightStage < MAX_INSIGHT_STAGE) {
          setInsightStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && insightStage > 0) {
          setInsightStage((s) => s - 1);
          return;
        }
      }
      if (index === SOLUTION_INDEX) {
        if (dir === 'next' && solutionStage < MAX_SOLUTION_STAGE) {
          setSolutionStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && solutionStage > 0) {
          setSolutionStage((s) => s - 1);
          return;
        }
      }
      if (index === ARCH_INDEX) {
        if (dir === 'next' && archStage < MAX_ARCH_STAGE) {
          setArchStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && archStage > 0) {
          setArchStage((s) => s - 1);
          return;
        }
      }
      if (index === PAYOFF_INDEX) {
        if (dir === 'next' && payoffStage < MAX_PAYOFF_STAGE) {
          setPayoffStage((s) => s + 1);
          return;
        }
        if (dir === 'prev' && payoffStage > 0) {
          setPayoffStage((s) => s - 1);
          return;
        }
      }
      goToSlide(index + (dir === 'next' ? 1 : -1));
    },
    [index, titleStage, aboutStage, personaStage, insightStage, solutionStage, archStage, payoffStage, goToSlide],
  );

  // On landing on the Solution slide, auto-reveal the diagram once after 2s
  // (the manual "next" beat happens on its own). Keyed on `index` so it fires
  // exactly once per entry: the functional update no-ops if the viewer already
  // advanced manually, and the cleanup cancels the timer on leaving the slide.
  useEffect(() => {
    if (index !== SOLUTION_INDEX) return;
    const id = setTimeout(() => {
      setSolutionStage((s) => (s === 0 ? 1 : s));
    }, 2000);
    return () => clearTimeout(id);
  }, [index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          navigate('next');
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          navigate('prev');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const renderSlide = () => {
    switch (index) {
      case 0:
        return <TitleSlide stage={titleStage} />;
      case ABOUT_INDEX:
        return <AboutSlide stage={aboutStage} />;
      case PERSONA_INDEX:
        return (
          <PersonaJourneysSlide
            stage={personaStage}
            onStagePrev={() => setPersonaStage((s) => Math.max(0, s - 1))}
            onStageNext={() => setPersonaStage((s) => Math.min(MAX_STAGE, s + 1))}
          />
        );
      case INSIGHT_INDEX:
        return <InsightSlide stage={insightStage} />;
      case SOLUTION_INDEX:
        return <SystematicSolutionSlide stage={solutionStage} />;
      case ARCH_INDEX:
        return <ArchitectureSlide stage={archStage} />;
      case PAYOFF_INDEX:
        return <PayoffSlide stage={payoffStage} />;
      case DEMO_INDEX:
        return <DemoSlide />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`afil-root ${spaceGrotesk.variable} ${manrope.variable}`}
      style={{ '--afil-scale': scale } as CSSProperties}
    >
      <div className="afil-stage">
        <div className="afil-scaler">
          {/* True crossfade: the outgoing slide stays mounted and fades out while
              the incoming one fades in (both `.afil-canvas` fill the plane and
              overlap), so the center is never blank between slides — the cause of
              the dark gap on entry to slides that open with empty space (e.g. the
              Solution slide's emerging statement). Reduced motion swaps instantly. */}
          <AnimatePresence>
            <motion.div
              key={index}
              className="afil-canvas"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SlideNavigation
        index={index}
        total={SLIDE_COUNT}
        onPrev={() => navigate('prev')}
        onNext={() => navigate('next')}
        onJump={goToSlide}
      />
    </div>
  );
}
