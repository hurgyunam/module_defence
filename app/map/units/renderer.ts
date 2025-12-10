// UnitRenderer.ts
import * as PIXI from "pixi.js";
import { UnitSpec, UNIT_SPECS } from "./specs"; // 위의 정의 파일에서 import

/**
 * 게임 맵의 유닛 한 개를 PixiJS로 렌더링하는 클래스입니다.
 */
export class UnitRenderer extends PIXI.Container {
  private spec: UnitSpec;
  private tileSize: number;

  /**
   * @param unitId 렌더링할 유닛의 ID (unit-specs.ts에 정의됨)
   * @param tileSize 렌더링할 타일의 크기 (픽셀)
   */
  constructor(unitId: string, tileSize: number) {
    super();

    const spec = UNIT_SPECS.find((s) => s.id === unitId);
    if (!spec) {
      throw new Error(`UnitSpec not found for id: ${unitId}`);
    }

    this.spec = spec;
    this.tileSize = tileSize;

    this.drawUnit();
  }

  private drawUnit(): void {
    const { backgroundColor, borderThickness, letter } = this.spec;
    const size = this.tileSize;

    // 1. 사각형 모양 (Graphics) 그리기
    const graphics = new PIXI.Graphics();

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

    this.addChild(graphics);

    // 2. 중앙 알파벳 (Text) 그리기
    if (letter) {
      const textStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: size * 0.4, // 타일 크기의 40% 정도 크기
        fill: 0x000000, // 텍스트 색상 (검은색)
        align: "center",
        fontWeight: "bold",
      });

      const text = new PIXI.Text(letter, textStyle);

      // 텍스트를 사각형 중앙에 위치시키기 위해 앵커를 중앙(0.5, 0.5)으로 설정
      text.anchor.set(0.5);

      // 텍스트의 위치를 사각형의 중앙으로 설정
      text.x = size / 2;
      text.y = size / 2;

      this.addChild(text);
    }
  }

  /**
   * 맵 좌표계를 위한 위치 설정 헬퍼
   * @param mapX 맵 상의 X 좌표 (타일 인덱스)
   * @param mapY 맵 상의 Y 좌표 (타일 인덱스)
   */
  public setMapPosition(mapX: number, mapY: number): void {
    this.x = mapX * this.tileSize;
    this.y = mapY * this.tileSize;
  }

  /** 유닛 사양을 반환합니다. */
  public getSpec(): UnitSpec {
    return this.spec;
  }
}
