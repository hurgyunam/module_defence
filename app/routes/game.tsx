// app/routes/game.tsx
import { useEffect, useRef, useState } from "react";
import GameMap from "@/map/main";

const CANVAS_WIDTH_VW = 80; // 뷰포트 상대 width
const CANVAS_HEIGHT_VH = 80; // 뷰포트 상대 height

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameMap, setGameMap] = useState<GameMap | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

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

    // GameMap 초기화
    GameMap.create(canvas).then(setGameMap).catch(console.error);

    // 리사이즈 이벤트 처리
    const onResize = () => {
      const { width, height } = calculateCanvasSize();
      if (gameMap) {
        // Pixi Application 리사이즈
        gameMap.resize(width, height);
      }
    };

    window.addEventListener("resize", onResize);

    // 클린업
    return () => {
      window.removeEventListener("resize", onResize);
      if (gameMap) {
        gameMap.destroy();
      }
    };
  }, [canvasRef]);

  useEffect(() => {
    return () => {
      if (gameMap) {
        gameMap.destroy();
      }
    };
  }, []); // 의존성 없음 → 언마운트 시에만 실행

  return (
    <div style={{ position: "relative" }}>
      {!gameMap && (
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
    </div>
  );
}
