/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        deep: {
          950: '#020818',
          900: '#050e1f',
          800: '#0a1628',
          700: '#0f1f38',
          600: '#162947',
        },
      },
      animation: {
        'breath-in': 'breathIn 5.5s ease-in-out',
        'breath-out': 'breathOut 5.5s ease-in-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
