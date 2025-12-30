import { useDroppable } from "@dnd-kit/core";
import { BlockItem } from "src/coding/BlockItem";
import DroppableBlock from "./DroppableBlock";

export default // 2. 메인 캔버스 영역
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
