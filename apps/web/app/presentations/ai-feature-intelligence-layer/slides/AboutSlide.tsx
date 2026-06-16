import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';

import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { aboutSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

interface AboutSlideProps {
  /**
   * 0 = portrait column centered, role reads "Software", right column hidden;
   * 1 = role swaps in place to "Product" (column still centered);
   * 2 = column returns home and the right column reveals.
   */
  stage?: number;
}

export function AboutSlide({ stage = 0 }: AboutSlideProps) {
  const { role, formulaInputs, portrait } = aboutSlide;
  const canvasClass = [stage >= 1 ? 'swapped' : '', stage >= 2 ? 'revealed' : '']
    .filter(Boolean)
    .join(' ');

  // "Software" is wider than "Product", so the swap cell (sized to the wider
  // word) leaves a gap before "Engineer" once "Product" shows. Measure the
  // exact width difference so the trailing word can slide left to close it.
  const swapRef = useRef<HTMLSpanElement>(null);
  const prodRef = useRef<HTMLSpanElement>(null);
  const [gapClose, setGapClose] = useState(0);

  useEffect(() => {
    const measure = () => {
      const swap = swapRef.current;
      const prod = prodRef.current;
      if (!swap || !prod) return;
      const delta = swap.offsetWidth - prod.offsetWidth;
      setGapClose(delta > 0 ? delta : 0);
    };
    measure();
    // re-measure once the display font is ready (metrics differ from fallback)
    document.fonts?.ready.then(measure);
  }, []);

  return (
    <SlideFrame variant="about" className={canvasClass || undefined}>
      {/* title (top-left corner) */}
      <p className="eyebrow">
        <span className="dot" />
        <span>{aboutSlide.eyebrow}</span>
      </p>

      {/* portrait + identity (left) */}
      <div
        className="portrait"
        tabIndex={0}
        aria-label={`${portrait.alt}. ${portrait.caption.detail}`}
      >
        <div className="halo" />
        <div className="frame">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={720}
            height={506}
            priority
          />
        </div>
        <div className="scrim" />
        {/* photo caption: date · context always reads; ECHO detail fades in on hover/focus */}
        <div className="caption">
          <span className="meta">
            <span className="bar" />
            <span className="date">{portrait.caption.date}</span>
            <span className="ctx">{portrait.caption.context}</span>
          </span>
          <span className="detail">{portrait.caption.detail}</span>
        </div>
        <div className="base" />
      </div>

      <div className="identity">
        <h1 className="name">{aboutSlide.name}</h1>
        <p className="role" style={{ '--role-gap-close': `${gapClose}px` } as CSSProperties}>
          <span>{role.lead}</span>
          <span className="swap" ref={swapRef}>
            <span className="word soft">{role.swapSoft}</span>
            <span className="word prod" ref={prodRef}>{role.swapProd}</span>
          </span>
          <span className="trail">{role.trail}</span>
        </p>
      </div>

      <div className="divider-v">
        <span className="tick" />
      </div>

      {/* emphasis (right) */}
      <div className="emphasis">
        <p className="statement">
          {aboutSlide.statementLead}
          <span className="hl">{aboutSlide.statementHl}</span>
        </p>

        <div className="rule">
          <span className="seg" />
          <span className="line" />
        </div>

        <div className="formula">
          {formulaInputs.map((input, i) => (
            <Fragment key={input}>
              <span className="op">{i === 0 ? '' : '+'}</span>
              <span className="term">{input}</span>
            </Fragment>
          ))}
          <span className="op sum">=</span>
          <span className="term great">{aboutSlide.formulaOutput}</span>
        </div>
      </div>

      <div className="footer">
        <span className="bar" />
        <span>{aboutSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
