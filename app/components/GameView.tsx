// app/routes/game.tsx
import { useEffect, useRef, useState } from "react";
import GameController from "src/rendering/GameController";
import { testMapSpec } from "src/rendering/MapUnitTypes";

const CANVAS_WIDTH_VW = 80; // 뷰포트 상대 width
const CANVAS_HEIGHT_VH = 80; // 뷰포트 상대 height
const MINIMAP_SIZE = 200;
const MINIMAP_MARGIN = 20;

export default function GameView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const gameRef = useRef<GameController | null>(null);

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

    gameRef.current = new GameController(
      canvas,
      minimapCanvas,
      testMapSpec,
      MINIMAP_SIZE,
      MINIMAP_SIZE
    );

    // 리사이즈 이벤트 처리
    const onResize = () => {
      if (gameRef.current) {
        // Pixi Application 리사이즈
        gameRef.current.resize();
      }
    };

    window.addEventListener("resize", onResize);

    // 클린업
    return () => {
      window.removeEventListener("resize", onResize);
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [canvasRef]);

  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []); // 의존성 없음 → 언마운트 시에만 실행

  return (
    <div style={{ position: "relative" }}>
      {!gameRef && (
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
