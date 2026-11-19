import type { Config } from 'tailwindcss';

const config: Config = {
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
          dark: '#D4A373',
        },
        secondary: {
          DEFAULT: '#C4956A',
          hover: '#B28359',
        },
        espresso: {
          900: '#1A120B',
          800: '#261A13',
          700: '#32231A',
          600: '#3E2723',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FDF6EC',
          200: '#F0E6D6',
          300: '#E8DDD0',
        },
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          inset: 'var(--color-surface-inset)',
          hover: 'var(--color-surface-hover)',
        },
        foreground: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
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
        'raised': 'var(--shadow-raised)',
      },
    },
  },
  plugins: [],
};

export default config;
