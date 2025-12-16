import { useRef, useEffect, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import * as PixiViewport from "pixi-viewport";

// ... (상수 정의는 이전과 동일)

const CANVAS_WIDTH_RATIO = 1920;
const CANVAS_HEIGHT_RATIO = 1080;
const GAME_MAP_SIZE = 5000;
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

interface MapComponentProps {
  // ...
}

export default function MapComponent(props: MapComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const viewportRef = useRef<PixiViewport.Viewport | null>(null);

  // 🚨 수정: window를 직접 참조하지 않고 초기값은 0으로 설정
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 1. 브라우저 크기에 맞춰 캔버스 크기를 조정하는 함수
  const resizeCanvas = useCallback((app: PIXI.Application) => {
    // 🚨 수정: window 객체가 클라이언트 환경에 있는지 확인 (혹시 모를 상황 대비)
    if (typeof window === "undefined") return;

    const { innerWidth: windowW, innerHeight: windowH } = window;

    // ... (이하 resize 로직은 이전과 동일)
    const ratio = CANVAS_WIDTH_RATIO / CANVAS_HEIGHT_RATIO;
    let newWidth = windowW;
    let newHeight = windowW / ratio;

    if (newHeight > windowH) {
      newHeight = windowH;
      newWidth = windowH * ratio;
    }

    app.renderer.resize(newWidth, newHeight);

    if (app.view.style) {
      app.view.style.width = `${newWidth}px`;
      app.view.style.height = `${newHeight}px`;
    }

    if (viewportRef.current) {
      viewportRef.current.screenWidth = newWidth;
      viewportRef.current.screenHeight = newHeight;
      viewportRef.current.resize(newWidth, newHeight);

      // 리사이즈 시 스케일 재조정 (캔버스에 1920x1080 맵 영역이 항상 꽉 차도록)
      const initialScaleX = newWidth / VIEWPORT_WIDTH;
      const initialScaleY = newHeight / VIEWPORT_HEIGHT;
      const newScale = Math.min(initialScaleX, initialScaleY);
      viewportRef.current.scale.set(newScale);
    }

    setWindowDimensions({ width: windowW, height: windowH });
  }, []); // resizeCanvas 의존성 배열은 비워둠 (상수만 참조)

  // 2. PixiJS 초기화 및 뷰포트 설정 (useEffect 내에서만 실행)
  useEffect(() => {
    // 🚨 1차 방어: window가 없으면 클라이언트 렌더링이 아니므로 중단
    if (typeof window === "undefined" || !canvasRef.current) return;

    // A. PIXI Application 초기화
    const app = new PIXI.Application({
      view: canvasRef.current,
      width: CANVAS_WIDTH_RATIO,
      height: CANVAS_HEIGHT_RATIO,
      backgroundColor: 0x1a1a1a,
      // window.devicePixelRatio는 여기서 안전하게 사용 가능
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    pixiAppRef.current = app;

    // B. pixi-viewport 초기화 및 설정
    const viewport = new PixiViewport.Viewport({
      screenWidth: app.renderer.width,
      screenHeight: app.renderer.height,
      worldWidth: GAME_MAP_SIZE,
      worldHeight: GAME_MAP_SIZE,
      events: app.renderer.events,
    });

    viewportRef.current = viewport;
    app.stage.addChild(viewport);

    viewport.drag().pinch().wheel().decelerate().clamp({ direction: "all" });

    // C. 초기 크기 및 스케일 설정은 resizeCanvas에 위임
    const handleResize = () => {
      if (pixiAppRef.current) {
        resizeCanvas(pixiAppRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // 🚨 컴포넌트 마운트 시 초기 크기 및 뷰포트 스케일 설정

    // D. 테스트용 Graphics 그리기
    drawMapFeatures(viewport);
    // E. 맵 중앙으로 초기 이동 (resize 후 호출해야 정확)
    viewport.moveCenter(GAME_MAP_SIZE / 2, GAME_MAP_SIZE / 2);

    // F. 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("resize", handleResize);
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    };
  }, [resizeCanvas]); // resizeCanvas 함수는 useCallback으로 감싸져 있으므로 안전

  // 3. 테스트용 Graphics 생성 함수 (이전과 동일)
  const drawMapFeatures = (viewport: PixiViewport.Viewport) => {
    const mapBorder = new PIXI.Graphics();
    mapBorder
      .lineStyle(50, 0xff0000, 1)
      .drawRect(0, 0, GAME_MAP_SIZE, GAME_MAP_SIZE);
    viewport.addChild(mapBorder);

    const center = new PIXI.Graphics();
    center
      .beginFill(0x00ff00)
      .drawCircle(GAME_MAP_SIZE / 2, GAME_MAP_SIZE / 2, 100)
      .endFill();
    viewport.addChild(center);

    const cornerSize = 400;
    const drawCorner = (x: number, y: number, color: number) => {
      const corner = new PIXI.Graphics();
      corner.beginFill(color).drawRect(x, y, cornerSize, cornerSize).endFill();
      viewport.addChild(corner);
    };

    drawCorner(100, 100, 0x0000ff);
    drawCorner(GAME_MAP_SIZE - cornerSize - 100, 100, 0xffff00);
    drawCorner(100, GAME_MAP_SIZE - cornerSize - 100, 0x00ffff);
    drawCorner(
      GAME_MAP_SIZE - cornerSize - 100,
      GAME_MAP_SIZE - cornerSize - 100,
      0xff00ff
    );
  };

  // 4. 렌더링
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {/* 윈도우 크기는 초기값 0이 아닌 마운트 후 값을 표시하도록 안전하게 처리 */}
      {windowDimensions.width > 0 && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            color: "#fff",
            fontSize: "12px",
            zIndex: 10,
          }}
        >
          <div>
            Window: {windowDimensions.width}x{windowDimensions.height}
          </div>
          <div>
            Canvas: {pixiAppRef.current?.renderer.width.toFixed(0) || "N/A"}x
            {pixiAppRef.current?.renderer.height.toFixed(0) || "N/A"}
          </div>
          <div>
            Map Size: {GAME_MAP_SIZE}x{GAME_MAP_SIZE}
          </div>
          <div>
            View Scale: {viewportRef.current?.scale.x.toFixed(3) || "N/A"}
          </div>
        </div>
      )}
    </div>
  );
}
