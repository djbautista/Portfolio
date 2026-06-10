import { Fragment } from 'react';
import Image from 'next/image';

import { SlideFrame } from '@/app/presentations/ai-feature-intelligence-layer/SlideFrame';
import { aboutSlide } from '@/app/presentations/ai-feature-intelligence-layer/data';

export function AboutSlide() {
  const { role, formulaInputs } = aboutSlide;

  return (
    <SlideFrame variant="about">
      {/* portrait (left) */}
      <div className="portrait">
        <div className="halo" />
        <div className="frame">
          <Image
            src={aboutSlide.portrait.src}
            alt={aboutSlide.portrait.alt}
            width={580}
            height={820}
            priority
          />
        </div>
        <div className="scrim" />
        <div className="base" />
      </div>

      <div className="divider-v">
        <span className="tick" />
      </div>

      {/* identity (right) */}
      <div className="identity">
        <p className="eyebrow">
          <span className="dot" />
          <span>{aboutSlide.eyebrow}</span>
        </p>

        <h1 className="name">{aboutSlide.name}</h1>

        <p className="role">
          <span>{role.lead}</span>
          <span className="swap">
            <span className="word prod">{role.swapProd}</span>
          </span>
          <span>{role.trail}</span>
        </p>

        <div className="rule">
          <span className="seg" />
          <span className="line" />
        </div>

        <p className="statement">
          {aboutSlide.statementLead}
          <span className="hl">{aboutSlide.statementHl}</span>
        </p>

        <div className="formula">
          <div className="inputs">
            {formulaInputs.map((input, i) => (
              <Fragment key={input}>
                <span className="f">{input}</span>
                {i < formulaInputs.length - 1 ? <span className="op">+</span> : null}
              </Fragment>
            ))}
          </div>
          <div className="output">
            <span className="arrow">&rarr;</span>
            <span className="great">{aboutSlide.formulaOutput}</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <span className="bar" />
        <span>{aboutSlide.footer}</span>
      </div>
    </SlideFrame>
  );
}
