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
  rectIntersection, // pointerWithin보다 때로는 더 확실합니다
} from "@dnd-kit/core";

export default function TestBlock() {
  const id = useId(); // 유니크 ID 생성 (Hydration 이슈 방지)
  const [blocks, setBlocks] = useState<{ id: string; type: string }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. 센서가 꼬이지 않도록 명시적으로 설정
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <DndContext
      id={id} // 컨텍스트 ID 강제 부여
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={(event: DragEndEvent) => {
        const { active, over } = event;
        // 드롭 시점에 모든 데이터를 로그로 찍어 확인
        console.log("DROP EVENT:", { activeId: active.id, overId: over?.id });

        if (over && over.id === "canvas-root") {
          const type = active.data.current?.type as string;
          setBlocks((prev) => [...prev, { id: `${type}-${Date.now()}`, type }]);
        }
      }}
    >
      <div className="flex h-screen w-full bg-gray-900 text-white font-sans p-10 gap-10">
        {/* SIDEBAR */}
        <div className="w-64 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Palette</h2>
          <DraggableItem id="CONTAINER" label="📦 Container" />
          <DraggableItem id="TEXT" label="📝 Text Block" />

          <div className="mt-10 p-4 bg-gray-800 rounded border border-gray-700">
            <p className="text-sm font-bold mb-2">Debug Info:</p>
            <CanvasStatus />
          </div>
        </div>

        {/* CANVAS */}
        <div className="flex-1 flex flex-col items-center">
          <h2 className="mb-4 text-gray-400 text-sm">
            이 아래 영역으로 드래그하세요
          </h2>
          <CanvasZone />

          <div className="mt-8 w-full max-w-xl">
            <h3 className="text-xs font-mono text-blue-300 mb-2">LIVE DATA</h3>
            <pre className="p-4 bg-black border border-gray-700 rounded text-green-400 text-xs h-40 overflow-auto">
              {JSON.stringify(blocks, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

// 캔버스 상태 표시 전용 컴포넌트
function CanvasStatus() {
  // useDroppable의 상태를 컴포넌트 내부에서 감시
  const { isOver } = useDroppable({ id: "canvas-root" });
  return (
    <div
      className={`text-center p-2 rounded font-bold ${
        isOver ? "bg-green-600 animate-pulse" : "bg-red-600"
      }`}
    >
      {isOver ? "감지됨 (OVER)" : "감지 안됨"}
    </div>
  );
}

// 캔버스 영역 컴포넌트
function CanvasZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });
  return (
    <div
      ref={setNodeRef}
      className={`w-full max-w-xl h-96 border-4 flex flex-col items-center justify-center transition-all ${
        isOver
          ? "border-green-500 bg-green-500/10 scale-105"
          : "border-dashed border-gray-600 bg-gray-800"
      }`}
    >
      <span className="text-lg font-bold">
        {isOver ? "놓으세요!" : "DROP ZONE"}
      </span>
    </div>
  );
}

// 드래그 아이템 컴포넌트
function DraggableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `item-${id}`,
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
      className={`p-4 bg-gray-800 border border-gray-600 rounded cursor-move shadow-lg select-none ${
        isDragging ? "opacity-50 ring-2 ring-blue-500" : ""
      }`}
    >
      {label}
    </div>
  );
}
