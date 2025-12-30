import { useState, useEffect, useId } from "react";

import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  rectIntersection,
} from "@dnd-kit/core";
import DraggablePaletteItem from "./coding/DraggablePaletteItem";
import CanvasZone from "./coding/CanvasZone";

// --- 데이터 타입 ---
interface BlockItem {
  id: string;
  type: string;
  children: BlockItem[];
}

export default function CodingView() {
  const dndId = useId();
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 성공했던 센서 설정 그대로 유지
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  // 드롭 처리 로직
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // 새 블록 생성 (사이드바 아이템 드래그 시)
    const type = active.data.current?.type as string;
    const newBlock: BlockItem = {
      id: `block-${Date.now()}`,
      type,
      children: [],
    };

    if (over.id === "canvas-root") {
      setBlocks((prev) => [...prev, newBlock]);
    } else {
      // 특정 블록 내부로 삽입하는 재귀 로직
      const addToTree = (items: BlockItem[]): BlockItem[] => {
        return items.map((item) => {
          if (item.id === over.id) {
            return { ...item, children: [...item.children, newBlock] };
          }
          if (item.children.length > 0) {
            return { ...item, children: addToTree(item.children) };
          }
          return item;
        });
      };
      setBlocks((prev) => addToTree(prev));
    }
  };

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full bg-gray-900 text-white p-10 gap-10 overflow-hidden">
        {/* 사이드바 */}
        <div className="w-64 flex flex-col gap-4 z-50">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Elements</h2>
          <DraggablePaletteItem id="CONTAINER" label="📦 Container" />
          <DraggablePaletteItem id="TEXT" label="📝 Text Block" />

          <div className="mt-auto p-4 bg-gray-800 rounded border border-gray-700 text-xs text-gray-400">
            블록을 캔버스나 <br />
            다른 컨테이너 위로 드래그하세요.
          </div>
        </div>

        {/* 캔버스 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CanvasZone blocks={blocks} />

          {/* 하단 데이터 확인 */}
          <div className="mt-6">
            <h3 className="text-xs font-mono text-blue-300 mb-2">TREE DATA</h3>
            <pre className="p-4 bg-black border border-gray-700 rounded text-green-400 text-[10px] h-48 overflow-auto">
              {JSON.stringify(blocks, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
