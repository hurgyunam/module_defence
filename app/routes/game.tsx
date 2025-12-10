import { useCallback, useEffect, useRef, useState } from "react";
import GameMap from "../map/units/main";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameMap, setGameMap] = useState<GameMap | null>(null);
  // initGameMap 함수를 useCallback으로 감싸서 메모이제이션합니다.
  // 이 함수는 'setGameMap'이 필요하지만, set 함수는 React가 안정적임을 보장합니다.
  const initGameMap = useCallback(
    async (canvas: HTMLCanvasElement) => {
      // 🛑 중요: GameMap.create가 Promise를 반환하는 정적 팩토리 메서드여야 합니다.
      const temp = await GameMap.create(canvas);
      setGameMap(temp);
    },
    [setGameMap]
  ); // setGameMap은 안정적이므로 넣어도 무방하지만, lint 규칙에 따라 추가 (필요시)

  useEffect(() => {
    // 캔버스 레퍼런스가 생겼고, 아직 GameMap이 초기화되지 않았다면 실행합니다.
    if (canvasRef.current && !gameMap) {
      initGameMap(canvasRef.current);
    }

    // 🛑 클린업 함수: 컴포넌트 언마운트 시 PixiJS 리소스를 정리합니다.
    // GameMap에 app.destroy()를 호출하는 메서드가 있다면 사용합니다.
    // 현재 GameMap 구조상 app 객체를 직접 건드려야 하므로,
    // 나중에 GameMap에 destroy 메서드를 추가하는 것이 좋습니다.
    /*
    return () => {
        if (gameMap) {
            gameMap.destroy(); // 가정된 destroy 메서드
        }
    };
    */
  }, [initGameMap, gameMap]); // initGameMap은 useCallback으로 안정적, gameMap은 초기화 후 재실행 방지

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}
