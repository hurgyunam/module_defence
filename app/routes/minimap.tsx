import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import * as PIXI from "pixi.js";
// 전제조건: import * as PixiViewport from "pixi-viewport"; 사용
import * as PixiViewport from "pixi-viewport";

// --- 상수 설정 ---
// 원하는 뷰포트 크기 (16:9 비율 유지)
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
// 실제 게임 맵 크기
const MAP_WIDTH = 5000;
const MAP_HEIGHT = 5000;

// 미니맵 설정
const MINIMAP_SIZE = 200; // 미니맵의 가로/세로 크기 (정사각형)
const MINIMAP_MARGIN = 20; // 좌하단 여백

// --- 타입 정의 ---
type ViewportType = PixiViewport.Viewport | null;

/**
 * 캔버스의 크기를 반응형으로 조정하는 로직
 * @param containerWidth 현재 브라우저 창 너비
 * @param containerHeight 현재 브라우저 창 높이
 * @returns {width, height} 조정된 캔버스 크기
 */
const getCanvasSize = (containerWidth: number, containerHeight: number) => {
  const targetRatio = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
  const containerRatio = containerWidth / containerHeight;

  let width: number;
  let height: number;

  if (containerRatio > targetRatio) {
    // 컨테이너가 더 가로로 길 때 (세로에 맞춤)
    height = containerHeight;
    width = height * targetRatio;
  } else {
    // 컨테이너가 더 세로로 길거나 같을 때 (가로에 맞춤)
    width = containerWidth;
    height = width / targetRatio;
  }

  // 소수점 제거 및 정수로 반환
  return { width: Math.floor(width), height: Math.floor(height) };
};

