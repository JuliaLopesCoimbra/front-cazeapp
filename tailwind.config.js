/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Títulos e chamadas agressivas (brutalismo digital)
        display: ['var(--font-syne)', 'Syne', 'sans-serif'],
        heading: ['var(--font-syne)', 'Syne', 'sans-serif'],
        // Leitura principal e componentes de UI
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        // Números, cronômetros, placares e dados do bolão
        mono: ['var(--font-space-mono)', 'Space Mono', 'monospace'],
      },
      fontWeight: {
        brutal: '800',
        heavy: '900',
      },
    },
  },
};
