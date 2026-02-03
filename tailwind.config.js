/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Base dark colors - Midnight Aurora 2.0
        deep: '#050508',
        surface: '#0a0a10',

        // Aurora accent colors
        'aurora-neon': '#00FFC2',
        'aurora-purple': '#9D50BB',

        // Primary gradient colors
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        accent: {
          purple: '#a855f7',
          pink: '#ec4899',
        },

        // Status colors
        success: '#22c55e',
        warning: '#f59e0b',
        critical: '#FF4B2B',
        info: '#3b82f6',

        // Glass effect colors - updated for Midnight Aurora
        glass: {
          bg: 'rgba(20, 20, 30, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.15)',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-soft': '0 0 20px rgba(0, 255, 194, 0.15)',
        'glow-aurora': '0 0 30px rgba(0, 255, 194, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #00FFC2 0%, #9D50BB 100%)',
      },
      transitionTimingFunction: {
        'aurora': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}