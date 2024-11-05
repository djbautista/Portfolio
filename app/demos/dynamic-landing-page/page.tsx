import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

import getInitialComponents from './api/getInitialComponents';
import { Block } from './components/Block';
import { Component } from './model/Component';

import styles from './page.module.scss';

const canelaThin = localFont({
  src: './fonts/Canela-Thin.otf',
  variable: '--font-canela',
  weight: '100 900',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default async function Home() {
  let initialComponents: Component[] = [];

  try {
    const { components } = await getInitialComponents();

    initialComponents = components;
  } catch (error) {
    console.error(error);
  }

  return (
    <div className={`${inter.variable} ${canelaThin.variable}  ${styles.page}`}>
      <main className={styles.main}>
        {initialComponents.map((component, index) => (
          <Block key={index} component={component} />
        ))}
      </main>
    </div>
  );
}
