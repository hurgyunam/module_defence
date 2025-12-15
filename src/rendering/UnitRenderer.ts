// UnitRenderer.ts
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { UnitSpec, UNIT_SPECS } from "./GraphicsTypes"; // 위의 정의 파일에서 import

/**
 * 게임 맵의 유닛 한 개를 PixiJS로 렌더링하는 클래스입니다.
 */
export class UnitRenderer {
  private spec: UnitSpec;
  private tileSize: number;

  private mainUnit: Container;
  private minimapUnit: Container;

  /**
   * @param unitId 렌더링할 유닛의 ID (unit-specs.ts에 정의됨)
   * @param tileSize 렌더링할 타일의 크기 (픽셀)
   */
  constructor(unitId: string, tileSize: number) {
    const spec = UNIT_SPECS.find((s) => s.id === unitId);
    if (!spec) {
      throw new Error(`UnitSpec not found for id: ${unitId}`);
    }

    this.spec = spec;
    this.tileSize = tileSize;

    this.mainUnit = this.buildMainUnit();
    this.minimapUnit = this.buildMinimapUnit();
  }

  private buildMinimapUnit(): Container {
    const unit = new Container();

    const { backgroundColor, borderThickness } = this.spec;
    const size = this.tileSize;

    // 1. 사각형 모양 (Graphics) 그리기
    const graphics = new Graphics();

    // 테두리 설정 (borderThickness가 0보다 클 경우)
    if (borderThickness > 0) {
      // 테두리는 검은색으로 고정 (요구사항에 따라 유연하게 변경 가능)
      graphics.lineStyle(borderThickness, 0x000000);
    }

    // 배경 채우기
    graphics.beginFill(backgroundColor);

    // 사각형을 (0, 0)에서 시작하여 size x size 크기로 그립니다.
    // 테두리가 중앙에 그려지므로, 시작점과 크기를 조정하여
    // 전체 크기가 tileSize가 되도록 할 수도 있지만, 여기서는 간단하게 그립니다.
    graphics.drawRect(0, 0, size, size);
    graphics.endFill();

    unit.addChild(graphics);

    return unit;
  }

  private buildMainUnit(): Container {
    const unit = new Container();
    const { backgroundColor, borderThickness, letter } = this.spec;
    const size = this.tileSize;

    // 1. 사각형 모양 (Graphics) 그리기
    const graphics = new Graphics();

    // 테두리 설정 (borderThickness가 0보다 클 경우)
    if (borderThickness > 0) {
      // 테두리는 검은색으로 고정 (요구사항에 따라 유연하게 변경 가능)
      graphics.lineStyle(borderThickness, 0x000000);
    }

    // 배경 채우기
    graphics.beginFill(backgroundColor);

    // 사각형을 (0, 0)에서 시작하여 size x size 크기로 그립니다.
    // 테두리가 중앙에 그려지므로, 시작점과 크기를 조정하여
    // 전체 크기가 tileSize가 되도록 할 수도 있지만, 여기서는 간단하게 그립니다.
    graphics.drawRect(0, 0, size, size);
    graphics.endFill();

    unit.addChild(graphics);

    // 2. 중앙 알파벳 (Text) 그리기
    if (letter) {
      const textStyle = new TextStyle({
        fontFamily: "Arial",
        fontSize: size * 0.4, // 타일 크기의 40% 정도 크기
        fill: 0x000000, // 텍스트 색상 (검은색)
        align: "center",
        fontWeight: "bold",
      });

      const text = new Text(letter, textStyle);

      // 텍스트를 사각형 중앙에 위치시키기 위해 앵커를 중앙(0.5, 0.5)으로 설정
      text.anchor.set(0.5);

      // 텍스트의 위치를 사각형의 중앙으로 설정
      text.x = size / 2;
      text.y = size / 2;

      unit.addChild(text);
    }

    return unit;
  }

  public getMainUnit(): Container {
    return this.mainUnit;
  }

  public getMinimapUnit(): Container {
    return this.minimapUnit;
  }

  public getTileX(): number {
    return this.mainUnit.x / this.tileSize;
  }

  public getTileY(): number {
    return this.mainUnit.y / this.tileSize;
  }

  public setTileX(x: number) {
    this.mainUnit.x = x * this.tileSize;
    this.minimapUnit.x = x * this.tileSize;
  }

  public setTileY(y: number) {
    this.mainUnit.y = y * this.tileSize;
    this.minimapUnit.y = y * this.tileSize;
  }

  /**
   * 맵 좌표계를 위한 위치 설정 헬퍼
   * @param mapX 맵 상의 X 좌표 (타일 인덱스)
   * @param mapY 맵 상의 Y 좌표 (타일 인덱스)
   */
  public setMapPosition(mapX: number, mapY: number): void {
    this.mainUnit.x = mapX * this.tileSize;
    this.mainUnit.y = mapY * this.tileSize;

    this.minimapUnit.x = mapX * this.tileSize;
    this.minimapUnit.y = mapY * this.tileSize;
  }

  /** 유닛 사양을 반환합니다. */
  public getSpec(): UnitSpec {
    return this.spec;
  }
}
