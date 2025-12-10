import { Application, Container, Graphics, Ticker } from "pixi.js";
import { UnitRenderer } from "./units/renderer";
import { UNIT_SPECS } from "./units/specs";
import * as PixiViewport from "pixi-viewport";

const TILE_SIZE = 50; // 각 타일/유닛의 크기 (픽셀)
const MAP_COLS = 15; // 맵의 열 개수 (타일 기준)
const MAP_ROWS = 10; // 맵의 행 개수 (타일 기준)

const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;
const EDGE_SCROLL_THRESHOLD = 50;
const EDGE_SCROLL_SPEED = 4;

export default class GameMap {
  private app: Application;
  private viewport: PixiViewport.Viewport | null = null;
  private screenWidth: number = 0;
  private screenHeight: number = 0;
  private units: UnitRenderer[] = [];

  // 팩토리 메서드: 비동기 초기화를 책임지고 인스턴스를 반환
  public static async create(canvas: HTMLCanvasElement): Promise<GameMap> {
    canvas.width = canvas.offsetWidth || 800;
    canvas.height = canvas.offsetHeight || 600;

    const map = new GameMap(canvas);
    await map.initializeAsync(canvas); // 비동기 초기화 완료를 기다림
    return map;
  }

  private constructor(canvas: HTMLCanvasElement) {
    // 팩토리 메서드 사용 시 constructor는 비워둡니다.
    this.app = new Application();
    this.screenWidth = canvas.width;
    this.screenHeight = canvas.height;

    // Pixi v7 방식
    this.app = new Application({
      view: canvas,
      resizeTo: canvas, // 옵션 추가하면 자동 리사이즈도 가능
      width: canvas.width,
      height: canvas.height,
      backgroundColor: 0xeeeeee,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });
  }

  // 맵 초기화 및 유닛 배치 로직을 비동기 메서드로 분리
  private async initializeAsync(canvas: HTMLCanvasElement): Promise<void> {
    // [IMPORTANT] v8에서는 init()을 통해 옵션 전달 및 초기화

    // 3. 맵 컨테이너 초기화
    this.setupViewport();

    // 4. 유닛 배치
    this.initializeMap();

    // 5. 렌더링 및 애니메이션 시작
    this.app.ticker.add((delta) => this.update(delta));
    this.app.ticker.add((delta) => this.updateEdgeScrolling(delta));

    // 캔버스가 DOM에 추가되었는지 확인 (Remix/React 환경에서 필요할 수 있음)
    // document.body.appendChild(this.app.canvas);
  }

  // --- 뷰포트 설정 메서드 ---
  private setupViewport(): void {
    this.viewport = new PixiViewport.Viewport({
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      events: this.app.renderer.events, // 마우스 이벤트를 뷰포트에 연결
    });

    this.app.stage.addChild(this.viewport);

    // viewport 기능 활성화
    this.viewport.drag().pinch().wheel().clamp({ direction: "all" });

    // DEBUG 박스
    const box = new Graphics();
    box.beginFill(0xff0000);
    box.drawRect(0, 0, 50, 50);
    box.endFill();

    this.viewport.addChild(box);
  }

  // --- 엣지 스크롤링 로직 (Ticker에 추가) ---
  private updateEdgeScrolling(delta: number): void {
    if (!this.viewport) return;

    // 현재 마우스 위치 가져오기 (스크린 좌표)
    const { x: mouseX, y: mouseY } = this.app.renderer.events.pointer.global;

    // deltaTime에 비례하여 일정한 속도로 스크롤되도록 설정
    const scrollSpeed = EDGE_SCROLL_SPEED * delta;

    // 좌우 스크롤
    if (mouseX <= EDGE_SCROLL_THRESHOLD) {
      // 마우스가 왼쪽 경계에 있으면 뷰포트를 오른쪽(x 증가)으로 이동
      this.viewport.x += scrollSpeed;
    } else if (mouseX >= this.screenWidth - EDGE_SCROLL_THRESHOLD) {
      // 마우스가 오른쪽 경계에 있으면 뷰포트를 왼쪽(x 감소)으로 이동
      this.viewport.x -= scrollSpeed;
    }

    // 상하 스크롤
    if (mouseY <= EDGE_SCROLL_THRESHOLD) {
      // 마우스가 위쪽 경계에 있으면 뷰포트를 아래(y 증가)로 이동
      this.viewport.y += scrollSpeed;
    } else if (mouseY >= this.screenHeight - EDGE_SCROLL_THRESHOLD) {
      // 마우스가 아래쪽 경계에 있으면 뷰포트를 위(y 감소)로 이동
      this.viewport.y -= scrollSpeed;
    }
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
    this.app.destroy(true);
    this.units = [];
    console.log("GameMap destroyed");
  }

  // GameMap.ts
  public resize(width: number, height: number) {
    this.app.renderer.resize(width, height);
    this.screenWidth = width;
    this.screenHeight = height;

    if (this.viewport) {
      this.viewport.resize(width, height);
    }
  }
}
