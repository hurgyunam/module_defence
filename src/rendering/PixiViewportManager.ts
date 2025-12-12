import * as PixiViewport from "pixi-viewport";
import { Container, DisplayObject, ICanvas, IRenderer } from "pixi.js";

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

export default class PixiViewportManager {
  private viewport: PixiViewport.Viewport;
  private renderer: IRenderer<ICanvas>;
  private view: ICanvas;

  private worldWidth: number | null = null;
  private worldHeight: number | null = null;

  constructor(
    renderer: IRenderer<ICanvas>,
    view: ICanvas,
    mapCols: number,
    mapRows: number,
    tileSize: number
  ) {
    this.worldWidth = mapCols * tileSize;
    this.worldHeight = mapRows * tileSize;

    this.renderer = renderer;
    this.view = view;
    this.viewport = new PixiViewport.Viewport({
      screenWidth: renderer.width,
      screenHeight: renderer.height,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
      events: renderer.events,
    });

    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: "all" });

    this.moveCorner(0, 0);
  }

  public moveCorner(x: number, y: number): void {
    this.viewport.moveCorner(x, y);
  }

  public moveCenter(x: number, y: number): void {
    this.viewport.moveCenter(x, y);
  }

  public addChild(unit: Container): void {
    this.viewport.addChild(unit);
  }

  public registViewport(stage: Container<DisplayObject>): void {
    stage.addChild(this.viewport);
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

    this.renderer.resize(newWidth, newHeight);

    if (this.view.style) {
      this.view.style.width = `${newWidth}px`;
      this.view.style.height = `${newHeight}px`;
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
}
