// tailwind.config.js (확인 및 수정)
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 이 경로가 정확해야 Tailwind가 app 디렉토리의 .tsx 파일을 스캔합니다.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
