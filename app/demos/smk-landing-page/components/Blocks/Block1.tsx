// Block1.tsx

import React from 'react';

import { Block1 as Block1Props } from '../../model/Blocks';

import styles from './Block1.module.scss';

const Block1: React.FC<Block1Props> = ({ text_1, text_2, words }) => {
  return (
    <div className={styles.block1}>
      <h1>{text_1}</h1>
      <ul>
        {words.map((word) => (
          <li key={word.id}>{word.word}</li>
        ))}
      </ul>
      <h2>{text_2}</h2>
    </div>
  );
};

export { Block1 };
