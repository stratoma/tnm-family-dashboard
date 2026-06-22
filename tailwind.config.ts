import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fbfaf6',
        linen: '#f4efe7',
        oat: '#e8ded0',
        ink: '#2f342f',
        sage: '#8da089',
        clay: '#c58f76',
        skysoft: '#dce9ee',
        butter: '#f4d98d',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(47, 52, 47, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
