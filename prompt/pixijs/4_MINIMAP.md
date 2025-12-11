프로젝트 스펙
- Remix, Typescript
- pixi.js 버전: 7
- pixi-viewport 버전: 6

전제조건
- pixi-viewport를 일반적인 방식으로 import시 에러가 발생. import * as PixiViewport from "pixi-viewport";를 사용.
- canvas는 Remix 컴포넌트 ref로 부터 가져와 pixi Application 생성시 전달

구현사항
- 원하는 canvas 크기 비율: 1920*1080
- 차라리 여백을 남기더라도 브라우저안에 canvas가 다 담기게 크기 조정
- 원하는 게임맵의 크기: 5000*5000
- 뷰포트는 게임맵의 192*108만 나타나길 원함
- 뷰포트 스크롤링 테스트가 가능하게 테스트 Graphics 몇개 샘플
- 해당 구현사항들을 하나의 페이지 컴포넌트에 구현
- 좌하단에 게임맵 전체를 볼 수 있는 미니맵