// -----------------------------------------------------------------------------

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const viewportRef = useRef<ViewportType>(null);
  const minimapViewportRef = useRef<ViewportType>(null);

  // 현재 브라우저 창 크기를 추적하는 상태
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  // 윈도우 크기 변경 시 상태 업데이트
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // 초기 렌더링 및 윈도우 resize 이벤트 리스너 등록/해제
  useLayoutEffect(() => {
    handleResize(); // 컴포넌트 마운트 시 초기 크기 설정
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // 캔버스 크기가 변경될 때 Pixi Application의 View 크기를 업데이트
  useEffect(() => {
    if (pixiAppRef.current && windowSize.width > 0) {
      const { width, height } = getCanvasSize(
        windowSize.width,
        windowSize.height
      );

      // Pixi Application View 크기 조정
      pixiAppRef.current.renderer.resize(width, height);

      // Viewport 크기 조정
      if (viewportRef.current) {
        viewportRef.current.resize(width, height);
      }
    }
  }, [windowSize]);

  // Pixi.js와 Viewport 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. 초기 캔버스 크기 계산
    const { width: initialCanvasWidth, height: initialCanvasHeight } =
      getCanvasSize(window.innerWidth, window.innerHeight);

    // 2. Pixi Application 초기화
    const app = new PIXI.Application({
      view: canvas, // ref를 통해 가져온 canvas 전달
      width: initialCanvasWidth,
      height: initialCanvasHeight,
      backgroundColor: 0x1a1a1a, // 어두운 배경
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    pixiAppRef.current = app;

    // 3. Viewport (메인 뷰) 초기화
    const viewport = new PixiViewport.Viewport({
      screenWidth: initialCanvasWidth,
      screenHeight: initialCanvasHeight,
      worldWidth: MAP_WIDTH,
      worldHeight: MAP_HEIGHT,
      events: app.renderer.events,
    });

    app.stage.addChild(viewport);
    viewportRef.current = viewport;

    // 4. Viewport 설정: 게임 맵 스크롤, 줌 활성화
    viewport
      .drag() // 드래그로 스크롤
      .wheel({ smooth: 10, percent: 0.1 }) // 휠로 줌
      .decelerate() // 드래그 후 감속
      .clamp({ direction: "all" }); // 경계 제한

    // **************** 중요 수정 부분 ****************
    // 뷰포트가 월드 전체를 보여주는 스케일이 아닌,
    // 원하는 1920x1080 영역만 보여주도록 스케일을 1.0으로 고정합니다.
    // (true는 애니메이션 없이 즉시 적용을 의미)
    viewport.moveCorner(0, 0);

    // 맵의 중앙으로 이동합니다.
    viewport.moveCenter(MAP_WIDTH / 2, MAP_HEIGHT / 2);
    // **********************************************

    // --- 초기 스케일 확인 (여기에 추가하세요) ---
    console.log("--- Viewport 초기화 정보 ---");
    console.log(`Viewport Scale X: ${viewport.scale.x}`); // 여기서 확인
    console.log(`Viewport Position X: ${viewport.x}`); // 위치도 함께 확인
    console.log(
      `Viewport World Width (Visible): ${initialCanvasWidth / viewport.scale.x}`
    ); // 캔버스 크기(W) / 스케일(1.0) = W 가 나와야 함
    console.log("----------------------------");
    // ---------------------------------------------

    // 5. 게임 맵 컨텐츠 생성 (테스트 Graphics)
    const mapGraphics = new PIXI.Graphics();
    mapGraphics.beginFill(0x2d3a4b); // 맵 배경색
    mapGraphics.drawRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    mapGraphics.endFill();

    // 테스트 샘플 1: 중앙 큰 사각형
    mapGraphics.beginFill(0x9a50a1);
    mapGraphics.drawRect(MAP_WIDTH / 2 - 500, MAP_HEIGHT / 2 - 500, 1000, 1000);
    mapGraphics.endFill();

    // 테스트 샘플 2: 모서리 원 4개
    const testPoints = [
      [200, 200],
      [MAP_WIDTH - 200, 200],
      [200, MAP_HEIGHT - 200],
      [MAP_WIDTH - 200, MAP_HEIGHT - 200],
    ];
    testPoints.forEach(([x, y]) => {
      if (x && y) {
        mapGraphics.beginFill(0x6aa84f);
        mapGraphics.drawCircle(x, y, 150);
        mapGraphics.endFill();
      }
    });

    viewport.addChild(mapGraphics);

    // 6. 미니맵 초기화
    // 미니맵 캔버스는 메인 캔버스 위에 CSS로 오버레이합니다.
    const minimapCanvas = document.createElement("canvas");
    const minimapApp = new PIXI.Application({
      view: minimapCanvas,
      width: MINIMAP_SIZE,
      height: MINIMAP_SIZE,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // 미니맵 뷰포트 설정
    const minimapViewport = new PixiViewport.Viewport({
      screenWidth: MINIMAP_SIZE,
      screenHeight: MINIMAP_SIZE,
      worldWidth: MAP_WIDTH,
      worldHeight: MAP_HEIGHT,
      events: minimapApp.renderer.events,
    });

    minimapApp.stage.addChild(minimapViewport);
    minimapViewportRef.current = minimapViewport;

    // 미니맵에는 메인 맵 컨텐츠를 복사하여 추가
    const minimapContent = mapGraphics.clone();
    minimapViewport.addChild(minimapContent);

    // 맵 전체가 미니맵에 보이도록 스케일 조정 (fitWorld)
    minimapViewport.fitWorld(true);
    minimapViewport.moveCenter(MAP_WIDTH / 2, MAP_HEIGHT / 2);
    minimapViewport.interactive = false; // 미니맵 자체 스크롤 방지 (옵션)

    // 미니맵에 현재 메인 뷰포트 영역을 표시하는 사각형 추가
    const viewportRect = new PIXI.Graphics();
    minimapViewport.addChild(viewportRect);

    // 7. 메인 뷰포트 이동 시 미니맵 업데이트를 위한 Ticker 설정
    app.ticker.add(() => {
      if (viewportRef.current && minimapViewportRef.current) {
        const viewport = viewportRef.current;

        // 1. **수정된 경계 계산: getBounds() 대신 viewport 속성 사용**

        // 월드 좌표계에서 현재 보이는 영역의 좌상단 (x, y) 계산
        // formula: -viewport.x / viewport.scale.x
        const worldX = -viewport.x / viewport.scale.x;
        const worldY = -viewport.y / viewport.scale.y;

        // 월드 좌표계에서 현재 보이는 영역의 너비/높이 계산
        // (scale이 1.0이므로 사실상 viewport.screenWidth/Height와 같습니다.)
        const visibleWorldWidth = viewport.screenWidth / viewport.scale.x;
        const visibleWorldHeight = viewport.screenHeight / viewport.scale.y;

        // 2. 미니맵에 표시할 사각형 업데이트
        viewportRect.clear();

        // 맵 비율에 맞춰 계산된 월드 좌표 기준 선 두께 (50) 사용
        viewportRect.lineStyle(50, 0xff0000, 1);

        // 미니맵에 계산된 월드 좌표를 사용하여 박스를 그립니다.
        // 미니맵 뷰포트가 전체 월드를 축소하여 보여주므로, 박스도 정확한 위치에 그려집니다.
        viewportRect.drawRect(
          worldX,
          worldY,
          visibleWorldWidth,
          visibleWorldHeight
        );
      }
    });

    // 8. 미니맵 DOM 엘리먼트를 메인 컨테이너에 추가 (CSS로 위치 지정)
    const container = canvas.parentElement;
    if (container) {
      minimapCanvas.style.position = "absolute";
      minimapCanvas.style.bottom = `${MINIMAP_MARGIN}px`;
      minimapCanvas.style.left = `${MINIMAP_MARGIN}px`;
      minimapCanvas.style.border = "2px solid #fff";
      minimapCanvas.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
      minimapCanvas.style.zIndex = "10"; // 캔버스 위에 표시
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
  }, []); // 마운트 시 한 번만 실행

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
        position: "relative", // 미니맵 absolute 위치 지정을 위한 컨테이너
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: windowSize.width > 0 ? "block" : "none", // 초기 로딩 시 깜빡임 방지
          width: canvasWidth,
          height: canvasHeight,
          border: "2px solid #ffffff",
        }}
      />
      {/* 미니맵 캔버스는 useEffect에서 동적으로 생성하여 여기에 포함되지 않습니다. */}
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
        **테스트:** 마우스 드래그로 맵 이동, 휠로 줌/아웃
      </div>
    </div>
  );
}
