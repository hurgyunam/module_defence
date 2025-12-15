// app/routes/game.tsx
import { useEffect, useRef, useState } from "react";
import PixiMainApp from "src/rendering/PixiMainApp";
import PixiMinimapApp from "src/rendering/PixiMinimapApp";
import { UnitRenderer } from "src/rendering/UnitRenderer";

const CANVAS_WIDTH_VW = 80; // 뷰포트 상대 width
const CANVAS_HEIGHT_VH = 80; // 뷰포트 상대 height
const MAP_COL_COUNT = 100;
const MAP_ROW_COUNT = 100;
const CANVAS_WIDTH_RATIO = 1920;
const CANVAS_HEIGHT_RATIO = 1080;
const MINIMAP_SIZE = 200;
const MINIMAP_MARGIN = 20;

const TILE_SIZE = 100; // 각 타일/유닛의 크기 (픽셀)

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<PixiMainApp | null>(null);
  const drone = useRef<UnitRenderer | null>(null);

  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapAppRef = useRef<PixiMinimapApp | null>(null);

  const initializeMap = (game: PixiMainApp): void => {
    // 1. 기본 타일 채우기 (예: 빈 땅)
    for (let y = 0; y < MAP_ROW_COUNT; y++) {
      for (let x = 0; x < MAP_COL_COUNT; x++) {
        // 일반적인 빈 땅 타일 배치
        game.addUnit("tile-plain", x, y, TILE_SIZE);
      }
    }

    // 2. 특수 유닛 배치 예시
    // 산 배치
    game.addUnit("tile-mountain", 5, 5, TILE_SIZE);
    game.addUnit("tile-mountain", 6, 5, TILE_SIZE);

    // 자원 배치
    game.addUnit("resource-A", 2, 8, TILE_SIZE);
    game.addUnit("resource-B", 12, 1, TILE_SIZE);

    // 구조물 배치
    game.addUnit("structure-combiner-5", 1, 1, TILE_SIZE);
    game.addUnit("defense-tower-10", 13, 8, TILE_SIZE);

    // 적 유닛 (레벨 10) 배치
    const enemy = game.addUnit("enemy-10", 10, 3, TILE_SIZE);

    // 아군 유닛 (드론) 배치 및 움직임 설정
    drone.current = game.addUnit("unit-drone", 1, 8, TILE_SIZE);
    setupDroneMovement(game, drone.current, 1, 10, 8);
  };

  const setupDroneMovement = (
    game: PixiMainApp,
    drone: UnitRenderer,
    startX: number,
    endX: number,
    mapY: number
  ) => {
    let direction = 1; // 1: 오른쪽, -1: 왼쪽
    drone.setMapPosition(startX, mapY);

    game.addTicker((delta) => {
      let currentTileX = drone.getTileX();

      if (currentTileX >= endX) direction = -1;
      else if (currentTileX <= startX) direction = 1;

      drone.setTileX(currentTileX + (direction * 1.5 * delta) / 100);
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!minimapCanvasRef.current) return;

    const canvas = canvasRef.current;
    const minimapCanvas = minimapCanvasRef.current;

    // 캔버스 크기 계산 함수
    const calculateCanvasSize = () => {
      const width = window.innerWidth * (CANVAS_WIDTH_VW / 100);
      const height = window.innerHeight * (CANVAS_HEIGHT_VH / 100);

      canvas.width = width;
      canvas.height = height;

      return { width, height };
    };

    // 초기 사이즈 계산
    calculateCanvasSize();

    const worldWidth = MAP_COL_COUNT * TILE_SIZE;
    const worldHeight = MAP_ROW_COUNT * TILE_SIZE;

    const game = new PixiMainApp(
      canvas,
      CANVAS_WIDTH_RATIO,
      CANVAS_HEIGHT_RATIO,
      worldWidth,
      worldHeight
    );

    setGame(game);

    const minimapApp = new PixiMinimapApp(
      minimapCanvas,
      MINIMAP_SIZE,
      MINIMAP_SIZE,
      worldWidth,
      worldHeight
    );

    minimapAppRef.current = minimapApp;

    game.addMinimapTicker(minimapApp);

    initializeMap(game);

    // 리사이즈 이벤트 처리
    const onResize = () => {
      if (game) {
        // Pixi Application 리사이즈
        game.resize();
      }
    };

    window.addEventListener("resize", onResize);

    // 클린업
    return () => {
      window.removeEventListener("resize", onResize);
      if (game) {
        game.destroy();
      }
    };
  }, [canvasRef]);

  useEffect(() => {
    return () => {
      if (game) {
        game.destroy();
      }
    };
  }, []); // 의존성 없음 → 언마운트 시에만 실행

  return (
    <div style={{ position: "relative" }}>
      {!game && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          게임 맵을 로딩 중입니다...
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: `${CANVAS_WIDTH_VW}vw`,
          height: `${CANVAS_HEIGHT_VH}vh`,
          display: "block",
        }}
      />
      <canvas
        ref={minimapCanvasRef}
        style={{
          position: "absolute",
          bottom: `${MINIMAP_MARGIN}px`,
          left: `${MINIMAP_MARGIN}px`,
          border: "2px solid #fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          zIndex: "10",
        }}
      />
    </div>
  );
}
