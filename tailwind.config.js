/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'caze-bg':        '#0A1128',
        'caze-dark2':     '#1A1A2E',
        'caze-surface':   '#151c2e',
        'caze-gray-bg':   '#111520',
        // Primária — Verde Brasil
        'caze-green':     '#008542',
        'caze-green-light': '#31E46A',
        // Secundária — Amarelo Brasil
        'caze-yellow':    '#FFD100',
        'caze-yellow-alt':'#F7B521',
        // Accent
        'caze-blue':      '#1B3DE8',
        'caze-red':       '#E8175D',
        'caze-cyan':      '#00BFFF',
        'caze-orange':    '#FF6600',
        // Mantidos
        'caze-purple':    '#432B9D',
        'caze-muted':     'rgba(255,255,255,0.45)',
      },
      fontFamily: {
        // Anton — super headlines, hero, match day, live now (sempre CAPS LOCK)
        headline: ['var(--font-anton)', 'Anton', 'sans-serif'],
        // Bebas Neue — placares, cronômetros, AO VIVO, estatísticas, rankings
        sports:   ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
        // Montserrat — botões, cards, nav, CTAs, tabs, títulos menores
        ui:       ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        // Inter — feed, comentários, texto corrido, comunidade, settings
        sans:     ['var(--font-inter)', 'Inter', 'sans-serif'],
        // Barlow Condensed — nav labels, category chips, stat labels, AO VIVO badge
        barlow:   ['var(--font-barlow-condensed)', 'Barlow Condensed', 'sans-serif'],
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
