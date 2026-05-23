import plugin from "tailwindcss/plugin";

type ShadeMap = Record<string, string>;
type CssRule = { [key: string]: string | CssRule };

export default plugin(({ theme, addUtilities }) => {
  const colors = theme("colors") as Record<string, string | ShadeMap>;
  const utilities: Record<string, CssRule> = {};

  for (const color in colors) {
    const shades = colors[color];
    if (typeof shades !== "object" || shades === null) continue;

    const c400 = shades["400"];
    const c500 = shades["500"];
    const c600 = shades["600"];
    const c700 = shades["700"];
    const c800 = shades["800"];
    const c900 = shades["900"];
    const c950 = shades["950"];

    if (c400 && c500 && c600 && c700 && c800) {
      const base: CssRule = {
        backgroundColor: c500,
        borderColor: c700,
        "&:hover": { backgroundColor: c400, borderColor: c600 },
        "&:active": { backgroundColor: c600, borderColor: c800 },
      };
      utilities[`.retro-button-${color}`] = base;
      utilities[`.retro-button-${color}.demoted`] = {
        ...base,
        backgroundColor: "transparent",
      };

      utilities[`.neon-${color}`] = {
        boxShadow: `0 0 60px 20px ${c500}, 0 0 20px 10px ${c700}`,
      };
    }

    if (c900 && c950) {
      utilities[`.bg-boxes-${color}`] = {
        backgroundColor: c950,
        backgroundImage: `linear-gradient(${c900} 0.1rem, transparent 0.1rem), linear-gradient(to right, ${c900} 0.1rem, ${c950} 0.1rem)`,
        backgroundSize: "0.5rem 0.5rem",
      };
    }
  }

  addUtilities(utilities as Parameters<typeof addUtilities>[0]);
});
