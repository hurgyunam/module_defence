import { Application, Graphics } from "pixi.js";
import * as PixiViewport from "pixi-viewport";
import { UnitRenderer } from "./UnitRenderer";

export default class PixiMinimapApp {
  private app: Application;
  private viewport: PixiViewport.Viewport;
  private viewportRect: Graphics;

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

    this.viewportRect = new Graphics();
    this.viewport.addChild(this.viewportRect);

    this.viewport.fitWorld(true);
    this.viewport.moveCenter(worldWidth / 2, worldHeight / 2);
    this.viewport.interactive = false;
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
