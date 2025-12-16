export interface MapUnitSpec {
  id: string;
  tileX: number;
  tileY: number;
  movementType?: "unit-drone" | undefined;
}

export interface MapSpec {
  rowCount: number;
  colCount: number;
  emptyTileId: string;
  units: MapUnitSpec[];
}

export const testMapSpec: MapSpec = {
  rowCount: 30,
  colCount: 30,
  emptyTileId: "tile-plain",
  units: [
    {
      id: "tile-mountain",
      tileX: 5,
      tileY: 5,
    },
    {
      id: "tile-mountain",
      tileX: 6,
      tileY: 5,
    },
    {
      id: "tile-mountain",
      tileX: 6,
      tileY: 5,
    },
    {
      id: "resource-A",
      tileX: 2,
      tileY: 8,
    },
    {
      id: "resource-B",
      tileX: 12,
      tileY: 1,
    },
    {
      id: "resource-B",
      tileX: 12,
      tileY: 1,
    },
    {
      id: "structure-combiner-5",
      tileX: 1,
      tileY: 1,
    },
    {
      id: "defense-tower-10",
      tileX: 13,
      tileY: 8,
    },
    {
      id: "enemy-10",
      tileX: 10,
      tileY: 3,
    },
    {
      id: "unit-drone",
      tileX: 1,
      tileY: 8,
      movementType: "unit-drone",
    },
  ],
};
