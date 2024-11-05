// Block2.tsx

import React from 'react';
import Image from 'next/image';

import { Card } from '../../components/Card';
import { Block2 as Block2Props } from '../../model/Blocks';

import styles from './Block2.module.scss';

const Block2: React.FC<Block2Props> = ({ title, text, background }) => {
  const src = `/assetsApi/${background.url}`;

  return (
    <div className={styles.block2}>
      {background.mime.startsWith('video/') ? (
        <video src={src} autoPlay muted loop preload="auto" />
      ) : (
        <Image src={src} alt={title} priority />
      )}
      <Card className={styles.card}>
        <h1>{title}</h1>
        <p>{text}</p>
      </Card>
    </div>
  );
};

export { Block2 };
