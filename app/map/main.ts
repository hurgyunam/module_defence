import { Application, Container, Graphics, Ticker } from "pixi.js";
import { UnitRenderer } from "./units/renderer";
import { UNIT_SPECS } from "./units/specs";
import * as PixiViewport from "pixi-viewport";

const CANVAS_WIDTH_RATIO = 1920;
const CANVAS_HEIGHT_RATIO = 1080;
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

const TILE_SIZE = 100; // 각 타일/유닛의 크기 (픽셀)
const MAP_COLS = 40; // 맵의 열 개수 (타일 기준)
const MAP_ROWS = 40; // 맵의 행 개수 (타일 기준)

const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

export default class GameMap {
  private app: Application;
  private viewport: PixiViewport.Viewport | null = null;
  private units: UnitRenderer[] = [];
  private handleResize: () => void;

  // 팩토리 메서드: 비동기 초기화를 책임지고 인스턴스를 반환
  public static async create(canvas: HTMLCanvasElement): Promise<GameMap> {
    canvas.width = canvas.offsetWidth || 800;
    canvas.height = canvas.offsetHeight || 600;

    const map = new GameMap(canvas);
    return map;
  }

  private constructor(canvas: HTMLCanvasElement) {
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
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      events: this.app.renderer.events,
    });

    this.app.stage.addChild(this.viewport);

    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: "all" });

    // C. 초기 크기 및 스케일 설정은 resizeCanvas에 위임
    this.handleResize = () => {
      if (this.app) {
        this.resizeCanvas();
      }
    };

    window.addEventListener("resize", this.handleResize);
    this.handleResize(); // 🚨 컴포넌트 마운트 시 초기 크기 및 뷰포트 스케일 설정

    // D. 유닛 배치
    this.initializeMap();

    this.viewport.moveCorner(0, 0);

    // 5. 렌더링 및 애니메이션 시작
    // this.app.ticker.add((delta) => this.update(delta));
    // this.app.ticker.add((delta) => this.updateEdgeScrolling(delta));
  }

  private resizeCanvas(): void {
    // 🚨 수정: window 객체가 클라이언트 환경에 있는지 확인 (혹시 모를 상황 대비)
    if (typeof window === "undefined") return;

    const { innerWidth: windowW, innerHeight: windowH } = window;

    // ... (이하 resize 로직은 이전과 동일)
    const ratio = CANVAS_WIDTH_RATIO / CANVAS_HEIGHT_RATIO;
    let newWidth = windowW;
    let newHeight = windowW / ratio;

    if (newHeight > windowH) {
      newHeight = windowH;
      newWidth = windowH * ratio;
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

    // setWindowDimensions({ width: windowW, height: windowH });
  }

  /**
   * 초기 맵 타일과 유닛들을 배치합니다.
   */
  private initializeMap(): void {
    // 1. 기본 타일 채우기 (예: 빈 땅)
    for (let y = 0; y < MAP_ROWS; y++) {
      for (let x = 0; x < MAP_COLS; x++) {
        // 일반적인 빈 땅 타일 배치
        this.addUnit("tile-plain", x, y);
      }
    }

    // 2. 특수 유닛 배치 예시
    // 산 배치
    this.addUnit("tile-mountain", 5, 5);
    this.addUnit("tile-mountain", 6, 5);

    // 자원 배치
    this.addUnit("resource-A", 2, 8);
    this.addUnit("resource-B", 12, 1);

    // 구조물 배치
    this.addUnit("structure-combiner-5", 1, 1);
    this.addUnit("defense-tower-10", 13, 8);

    // 적 유닛 (레벨 10) 배치
    const enemy = this.addUnit("enemy-10", 10, 3);

    // 아군 유닛 (드론) 배치 및 움직임 설정
    const drone = this.addUnit("unit-drone", 1, 8);
    this.setupDroneMovement(drone, 1, 10, 8);

    console.log(`맵에 총 ${this.units.length}개의 유닛이 배치되었습니다.`);
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
   * (선택 사항) 움직이는 유닛의 애니메이션을 설정하는 예시 함수
   */
  private setupDroneMovement(
    drone: UnitRenderer,
    startX: number,
    endX: number,
    mapY: number
  ) {
    let direction = 1; // 1: 오른쪽, -1: 왼쪽
    drone.setMapPosition(startX, mapY);

    this.app.ticker.add((delta) => {
      let currentTileX = drone.x / TILE_SIZE;

      if (currentTileX >= endX) direction = -1;
      else if (currentTileX <= startX) direction = 1;

      drone.x += direction * 1.5 * delta;
    });
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
    console.log("GameMap destroyed");
  }

  // GameMap.ts
  public resize() {
    this.handleResize();
  }
}
