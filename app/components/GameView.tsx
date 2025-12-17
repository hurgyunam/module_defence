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
    let isCancelled = false;

    const initGame = async () => {
      if (!canvasRef.current || !minimapCanvasRef.current) return;

      // 이전 인스턴스가 아직 파괴 중일 수 있으므로 확실히 비워줌
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }

      // 잠시 대기 (브라우저가 GPU 리소스를 정리할 시간을 줌 - 0ms여도 효과 있음)
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (isCancelled) return;

      gameRef.current = new GameController(
        canvasRef.current,
        minimapCanvasRef.current,
        testMapSpec,
        MINIMAP_SIZE,
        MINIMAP_SIZE
      );
    };

    initGame();

    return () => {
      isCancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

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
