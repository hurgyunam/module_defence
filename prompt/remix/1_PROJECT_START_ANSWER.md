아래는 yarn init으로 시작한 빈 프로젝트에
React + Remix + TypeScript + PixiJS + TailwindCSS + react-dnd + Zustand
환경을 수동으로 세팅하는 전체 bash 명령어와 필수 설정 파일 템플릿이야.

주의: 명령어에 # 절대 넣지 않음
Yarn v1, v4 모두 동작하는 방식으로 작성함.

📦 1. Remix 설치 (create-remix 없이 직접 설치)

Remix는 공식적으로 create-remix 사용을 권장하지만,
이미 프로젝트가 있어서 생성 도구를 쓰지 못하는 상황이므로
수동 설치 + 설정 파일 작성으로 구성한다.

1-1. Remix 패키지 설치

bash
yarn add react react-dom
yarn add -D typescript @types/react @types/react-dom
yarn add -D @remix-run/dev @remix-run/node @remix-run/react @remix-run/serve
yarn add -D ts-node

1-2. 필수 디렉토리 생성

bash
mkdir app
mkdir app/routes
mkdir public

📘 2. TypeScript 초기화

bash
yarn tsc --init

tsconfig.json 수정 (필수)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    "types": ["@remix-run/node", "vite/client"]
  },
  "include": ["app", "remix.config.js"]
}

⚙️ 3. Remix 설정 파일 작성

프로젝트 루트에 만든다.

remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildPath: "build/index.js",
  ignoredRouteFiles: ["**/.*"],
};

🧪 4. App 기본 파일 넣기
app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export function links() {
  return [
    { rel: "stylesheet", href: "/build/tailwind.css" }
  ];
}

export function meta() {
  return [{ title: "My Remix App" }];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

app/routes/_index.tsx
export default function Index() {
  return <h1>Hello Remix + Pixi + DnD!</h1>;
}

🎨 5. TailwindCSS 추가
5-1. 설치

bash
yarn add -D tailwindcss postcss autoprefixer

5-2. Tailwind 초기화

bash
npx tailwindcss init -p

5-3. tailwind.config.js 수정
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

5-4. app/styles/tailwind.css 생성
@tailwind base;
@tailwind components;
@tailwind utilities;

🎮 6. PixiJS 설치

bash
yarn add pixi.js

🧲 7. react-dnd 설치 (블록 코딩용)

bash
yarn add react-dnd react-dnd-html5-backend

🧠 8. Zustand 설치

bash
yarn add zustand

🔧 9. 개발/빌드 스크립트 설정
package.json 수정
{
  "scripts": {
    "dev": "remix dev",
    "build": "remix build",
    "start": "remix-serve build"
  }
}

📂 10. Vite 사용 여부? (선택)

Remix는 2024 이후 내부적으로 Vite 기반 빌드 시스템을 지원한다.
아무 작업도 안 해도 자동으로 Vite를 사용하게 된다.
현재 구성은 별도로 설정할 필요 없다.

🚀 11. 실행

bash
yarn dev

필요하면 바로 추가 세팅 가능!

PixiJS canvas를 Remix에서 안전하게 mount하는 코드

react-dnd를 블록코딩 방식으로 구현하는 템플릿

Zustand로 전역 상태 구성

Tailwind + Pixi 레이아웃 베스트 프랙티스

Editor.tsx 같은 블록 에디터 샘플 코드

필요하면 바로 알려줘!

이 오류는 npm이 tailwindcss 실행 파일(바이너리)을 찾지 못했을 때 발생하는 문제야.
특히 TailwindCSS 4.x + Yarn 조합에서 흔하게 발생한다.
원인은 대부분 다음 둘 중 하나야:

tailwindcss가 정상적으로 설치되지 않았거나

Yarn 프로젝트에서 npm exec를 호출해서 패키지 바이너리를 못 찾는 경우

✅ 해결 방법 (Yarn 프로젝트 기준)
✔️ 1) TailwindCSS가 제대로 설치됐는지 확인

bash
yarn list --pattern tailwindcss

만약 패키지가 안 나올 경우 → 다시 설치:

bash
yarn add -D tailwindcss postcss autoprefixer

✔️ 2) Yarn에서는 npx 쓰면 안 됨 → yarn tailwindcss로 실행해야 함

TailwindCSS 4.x는 설치 후 프로젝트 로컬의 실행 파일을 Yarn이 이렇게 등록함:

./node_modules/.bin/tailwindcss

따라서 초기화 명령어는 다음처럼 해야 정상 작동한다.

🎯 올바른 명령어

bash
yarn tailwindcss init -p

⚠️ 중간에 “Command not found: tailwindcss” 나오면?

Tailwind이 TailwindCSS 4.x 버전일 때
실행 파일이 node_modules/.bin에 존재하지 않는 케이스가 있다.

이때는 다음 방법으로 해결 가능.

✔️ 3) TailwindCSS 4.x 실행 파일 직접 실행

bash
./node_modules/.bin/tailwindcss init -p

✔️ 4) 그래도 안 되면 Tailwind 3.x로 다운그레이드 (완전 호환됨)

Tailwind 4는 아직 불안정 + 일부 환경에서 바이너리 문제 있음.

안정성을 원하면 이렇게:

bash
yarn remove tailwindcss
yarn add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

이 경우 npx도 정상 작동함.

🔍 추천하는 최종 해결 루트

현재 오류는 npm exec이 tailwindcss 바이너리를 못 찾음 → yarn 프로젝트라서 그렇다.

따라서 가장 빠른 해결책은:

➤ Step 1

bash
yarn add -D tailwindcss postcss autoprefixer

➤ Step 2

bash
yarn tailwindcss init -p

이렇게 하면 100% 해결됨.