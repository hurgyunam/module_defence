import { Application, Graphics } from "pixi.js";
import * as PixiViewport from "pixi-viewport";
import { UnitRenderer } from "./UnitRenderer";

export default class PixiMinimapApp {
  private app: Application;
  private viewport: PixiViewport.Viewport;
  private viewportRect: Graphics;
  private units: UnitRenderer[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    minimapWidth: number,
    minimapHeight: number,
    worldWidth: number,
    worldHeight: number
  ) {
    this.app = new Application({
      view: canvas,
      width: minimapWidth,
      height: minimapHeight,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.viewport = new PixiViewport.Viewport({
      screenWidth: minimapWidth,
      screenHeight: minimapHeight,
      worldWidth: worldWidth,
      worldHeight: worldHeight,
      events: this.app.renderer.events,
    });

    this.app.stage.addChild(this.viewport);

    const minimapBackground = new Graphics();
    minimapBackground.beginFill(0x2d3a4b);
    minimapBackground.drawRect(0, 0, worldWidth, worldHeight);
    minimapBackground.endFill();
    this.viewport.addChild(minimapBackground);

    this.viewport.fitWorld(true);
    this.viewport.moveCenter(worldWidth / 2, worldHeight / 2);
    this.viewport.interactive = false;
  }

  public addUnit(unit: UnitRenderer, mapX: number, mapY: number): UnitRenderer {
    if (this.viewport) {
      this.viewport.addChild(unit.getMinimapUnit());
      this.units.push(unit);
      return unit;
    } else {
      throw `viewport가 정의되지 않았습니다.`;
    }
  }

  public initViewportRect() {
    this.viewportRect = new Graphics();
    this.viewport.addChild(this.viewportRect);
  }

  public setMainViewportRect({
    x,
    y,
    width,
    height,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this.viewportRect.clear();
    this.viewportRect.lineStyle(50, 0xff0000, 1);
    this.viewportRect.drawRect(x, y, width, height);
  }
}
