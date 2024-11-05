import Image from 'next/image';
import React, { useLayoutEffect } from 'react';

import SalarDeAtacama from '@/public/demos/smooth-scroll/salar_de_atacama.jpg';
import ValleDeLaMuerte from '@/public/demos/smooth-scroll/valle_de_la_muerte.jpeg';
import MiscantiLake from '@/public/demos/smooth-scroll/miscani_lake.jpeg';
import MiniquesLagoon from '@/public/demos/smooth-scroll/miniques_lagoon.jpg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const projects = [
  {
    title: 'Salar de Atacama',
    src: SalarDeAtacama,
  },
  {
    title: 'Valle de la luna',
    src: ValleDeLaMuerte,
  },
  {
    title: 'Miscanti Lake',
    src: MiscantiLake,
  },
  {
    title: 'Miniques Lagoons',
    src: MiniquesLagoon,
  },
];

export function Projects() {
  const imageRef = React.useRef<HTMLDivElement>(null);
  const [currentProject, setCurrentProject] = React.useState(0);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: imageRef.current,
      pin: true,
      start: 'top-=100px',
      end: 'top+=100px',
    });
  }, []);

  return (
    <div className="relative mt-[25vh] p-[10%] text-white">
      <div className="flex h-[700px] items-center justify-between gap-[5%]">
        <div ref={imageRef} className="relative h-full w-[40%]">
          <Image
            fill
            className="object-cover py-8"
            src={projects[currentProject].src}
            alt={projects[currentProject].title}
          />
        </div>
        <div className="flex h-full w-[20%] items-start text-[1.6vw] leading-tight">
          <p>
            The flora is characterized by the presence of high elevation
            wetland, as well as yellow straw, broom sedge, tola de agua and tola
            amaia.
          </p>
        </div>
        <div className="flex h-full w-[20%] items-end self-end text-[1vw] font-light leading-snug">
          <p>
            Some, like the southern viscacha, vicuña and Darwins rhea, are
            classified as endangered species. Others, such as Andean goose,
            horned coot, Andean gull, puna tinamou and the three flamingo
            species inhabiting in Chile (Andean flamingo, Chilean flamingo, and
            Jamess flamingo) are considered vulnerable.
          </p>
        </div>
      </div>
      <div className="relative mt-[200px] flex w-full flex-col">
        {projects.map(({ title }, index) => (
          <div
            key={`p_${index}`}
            className="flex justify-end border-t border-white py-[1vh] text-[4vw] font-bold uppercase last:border-b"
          >
            <p className="">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
