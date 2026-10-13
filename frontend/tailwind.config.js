/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5E3C',
          hover: '#724A2D',
          light: '#A6754E',
        },
        secondary: {
          DEFAULT: '#C4956A',
          hover: '#B28359',
        },
        tertiary: '#FDF6EC',
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          inset: 'var(--color-surface-inset)',
        },
        foreground: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'border-custom': 'var(--color-border)',
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'warm-sm': 'var(--shadow-warm-sm)',
        'warm-md': 'var(--shadow-warm-md)',
        'warm-lg': 'var(--shadow-warm-lg)',
        'inset-custom': 'var(--shadow-inset)',
      },
    },
  },
  plugins: [],
};
