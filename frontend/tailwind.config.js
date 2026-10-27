/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary))',
        secondary: 'rgb(var(--color-secondary))',
        accent: 'rgb(var(--color-accent))',
        neutral: 'rgb(var(--color-neutral))',
        'base-100': 'rgb(var(--color-base-100))',
        'base-200': 'rgb(var(--color-base-200))',
        'base-300': 'rgb(var(--color-base-300))'
      }
    }
  }
};
