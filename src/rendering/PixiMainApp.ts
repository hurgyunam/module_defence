import {
  Application,
  Container,
  Graphics,
  Ticker,
  TickerCallback,
} from "pixi.js";
import { UnitRenderer } from "./UnitRenderer";
import * as PixiViewport from "pixi-viewport";

const CANVAS_WIDTH_RATIO = 1920;
const CANVAS_HEIGHT_RATIO = 1080;
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

const TILE_SIZE = 100; // 각 타일/유닛의 크기 (픽셀)

export default class PixiMainApp {
  private app: Application;
  private viewport: PixiViewport.Viewport;
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
    this.viewport = new PixiViewport.Viewport({
      screenWidth: this.app.renderer.width,
      screenHeight: this.app.renderer.height,
      worldWidth: mapColCount * TILE_SIZE,
      worldHeight: mapRowCount * TILE_SIZE,
      events: this.app.renderer.events,
    });

    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: "all" });

    this.viewport.moveCorner(0, 0);

    this.app.stage.addChild(this.viewport);

    // this.viewport.registViewport(this.app.stage);

    // C. 초기 크기 및 스케일 설정은 resizeCanvas에 위임
    this.handleResize = () => {
      if (this.app) {
        this.resizeCanvas(CANVAS_WIDTH_RATIO / CANVAS_HEIGHT_RATIO);
      }
    };

    window.addEventListener("resize", this.handleResize);
    this.handleResize(); // 🚨 컴포넌트 마운트 시 초기 크기 및 뷰포트 스케일 설정
  }

  public resizeCanvas(canvasRatio: number): void {
    // 🚨 수정: window 객체가 클라이언트 환경에 있는지 확인 (혹시 모를 상황 대비)
    if (typeof window === "undefined") return;

    const { innerWidth: windowW, innerHeight: windowH } = window;

    // ... (이하 resize 로직은 이전과 동일)
    let newWidth = windowW;
    let newHeight = windowW / canvasRatio;

    if (newHeight > windowH) {
      newHeight = windowH;
      newWidth = windowH * canvasRatio;
    }

    this.app.renderer.resize(newWidth, newHeight);

    if (this.app.view.style) {
      this.app.view.style.width = `${newWidth}px`;
      this.app.view.style.height = `${newHeight}px`;
    }

    if (this.viewport) {
      this.viewport.screenWidth = newWidth;
      this.viewport.screenHeight = newHeight;
      this.viewport.resize(newWidth, newHeight);

      // 리사이즈 시 스케일 재조정 (캔버스에 1920x1080 맵 영역이 항상 꽉 차도록)
      const initialScaleX = newWidth / VIEWPORT_WIDTH;
      const initialScaleY = newHeight / VIEWPORT_HEIGHT;
      const newScale = Math.min(initialScaleX, initialScaleY);
      this.viewport.scale.set(newScale);
    }
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
      this.viewport.addChild(unit.getMainUnit());
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
