import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbfb',
          100: '#d6f5f5',
          500: '#1596b2',
          600: '#0f7a92',
          700: '#0d6174',
        },
        accent: {
          400: '#2fd0b3',
          500: '#1fb89c',
        },
        ink: '#10374a',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(16, 55, 74, 0.12)',
      },
      backgroundImage: {
        'health-glow':
          'radial-gradient(circle at top, rgba(47, 208, 179, 0.18), transparent 36%), linear-gradient(180deg, #f3fcfd 0%, #edf8fb 100%)',
      },
      fontFamily: {
        body: ['var(--font-manrope)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

