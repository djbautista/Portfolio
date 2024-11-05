'use client';

import React, { useRef } from 'react';

import { Block3 as Block3Props } from '../../model/Blocks';

import styles from './Block3.module.scss';
import { AnimatedText } from '../../components/AnimatedText';

const Block3: React.FC<Block3Props> = ({ quote, name, title }) => {
  const blockRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={blockRef} className={styles.block3}>
        <AnimatedText
          viewport={blockRef}
          className={styles.text}
          scrollTrigger={{ pin: true }}
        >
          {quote}
        </AnimatedText>
        <p>{name}</p>
        <p>{title}</p>
      </div>
      <div className={styles.background} />
    </>
  );
};

export { Block3 };
