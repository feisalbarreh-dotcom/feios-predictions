/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        secondary: '#0f172a',
        dark: '#0f172a',
      },
    },
  },
  plugins: [],
}
