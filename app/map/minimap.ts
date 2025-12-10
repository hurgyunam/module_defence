import { Viewport } from "pixi-viewport"; // 🚨 이 라이브러리가 설치되어야 합니다.
import { Application, Container, Graphics, Ticker } from "pixi.js";
import { WORLD_WIDTH } from "./main";

// (가정) Minimap.ts
export class Minimap {
  constructor(app: Application, viewport: Viewport) {
    // 1. 미니맵 크기 및 스케일 계산
    const MINIMAP_SIZE = 200; // 미니맵의 픽셀 크기
    const scale = MINIMAP_SIZE / WORLD_WIDTH; // 축소 비율

    // 2. 고정된 컨테이너 생성 및 Stage에 추가
    const container = new Container();
    container.x = 20; // 좌측 여백
    container.y = app.screen.height - MINIMAP_SIZE - 20; // 좌하단 고정
    app.stage.addChild(container);

    // 3. 축소된 맵 그리기 (예: 모든 타일을 축소된 사각형으로 그리기)
    // ... (mapGrid 순회 및 Graphics로 타일 그리기) ...

    // 4. 뷰포트 표시기 (Viewport Indicator)
    const viewportIndicator = new Graphics();
    container.addChild(viewportIndicator);

    // 5. Ticker에 뷰포트 업데이트 로직 추가
    app.ticker.add(() => {
      // 현재 뷰포트 위치와 크기를 미니맵 스케일에 맞게 계산하여 그리기
      viewportIndicator.clear();
      viewportIndicator.beginFill(0xffffff, 0.5); // 반투명 흰색
      viewportIndicator.drawRect(
        -viewport.x * scale,
        -viewport.y * scale,
        app.screen.width * viewport.scale.x * scale, // 줌 레벨 반영
        app.screen.height * viewport.scale.y * scale
      );
      viewportIndicator.endFill();
    });
  }
}
