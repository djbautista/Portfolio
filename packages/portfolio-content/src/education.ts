export interface Education {
  school: string;
  degree: string;
  period: string;
}

export const education: readonly Education[] = [
  {
    school: 'Universidad de los Andes',
    degree: 'M.Eng. in Software Engineering',
    period: '2025 - Present',
  },
  {
    school: 'Universidad de los Andes',
    degree: 'B.Eng. in Software Engineering',
    period: '2015 - 2020',
  },
];
