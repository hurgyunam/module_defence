export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Tailwind Test Page
      </h1>

      <p className="text-lg text-gray-700 mb-6">
        Tailwind가 정상 작동하고 있다면 이 문구는 스타일이 적용되어 보입니다.
      </p>

      <button className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">
        테스트 버튼
      </button>
    </div>
  );
}
