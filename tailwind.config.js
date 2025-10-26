/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Сканируем все Vue и JS/TS файлы в папке src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
