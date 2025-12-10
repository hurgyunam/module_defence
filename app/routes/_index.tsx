import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// ... 다른 import

export default function Index() {
  return (
    // DndProvider를 다시 활성화합니다.
    <DndProvider backend={HTML5Backend}>
      <h1>HELLO WORLD TEST</h1>
    </DndProvider>
  );
}
