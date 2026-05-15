/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        anime: ['Shojumaru', 'system-ui'],
        teko: ['Teko', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
