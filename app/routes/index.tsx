import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Index() {
  return (
    // react-dnd 사용을 위한 최상위 DndProvider 적용
    <DndProvider backend={HTML5Backend}>
      <div className="p-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
          ✅ Remix, TypeScript, Tailwind 통합 완료!
        </h1>
        <p className="text-gray-600 mb-6">
          이제 이곳에 PixiJS, react-dnd, Zustand를 활용한 블록 코딩 UI를 개발할
          수 있습니다.
        </p>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="text-xl font-semibold text-green-600">
            Tailwind CSS 테스트:
          </p>
          <button className="mt-4 px-6 py-2 bg-purple-500 text-white font-medium rounded-md hover:bg-purple-600 transition-colors">
            테스트 버튼 (스타일 적용됨)
          </button>
        </div>
      </div>
    </DndProvider>
  );
}
