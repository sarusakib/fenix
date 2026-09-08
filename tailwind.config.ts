/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        navy: '#0B1736',
        teal: '#008080',
        gold: '#FFD700',
        surface: '#F6F8FC',
      },

      boxShadow: {
        premium:
          '0 20px 60px rgba(0,0,0,0.18)',
        premiumDark:
          '0 20px 60px rgba(0,0,0,0.45)',
      },

      transitionTimingFunction: {
        premium:
          'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },

  plugins: [],
}
