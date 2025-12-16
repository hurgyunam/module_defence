import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import * as PIXI from "pixi.js";
import * as PixiViewport from "pixi-viewport";

// --- 상수 설정 ---
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const MAP_WIDTH = 5000;
const MAP_HEIGHT = 5000;
const MINIMAP_SIZE = 200;
const MINIMAP_MARGIN = 20;

// --- 타입 정의 ---
type ViewportType = PixiViewport.Viewport | null;

/**
 * 캔버스의 크기를 반응형으로 조정하는 로직
 */
const getCanvasSize = (containerWidth: number, containerHeight: number) => {
  const targetRatio = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
  const containerRatio = containerWidth / containerHeight;

  let width: number;
  let height: number;

  if (containerRatio > targetRatio) {
    height = containerHeight;
    width = height * targetRatio;
  } else {
    width = containerWidth;
    height = width / targetRatio;
  }

  return { width: Math.floor(width), height: Math.floor(height) };
};

// -----------------------------------------------------------------------------

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const viewportRef = useRef<ViewportType>(null);

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // 캔버스 크기 변경 시 Viewport 리사이즈 및 스케일 재설정
  useEffect(() => {
    if (pixiAppRef.current && viewportRef.current && windowSize.width > 0) {
      const { width, height } = getCanvasSize(
        windowSize.width,
        windowSize.height
      );

      pixiAppRef.current.renderer.resize(width, height);
      viewportRef.current.resize(width, height);
      viewportRef.current.setZoom(1.0, true);
    }
  }, [windowSize]);

  // Pixi.js와 Viewport 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width: initialCanvasWidth, height: initialCanvasHeight } =
      getCanvasSize(window.innerWidth, window.innerHeight);

    // 2. Pixi Application 초기화
    const app = new PIXI.Application({
      view: canvas,
      width: initialCanvasWidth,
      height: initialCanvasHeight,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    pixiAppRef.current = app;

    // 3. Viewport (메인 뷰) 초기화
    const viewport = new PixiViewport.Viewport({
      screenWidth: VIEWPORT_WIDTH,
      screenHeight: VIEWPORT_HEIGHT,
      worldWidth: MAP_WIDTH,
      worldHeight: MAP_HEIGHT,
      events: app.renderer.events,
    });

    app.stage.addChild(viewport);
    viewportRef.current = viewport;

    // 4. Viewport 설정
    viewport
      .drag()
      .wheel({ smooth: 10, percent: 0.1 })
      .decelerate()
      .clamp({ direction: "all" });

    // **************** 핵심 설정: 스케일 1.0 고정 ****************
    viewport.setZoom(1.0, true);
    viewport.moveCenter(MAP_WIDTH / 2, MAP_HEIGHT / 2);
    // **********************************************************

    // 5. 마스터 월드 컨테이너 및 맵 컨텐츠 생성(메인용)
    const worldContainer = new PIXI.Container();
    worldContainer.width = MAP_WIDTH;
    worldContainer.height = MAP_HEIGHT;
    viewport.addChild(worldContainer); // 메인 뷰포트에 마스터 컨테이너 추가

    // 맵 배경 Graphics (가장 아래 깔림)
    const mapBackground = new PIXI.Graphics();
    mapBackground.beginFill(0x2d3a4b);
    mapBackground.drawRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    mapBackground.endFill();
    worldContainer.addChild(mapBackground);

    // 유닛 및 테스트 Graphics를 담을 컨테이너 (배경 위에 깔림)
    const mainObjectsContainer = new PIXI.Container();
    worldContainer.addChild(mainObjectsContainer); // 유닛은 마스터 컨테이너의 자식!

    // --- 메인 유닛 (디테일) ---
    // 중앙 큰 사각형 (메인용 - 보라색)
    const centerRect = new PIXI.Graphics();
    centerRect.beginFill(0x9a50a1);
    centerRect.drawRect(0, 0, 1000, 1000);
    centerRect.endFill();

    // **핵심 수정 A: 피벗을 중앙(500, 500)으로 설정**
    centerRect.pivot.set(500, 500);

    centerRect.position.set(MAP_WIDTH / 2 - 500, MAP_HEIGHT / 2 - 500);
    mainObjectsContainer.addChild(centerRect);

    // --- 테스트 샘플 2: 모서리 원 4개 (원본 유닛들) ---
    const circles: PIXI.Graphics[] = []; // Ticker 동기화를 위해 배열에 저장
    const testPoints = [
      [200, 200],
      [MAP_WIDTH - 200, 200],
      [200, MAP_HEIGHT - 200],
      [MAP_WIDTH - 200, MAP_HEIGHT - 200],
    ];

    testPoints.forEach(([x, y]) => {
      if (x && y) {
        const circle = new PIXI.Graphics();
        circle.beginFill(0x6aa84f);
        circle.drawCircle(0, 0, 150); // 디테일한 원
        circle.endFill();
        circle.position.set(x, y);
        mainObjectsContainer.addChild(circle);
        circles.push(circle);
      }
    });

    // 6. 미니맵 초기화
    const minimapCanvas = document.createElement("canvas");
    const minimapApp = new PIXI.Application({
      view: minimapCanvas,
      width: MINIMAP_SIZE,
      height: MINIMAP_SIZE,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const minimapViewport = new PixiViewport.Viewport({
      screenWidth: MINIMAP_SIZE,
      screenHeight: MINIMAP_SIZE,
      worldWidth: MAP_WIDTH,
      worldHeight: MAP_HEIGHT,
      events: minimapApp.renderer.events,
    });

    minimapApp.stage.addChild(minimapViewport);

    // 미니맵 배경
    const minimapBackground = new PIXI.Graphics();
    minimapBackground.beginFill(0x2d3a4b);
    minimapBackground.drawRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    minimapBackground.endFill();
    minimapViewport.addChild(minimapBackground);

    // **핵심: 미니맵용 유닛 컨테이너와 객체 수동 복제**
    const minimapObjectsContainer = new PIXI.Container();
    minimapViewport.addChild(minimapObjectsContainer);

    // --- 미니맵 유닛 (색상 블록 - 수동 생성) ---

    // 1. 중앙 사각형 (미니맵용 - 빨간색 블록으로 요약)
    const minimapCenterRect = new PIXI.Graphics();
    minimapCenterRect.beginFill(0xff0000); // 요약 색상 (빨강)
    minimapCenterRect.drawRect(0, 0, 1000, 1000); // 크기는 유지
    minimapCenterRect.endFill();

    // **핵심 수정 C: 피벗을 중앙(500, 500)으로 설정**
    minimapCenterRect.pivot.set(500, 500);
    minimapCenterRect.position.copyFrom(centerRect.position); // 초기 위치 동기화
    minimapObjectsContainer.addChild(minimapCenterRect);

    // 2. 모서리 원 4개 (미니맵용 - 파란색 블록으로 요약)
    const minimapCircles: PIXI.Graphics[] = [];
    circles.forEach((originalCircle) => {
      const minimapCircle = new PIXI.Graphics();
      minimapCircle.beginFill(0x4a86e8); // 요약 색상 (파랑)
      minimapCircle.drawRect(0, 0, 300, 300); // 단순 사각형 블록으로 크기 축소/변경 가능
      minimapCircle.endFill();
      minimapCircle.pivot.set(150, 150);

      minimapCircle.position.copyFrom(originalCircle.position); // 초기 위치 동기화
      minimapObjectsContainer.addChild(minimapCircle);
      minimapCircles.push(minimapCircle);
    });

    minimapViewport.fitWorld(true);
    minimapViewport.moveCenter(MAP_WIDTH / 2, MAP_HEIGHT / 2);
    minimapViewport.interactive = false;

    // 미니맵에 현재 메인 뷰포트 영역을 표시하는 사각형 추가
    const viewportRect = new PIXI.Graphics();
    minimapViewport.addChild(viewportRect);

    // *******************************************************************
    // 7. 메인 뷰포트 이동 및 유닛 업데이트를 위한 Ticker 설정
    // *******************************************************************
    let movementDirection = 1;
    const MOVEMENT_SPEED = 2;

    app.ticker.add((delta) => {
      // --- 유닛 이동 로직 (게임 로직) ---
      centerRect.x += MOVEMENT_SPEED * movementDirection * delta;

      const minX = MAP_WIDTH / 2 - 1000;
      const maxX = MAP_WIDTH / 2 - 500;

      if (centerRect.x > maxX) {
        movementDirection = -1;
      } else if (centerRect.x < minX) {
        movementDirection = 1;
      }

      // 1. 중앙 사각형 동기화 (메인 유닛의 위치 -> 미니맵 유닛의 위치)
      minimapCenterRect.position.copyFrom(centerRect.position);

      // 2. 모서리 원 4개 동기화 (원래 안 움직이지만, 위치 복사)
      minimapCircles.forEach((minimapCircle, index) => {
        minimapCircle.position.copyFrom(circles[index].position);
      });

      // ---------------------------------

      // --- 미니맵 빨간 박스 업데이트 로직 ---
      if (viewportRef.current) {
        const viewport = viewportRef.current;

        const worldX = -viewport.x / viewport.scale.x;
        const worldY = -viewport.y / viewport.scale.y;
        const visibleWorldWidth = viewport.screenWidth / viewport.scale.x;
        const visibleWorldHeight = viewport.screenHeight / viewport.scale.y;

        viewportRect.clear();
        viewportRect.lineStyle(50, 0xff0000, 1);
        viewportRect.drawRect(
          worldX,
          worldY,
          visibleWorldWidth,
          visibleWorldHeight
        );
      }
    });

    // 8. 미니맵 DOM 엘리먼트를 메인 컨테이너에 추가 (CSS)
    const container = canvas.parentElement;
    if (container) {
      minimapCanvas.style.position = "absolute";
      minimapCanvas.style.bottom = `${MINIMAP_MARGIN}px`;
      minimapCanvas.style.left = `${MINIMAP_MARGIN}px`;
      minimapCanvas.style.border = "2px solid #fff";
      minimapCanvas.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
      minimapCanvas.style.zIndex = "10";
      container.appendChild(minimapCanvas);
    }

    // 클린업 함수
    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      minimapApp.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      });
      if (container && container.contains(minimapCanvas)) {
        container.removeChild(minimapCanvas);
      }
    };
  }, []);

  // -----------------------------------------------------------------------------

  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
    windowSize.width,
    windowSize.height
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: windowSize.width > 0 ? "block" : "none",
          width: canvasWidth,
          height: canvasHeight,
          border: "2px solid #ffffff",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 10,
        }}
      >
        **게임 맵 크기:** {MAP_WIDTH}x{MAP_HEIGHT}
        <br />
        **캔버스 크기 (반응형):** {canvasWidth}x{canvasHeight}
        <br />
        **테스트:** 드래그로 맵 이동, 휠로 줌/아웃, 보라색 네모 자동 이동
      </div>
    </div>
  );
}
