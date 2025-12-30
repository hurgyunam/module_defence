// --- 데이터 타입 ---
export interface BlockItem {
  id: string;
  type: string;
  children: BlockItem[];
}
