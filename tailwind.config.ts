import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        neumorphism:
          'inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      colors: {
        primary: { ...colors.sky, DEFAULT: colors.sky[500] },
        secondary: { ...colors.fuchsia, DEFAULT: colors.fuchsia[500] },
        neutral: { ...colors.neutral, DEFAULT: colors.neutral[900] },
      },
      spacing: {
        '8xl': '88rem',
        '100': '30rem',
        '106': '32rem',
        '108': '34rem',
        '110': '36rem',
        '112': '38rem',
        '114': '40rem',
        '116': '42rem',
        '118': '44rem',
        '120': '46rem',
        '122': '48rem',
        '124': '50rem',
        '126': '52rem',
        '128': '54rem',
        '130': '56rem',
        '132': '58rem',
      },
      maxWidth: {
        '8xl': '90rem',
        '9xl': '100rem',
      },
      fontSize: {
        '10xl': '8rem',
        '11xl': '9rem',
        '12xl': '10rem',
      },
      keyframes: {
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: {
            opacity: '0',
            transform: 'translate(-50%, -48%) scale(0.96)',
          },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    plugin(({ theme, addUtilities }) => {
      type Properties =
        | '&:hover'
        | '&:active'
        | 'backgroundColor'
        | 'borderColor';

      const retroButtonUtilities: Record<
        string,
        {
          [pseudoClass in Properties]:
            | string
            | {
                backgroundColor: string;
                borderColor: string;
              };
        }
      > = {};

      const colors = theme('colors');

      for (const color in colors) {
        if (typeof colors[color] === 'object') {
          const bgColor = colors[color][500] as string;
          const borderColor = colors[color][700] as string;
          const hoverBgColor = colors[color][400] as string;
          const hoverBorderColor = colors[color][600] as string;
          const activeBgColor = colors[color][600] as string;
          const activeBorderColor = colors[color][800] as string;

          retroButtonUtilities[`.retro-button-${color}`] = {
            backgroundColor: bgColor,
            borderColor,
            '&:hover': {
              backgroundColor: hoverBgColor,
              borderColor: hoverBorderColor,
            },
            '&:active': {
              backgroundColor: activeBgColor,
              borderColor: activeBorderColor,
            },
          };

          retroButtonUtilities[`.retro-button-${color}.demoted`] = {
            ...retroButtonUtilities[`.retro-button-${color}`],
            backgroundColor: 'transparent',
          };

          addUtilities(retroButtonUtilities);
        }
      }
    }),
    plugin(({ theme, addUtilities }) => {
      const neonUtilities = {} as Record<string, { boxShadow: string }>;
      const colors = theme('colors');
      for (const color in colors) {
        if (typeof colors[color] === 'object') {
          const color1 = colors[color]['500'];
          const color2 = colors[color]['700'];
          neonUtilities[`.neon-${color}`] = {
            boxShadow: `0 0 60px 20px ${color1}, 0 0 20px 10px ${color2}`,
          };
        }
      }
      addUtilities(neonUtilities);
    }),
    plugin(({ theme, addUtilities }) => {
      const patternUtilities = {} as Record<
        string,
        {
          backgroundColor: string;
          backgroundImage: string;
          backgroundSize: string;
        }
      >;

      const colors = theme('colors');

      for (const color in colors) {
        if (typeof colors[color] === 'object') {
          patternUtilities[`.bg-boxes-${color}`] = {
            backgroundColor: colors[color][950],
            backgroundImage: `linear-gradient(${colors[color][900]} 0.1rem, transparent 0.1rem), linear-gradient(to right, ${colors[color][900]} 0.1rem, ${colors[color][950]} 0.1rem)`,
            backgroundSize: '0.5rem 0.5rem',
          };
        }
      }

      addUtilities(patternUtilities);
    }),
  ],
};
export default config;
