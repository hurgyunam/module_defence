declare module "pixi-viewport" {
  import { Container } from "pixi.js";

  export interface PluginOptions {
    // 어떤 옵션이든 들어갈 수 있도록
    [key: string]: any;
  }

  export class Viewport extends Container {
    screenWidth: number;
    screenHeight: number;
    fitWorld: boolean;
    fit: () => void;
    constructor(options?: any);
    // 필요한 메서드 추가 가능

    // 플러그인 관련 메서드들 수동 선언
    drag(options?: PluginOptions): this;
    pinch(options?: PluginOptions): this;
    wheel(options?: PluginOptions): this;
    decelerate(options?: PluginOptions): this;
    clamp(options?: PluginOptions): this;
    clampZoom(options?: PluginOptions): this;
    translate(x: number, y?: number): this;
    moveCenter(x: number, y?: number): this;
    moveCorner(x: number, y?: number): this;
    fitWidth(width: number): this;
    fitHeight(height: number): this;
    zoomPercent(
      percent: number,
      center?: boolean | { x: number; y: number }
    ): this;
    resize(screenWidth: number, screenHeight: number): void;
    setZoom(rate: number, value: boolean): void;
  }
  export default Viewport;
}
