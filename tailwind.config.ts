/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',

  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        navy: '#0B1736',
        teal: '#008080',
        gold: '#FFD700',
        surface: '#F6F8FC',
      },
    },
  },

  plugins: [],
}
