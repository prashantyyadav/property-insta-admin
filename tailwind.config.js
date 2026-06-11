/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4fd',
          100: '#d9e6fb',
          200: '#b6cef6',
          300: '#86adef',
          400: '#5b8be6',
          500: '#2e6fe0',
          600: '#1f56c4',
          700: '#1b4db1',
          800: '#173a86',
          900: '#16357a',
        },
        sidebar: {
          DEFAULT: '#0f1b2d',
          hover: '#1d2c44',
          active: '#0a1322',
        }
      }
    },
  },
  plugins: [],
}