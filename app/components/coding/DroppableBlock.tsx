import { useDroppable } from "@dnd-kit/core";
import { BlockItem } from "src/coding/BlockItem";

// 3. 중첩 가능한 개별 블록 (핵심)
export default function DroppableBlock({ block }: { block: BlockItem }) {
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
