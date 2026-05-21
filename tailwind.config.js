/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Anton — super headlines, hero, match day, live now (sempre CAPS LOCK)
        headline: ['var(--font-anton)', 'Anton', 'sans-serif'],
        // Bebas Neue — placares, cronômetros, AO VIVO, estatísticas, rankings
        sports:   ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
        // Montserrat — botões, cards, nav, CTAs, tabs, títulos menores
        ui:       ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        // Inter — feed, comentários, texto corrido, comunidade, settings
        sans:     ['var(--font-inter)', 'Inter', 'sans-serif'],
        // Aliases de compatibilidade
        heading:  ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        display:  ['var(--font-anton)', 'Anton', 'sans-serif'],
      },
      fontWeight: {
        brutal: '800',
        heavy:  '900',
      },
    },
  },
};
