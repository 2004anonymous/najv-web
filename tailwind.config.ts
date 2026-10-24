import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-inter)', 'sans-serif'], heading: ['var(--font-jakarta)', 'sans-serif'] },
      colors: {
        brand: { 50: '#eeefff', 100: '#e0e2fe', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', glow: '#818cf8', purple: '#8b5cf6', emerald: '#10b981' },
        dark: { bg: '#090d16', card: '#111827', border: '#1f2937' },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'fade-up': 'fadeUp .9s ease-out both',
        kenburns: 'kenburns 9s ease-out forwards',
        'slide-in': 'slideIn .7s ease-out both',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(26px)' }, to: { opacity: '1', transform: 'none' } },
        kenburns: { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.14) translate(-1%,-1%)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(30px)' }, to: { opacity: '1', transform: 'none' } },
      },
    },
  },
  plugins: [],
};
export default config;