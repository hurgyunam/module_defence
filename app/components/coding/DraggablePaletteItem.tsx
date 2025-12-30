import { useDraggable } from "@dnd-kit/core";

//1. 드래그 가능한 사이드바 아이템
export default function DraggablePaletteItem({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
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
