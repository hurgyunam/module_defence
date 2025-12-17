import React, { useState, useEffect, useId } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
  rectIntersection,
} from "@dnd-kit/core";

// --- 데이터 타입 ---
interface BlockItem {
  id: string;
  type: string;
  children: BlockItem[];
}

export default function NestedDndPage() {
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

// --- 하위 컴포넌트들 ---

// 1. 드래그 가능한 사이드바 아이템
function DraggablePaletteItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${id}`,
      data: { type: id },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 bg-gray-800 border border-gray-600 rounded cursor-move hover:border-blue-500 transition-colors ${
        isDragging ? "opacity-50 ring-2 ring-blue-500" : ""
      }`}
    >
      {label}
    </div>
  );
}

// 2. 메인 캔버스 영역
function CanvasZone({ blocks }: { blocks: BlockItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 w-full p-8 border-4 transition-all overflow-auto ${
        isOver
          ? "border-green-500 bg-green-500/5"
          : "border-dashed border-gray-700 bg-gray-800/50"
      } rounded-2xl`}
    >
      {blocks.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-500 font-bold">
          여기에 드롭하여 시작 (ROOT)
        </div>
      )}
      <div className="space-y-4">
        {blocks.map((block) => (
          <DroppableBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}

// 3. 중첩 가능한 개별 블록 (핵심)
function DroppableBlock({ block }: { block: BlockItem }) {
  const { setNodeRef, isOver } = useDroppable({
    id: block.id,
    data: { block },
  });

  const isContainer = block.type === "CONTAINER";

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border-2 transition-all ${
        isOver
          ? "border-blue-500 bg-blue-500/20 scale-[1.02]"
          : "border-gray-600 bg-gray-700/50"
      }`}
    >
      <div className="text-[10px] font-mono text-gray-400 mb-2">
        {block.type} #{block.id.slice(-4)}
      </div>

      {/* 자식 블록들이 렌더링되는 영역 */}
      <div
        className={`space-y-2 ${
          isContainer
            ? "min-h-[40px] border border-dashed border-gray-500 p-2 rounded"
            : ""
        }`}
      >
        {block.children.map((child) => (
          <DroppableBlock key={child.id} block={child} />
        ))}
        {isContainer && block.children.length === 0 && (
          <div className="text-[10px] text-gray-500 text-center py-2">
            자식을 여기에 드롭
          </div>
        )}
      </div>
    </div>
  );
}
