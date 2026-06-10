'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { manrope, spaceGrotesk } from '@/utils/fonts';

import { SLIDE_COUNT, personas } from './data';
import { SlideNavigation } from './SlideNavigation';
import { useDeckScale } from './useDeckScale';
import { TitleSlide } from './slides/TitleSlide';
import { AboutSlide } from './slides/AboutSlide';
import { PersonaJourneysSlide } from './slides/PersonaJourneysSlide';
import { InsightSlide } from './slides/InsightSlide';
import { SystematicSolutionSlide } from './slides/SystematicSolutionSlide';

import './presentation.css';

const PERSONA_INDEX = 2;
const MAX_STAGE = personas.length - 1;

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
  const [personaStage, setPersonaStage] = useState(0);
  const scale = useDeckScale();
  const reduceMotion = useReducedMotion();

  const goToSlide = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, target));
    setIndex(clamped);
    if (clamped === PERSONA_INDEX) setPersonaStage(0); // re-entering resets the reveal
  }, []);

  const navigate = useCallback(
    (dir: Direction) => {
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
      goToSlide(index + (dir === 'next' ? 1 : -1));
    },
    [index, personaStage, goToSlide],
  );

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
        return <TitleSlide />;
      case 1:
        return <AboutSlide />;
      case PERSONA_INDEX:
        return (
          <PersonaJourneysSlide
            stage={personaStage}
            onStagePrev={() => setPersonaStage((s) => Math.max(0, s - 1))}
            onStageNext={() => setPersonaStage((s) => Math.min(MAX_STAGE, s + 1))}
          />
        );
      case 3:
        return <InsightSlide />;
      case 4:
        return <SystematicSolutionSlide />;
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
          <motion.div
            key={index}
            className="afil-canvas"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderSlide()}
          </motion.div>
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
