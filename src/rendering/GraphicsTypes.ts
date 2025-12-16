// unit-specs.ts

/**
 * 게임 유닛의 시각적 및 논리적 속성을 정의하는 인터페이스.
 * 배경색, 테두리, 표시할 알파벳 등을 포함합니다.
 */
export interface UnitGraphicSpec {
  /** 유닛의 고유 ID (예: 'tile-plain', 'mountain', 'resource-A') */
  id: string;
  /** 유닛이 속한 카테고리 (예: '타일', '자원', '아군 유닛') */
  category: string;
  /** 유닛의 이름 (예: '일반적인 빈 땅', '산', '생산 및 자원 운반 드론') */
  name: string;
  /** 배경 색상 (PixiJS에서 사용할 수 있도록 0x로 변환된 hex code) */
  backgroundColor: number;
  /** 테두리 굵기 (픽셀) */
  borderThickness: number;
  /** 유닛 중앙에 표시할 알파벳/숫자 */
  letter: string;
  /** 유닛에 대한 설명 */
  description: string;
}

// Color Code string을 PixiJS에서 사용하는 number 타입으로 변환하는 헬퍼 함수
const hexToNumber = (hex: string): number => {
  // #을 제거하고 16진수로 파싱
  return parseInt(hex.replace("#", ""), 16);
};

/**
 * 게임 내 모든 유닛 타입에 대한 사양 정의.
 */
export const UNIT_GRAPHIC_SPECS: UnitGraphicSpec[] = [
  // --- 타일 ---
  {
    id: "tile-plain",
    category: "타일",
    name: "일반적인 빈 땅",
    backgroundColor: hexToNumber("#CCCCCC"),
    borderThickness: 0,
    letter: "",
    description: "가장 기본적인 타일.",
  },
  {
    id: "tile-mountain",
    category: "타일",
    name: "적도 아군도 지나갈 수 없는 산",
    backgroundColor: hexToNumber("#555555"),
    borderThickness: 2,
    letter: "M",
    description: "통과 불가능. 시각적으로 확실히 구분.",
  },

  // --- 자원 (간단히 3가지만 예시로) ---
  {
    id: "resource-A",
    category: "자원",
    name: "자원 A (철)",
    backgroundColor: hexToNumber("#CCCC00"),
    borderThickness: 1,
    letter: "A",
    description: "자원 종류 A.",
  },
  {
    id: "resource-B",
    category: "자원",
    name: "자원 B (금)",
    backgroundColor: hexToNumber("#CCAA00"),
    borderThickness: 1,
    letter: "B",
    description: "자원 종류 B.",
  },
  {
    id: "resource-C",
    category: "자원",
    name: "자원 C (석탄)",
    backgroundColor: hexToNumber("#C0C000"),
    borderThickness: 1,
    letter: "C",
    description: "자원 종류 C.",
  },

  // --- 구조물 ---
  {
    id: "structure-combiner-1",
    category: "구조물",
    name: "자원 조합기 (1단계)",
    backgroundColor: hexToNumber("#009900"),
    borderThickness: 2,
    letter: "C1",
    description: "자원 조합기 1단계.",
  },
  {
    id: "structure-combiner-5",
    category: "구조물",
    name: "자원 조합기 (5단계)",
    backgroundColor: hexToNumber("#33CC33"),
    borderThickness: 5,
    letter: "C5",
    description: "자원 조합기 5단계.",
  },
  {
    id: "structure-processor-1",
    category: "구조물",
    name: "자원 가공기 (1단계)",
    backgroundColor: hexToNumber("#0000CC"),
    borderThickness: 2,
    letter: "P1",
    description: "자원 가공기 1단계.",
  },
  {
    id: "structure-processor-5",
    category: "구조물",
    name: "자원 가공기 (5단계)",
    backgroundColor: hexToNumber("#3333FF"),
    borderThickness: 5,
    letter: "P5",
    description: "자원 가공기 5단계.",
  },

  // --- 아군 유닛 ---
  {
    id: "unit-drone",
    category: "아군 유닛",
    name: "생산 및 자원 운반 드론",
    backgroundColor: hexToNumber("#FFFFFF"),
    borderThickness: 1,
    letter: "D",
    description: "움직이는 유닛.",
  },

  // --- 적 ---
  {
    id: "enemy-1",
    category: "적",
    name: "적 (레벨 1)",
    backgroundColor: hexToNumber("#CC0000"),
    borderThickness: 1,
    letter: "E1",
    description: "적 레벨 1.",
  },
  {
    id: "enemy-10",
    category: "적",
    name: "적 (레벨 10)",
    backgroundColor: hexToNumber("#660000"),
    borderThickness: 5,
    letter: "E10",
    description: "적 레벨 10.",
  },

  // --- 부산물 (간단히 2가지만 예시로) ---
  {
    id: "byproduct-1",
    category: "부산물",
    name: "부산물 O1",
    backgroundColor: hexToNumber("#FF9900"),
    borderThickness: 1,
    letter: "O1",
    description: "부산물 종류 1.",
  },
  {
    id: "byproduct-2",
    category: "부산물",
    name: "부산물 O2",
    backgroundColor: hexToNumber("#FF7700"),
    borderThickness: 1,
    letter: "O2",
    description: "부산물 종류 2.",
  },

  // --- 방어 구조물 ---
  {
    id: "defense-tower-1",
    category: "방어 구조물",
    name: "타워 (레벨 1)",
    backgroundColor: hexToNumber("#9900CC"),
    borderThickness: 2,
    letter: "T1",
    description: "타워 레벨 1.",
  },
  {
    id: "defense-tower-10",
    category: "방어 구조물",
    name: "타워 (레벨 10)",
    backgroundColor: hexToNumber("#CC66FF"),
    borderThickness: 5,
    letter: "T10",
    description: "타워 레벨 10.",
  },
];
