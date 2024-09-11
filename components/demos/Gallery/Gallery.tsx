'use client';

import React, { useState } from 'react';

import { Modal, Project } from '@/components/demos/Gallery';

export const projects = [
  {
    title: 'C2 Montreal',
    src: '/demos/gallery/c2montreal.png',
    color: '#000000',
  },
  {
    title: 'Office Studio',
    src: '/demos/gallery/officestudio.png',
    color: '#8C8C8C',
  },
  {
    title: 'Locomotive',
    src: '/demos/gallery/locomotive.png',
    color: '#EFE8D3',
  },
  {
    title: 'Silencio',
    src: '/demos/gallery/silencio.png',
    color: '#706D63',
  },
];

export function Gallery() {
  const [modal, setModal] = useState({ active: false, index: 0 });

  return (
    <>
      {projects.map((project, index) => (
        <Project
          key={index}
          project={project}
          setModal={setModal}
          index={index}
        />
      ))}
      <Modal state={modal} projects={projects} />
    </>
  );
}

export default Gallery;
