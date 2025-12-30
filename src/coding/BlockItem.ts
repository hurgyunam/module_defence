export declare type BlockType = "if" | "while" | "execute";

export interface BlockPaletteItem {
  id: string;
  type: BlockType;
  label: string;
  isContainer: boolean;
}

export const blockPaletteItems: BlockPaletteItem[] = [
  {
    id: "palette-if",
    label: "📦 If",
    type: "if",
    isContainer: true,
  },
  {
    id: "palette-while",
    label: "📦 While",
    type: "while",
    isContainer: true,
  },
  {
    id: "palette-take",
    label: "📝 Take",
    type: "execute",
    isContainer: false,
  },
];

export interface BlockItem {
  id: string;
  type: BlockType;
  isContainer: boolean;
  children: BlockItem[];
}

export const buildBlockItemByPaletteItem = (
  paletteItem: BlockPaletteItem
): BlockItem => {
  return {
    id: `block-${paletteItem.type}-${Date.now()}`,
    type: paletteItem.type,
    isContainer: paletteItem.isContainer,
    children: [],
  };
};
