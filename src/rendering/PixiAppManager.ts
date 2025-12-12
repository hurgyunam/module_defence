import {
  Application,
  Container,
  Graphics,
  Ticker,
  TickerCallback,
} from "pixi.js";
import { UnitRenderer } from "./Renderer";
import PixiViewportManager from "./PixiViewportManager";

const CANVAS_WIDTH_RATIO = 1920;
const CANVAS_HEIGHT_RATIO = 1080;

const TILE_SIZE = 100; // 각 타일/유닛의 크기 (픽셀)

export default class PixiAppManager {
  private app: Application;
  private viewport: PixiViewportManager;
  private units: UnitRenderer[] = [];
  private handleResize: () => void;

  public constructor(
    canvas: HTMLCanvasElement,
    mapColCount: number,
    mapRowCount: number
  ) {
    // A. PIXI Application 초기화
    this.app = new Application({
      view: canvas,
      width: CANVAS_WIDTH_RATIO,
      height: CANVAS_HEIGHT_RATIO,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // B. pixi-viewport 초기화 및 설정
    this.viewport = new PixiViewportManager(
      this.app.renderer,
      this.app.view,
      mapColCount,
      mapRowCount,
      TILE_SIZE
    );

    this.viewport.registViewport(this.app.stage);

    // C. 초기 크기 및 스케일 설정은 resizeCanvas에 위임
    this.handleResize = () => {
      if (this.app) {
        this.viewport.resizeCanvas(CANVAS_WIDTH_RATIO / CANVAS_HEIGHT_RATIO);
      }
    };

    window.addEventListener("resize", this.handleResize);
    this.handleResize(); // 🚨 컴포넌트 마운트 시 초기 크기 및 뷰포트 스케일 설정

    // D. 유닛 배치
    // this.initializeMap();

    // this.viewport.moveCorner(0, 0);

    // 5. 렌더링 및 애니메이션 시작
    // this.app.ticker.add((delta) => this.update(delta));
    // this.app.ticker.add((delta) => this.updateEdgeScrolling(delta));
  }

  public addTicker(fn: (delta: number, tileSize: number) => void): Ticker {
    return this.app.ticker.add((delta: number) => {
      fn(delta, TILE_SIZE);
    });
  }

  /**
   * 지정된 ID의 유닛을 맵의 특정 타일 좌표에 추가합니다.
   * @returns 생성된 UnitRenderer 인스턴스
   */
  public addUnit(unitId: string, mapX: number, mapY: number): UnitRenderer {
    if (this.viewport) {
      const unit = new UnitRenderer(unitId, TILE_SIZE);
      unit.setMapPosition(mapX, mapY);
      this.viewport.addChild(unit);
      this.units.push(unit);
      return unit;
    } else {
      throw `viewport가 정의되지 않았습니다.`;
    }
  }

  /**
   * 렌더 루프에서 호출되는 업데이트 함수 (게임 로직)
   * @param delta 시간 변화량 (PixiJS Ticker에서 제공)
   */
  private update(delta: number): void {
    // 여기에 게임 유닛의 충돌 처리, 상태 업데이트 등의 로직을 구현합니다.
    // 예: 움직이는 유닛이 적과 충돌했는지 확인 등
  }

  // (선택 사항) 맵의 다른 상태를 변경하거나 유닛을 제거하는 메소드 추가 가능

  public destroy(): void {
    window.removeEventListener("resize", this.handleResize);
    this.app.destroy(true, {
      children: true,
      texture: true,
      baseTexture: true,
    });
    this.units = [];
    console.log("PixiAppManager destroyed");
  }

  // PixiAppManager.ts
  public resize() {
    this.handleResize();
  }
}
