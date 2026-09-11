/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050810',
          900: '#0a0e1a',
          800: '#0f1429',
          700: '#141a36',
          600: '#1a2244',
          500: '#222d55',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffe600',
          orange: '#ff8800',
          pink: '#ff4488',
        },
        accent: {
          DEFAULT: '#00f0ff',
          light: '#66f7ff',
          dark: '#00b8cc',
        },
        win: '#00ff88',
        lose: '#ff4444',
        draw: '#ffe600',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse2: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        neonPulse: {
          '0%,100%': { boxShadow: '0 0 5px var(--neon-color), 0 0 10px var(--neon-color), 0 0 20px var(--neon-color)' },
          '50%': { boxShadow: '0 0 10px var(--neon-color), 0 0 20px var(--neon-color), 0 0 40px var(--neon-color), 0 0 60px var(--neon-color)' },
        },
        neonTextPulse: {
          '0%,100%': { textShadow: '0 0 5px var(--neon-color), 0 0 10px var(--neon-color)' },
          '50%': { textShadow: '0 0 10px var(--neon-color), 0 0 20px var(--neon-color), 0 0 40px var(--neon-color)' },
        },
        borderGlow: {
          '0%,100%': { borderColor: 'rgba(0, 240, 255, 0.4)' },
          '50%': { borderColor: 'rgba(0, 240, 255, 0.9)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countDown: {
          '0%': { transform: 'scale(1.4)', opacity: '0' },
          '15%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 10px rgba(0,240,255,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0,240,255,0.8), 0 0 60px rgba(255,0,255,0.4)' },
        },
        signalBars: {
          '0%,100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        dotPulse: {
          '0%,100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        fadeUp: 'fadeUp 0.5s ease-out forwards',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        pulse2: 'pulse2 2s ease-in-out infinite',
        neonPulse: 'neonPulse 2s ease-in-out infinite',
        neonTextPulse: 'neonTextPulse 2s ease-in-out infinite',
        borderGlow: 'borderGlow 2s ease-in-out infinite',
        scanline: 'scanline 3s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        countDown: 'countDown 0.85s ease-in-out forwards',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        signalBars: 'signalBars 1.5s ease-in-out infinite',
        dotPulse: 'dotPulse 1.5s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
