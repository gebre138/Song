/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This is the CRITICAL part: it tells Tailwind to scan all your component files
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}