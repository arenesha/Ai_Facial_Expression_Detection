/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a26',
          600: '#22223a',
          500: '#2d2d4a',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        win: '#22c55e',
        lose: '#ef4444',
        draw: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse2: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        revealMove: {
          '0%': { transform: 'scale(0.3) rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotateY(0deg)', opacity: '1' },
        },
        countDown: {
          '0%': { transform: 'scale(1.4)', opacity: '0' },
          '15%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 10px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(99,102,241,0.8)' },
        },
      },
      animation: {
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        fadeUp: 'fadeUp 0.5s ease-out forwards',
        pulse2: 'pulse2 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        revealMove: 'revealMove 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        countDown: 'countDown 0.85s ease-in-out forwards',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
