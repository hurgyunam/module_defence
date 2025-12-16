import { MapSpec } from "./MapUnitTypes";
import PixiMainApp from "./PixiMainApp";
import PixiMinimapApp from "./PixiMinimapApp";
import { UnitRenderer } from "./UnitRenderer";

const TILE_SIZE = 100; // 각 타일/유닛의 크기 (픽셀)
const CANVAS_WIDTH_RATIO = 1920;
const CANVAS_HEIGHT_RATIO = 1080;

export default class GameController {
  private mainApp: PixiMainApp;
  private minimapApp: PixiMinimapApp;
  private units: UnitRenderer[] = [];

  constructor(
    mainCanvas: HTMLCanvasElement,
    minimapCanvas: HTMLCanvasElement,
    mapSpec: MapSpec,
    minimapWidth: number,
    minimapHeight: number
  ) {
    const mapColCount = mapSpec.colCount;
    const mapRowCount = mapSpec.rowCount;

    const worldWidth = mapColCount * TILE_SIZE;
    const worldHeight = mapRowCount * TILE_SIZE;

    this.mainApp = new PixiMainApp(
      mainCanvas,
      CANVAS_WIDTH_RATIO,
      CANVAS_HEIGHT_RATIO,
      worldWidth,
      worldHeight
    );

    this.minimapApp = new PixiMinimapApp(
      minimapCanvas,
      minimapWidth,
      minimapHeight,
      worldWidth,
      worldHeight
    );

    for (let y = 0; y < mapRowCount; y++) {
      for (let x = 0; x < mapColCount; x++) {
        // 일반적인 빈 땅 타일 배치
        this.addUnit(mapSpec.emptyTileId, x, y);
      }
    }

    for (let unitSpec of mapSpec.units) {
      const unit = this.addUnit(unitSpec.id, unitSpec.tileX, unitSpec.tileY);

      if (unitSpec.movementType === "unit-drone") {
        this.setupDroneMovement(unit, 1, 10, 8);
      }

      this.units.push(unit);
    }

    this.mainApp.addMinimapTicker(this.minimapApp);
  }

  private addUnit(id: string, mapX: number, mapY: number) {
    const unit = this.mainApp.addUnit(id, mapX, mapY, TILE_SIZE);

    this.minimapApp.addUnit(unit, mapX, mapY);

    return unit;
  }

  private setupDroneMovement(
    drone: UnitRenderer,
    startX: number,
    endX: number,
    mapY: number
  ) {
    let direction = 1; // 1: 오른쪽, -1: 왼쪽
    drone.setMapPosition(startX, mapY);

    this.mainApp.addTicker((delta) => {
      let currentTileX = drone.getTileX();

      if (currentTileX >= endX) direction = -1;
      else if (currentTileX <= startX) direction = 1;

      drone.setTileX(currentTileX + (direction * 1.5 * delta) / 100);
    });
  }

  public resize() {
    this.mainApp.resize();
  }

  public destroy() {
    this.mainApp.destroy();
    this.minimapApp.destroy();
  }
}
