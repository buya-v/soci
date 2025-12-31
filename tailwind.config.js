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
        deep: '#050508',
        neon: '#00FFC2',
        purpleAccent: '#9D50BB',
        critical: '#FF4B2B',
        glass: {
          bg: 'rgba(20, 20, 30, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      boxShadow: {
        'glow-soft': '0 0 20px rgba(0, 255, 194, 0.15)',
        'glow-strong': '0 0 30px rgba(0, 255, 194, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}