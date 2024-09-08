/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // src 폴더의 모든 파일에서 Tailwind CSS를 적용
    './renderer/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [ require('daisyui'),],
};
