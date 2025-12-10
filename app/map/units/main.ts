import { Application, Container, Graphics, Ticker } from "pixi.js";
import { UnitRenderer } from "./renderer";
import { UNIT_SPECS } from "./specs";

const TILE_SIZE = 50; // 각 타일/유닛의 크기 (픽셀)
const MAP_COLS = 15; // 맵의 열 개수 (타일 기준)
const MAP_ROWS = 10; // 맵의 행 개수 (타일 기준)

export default class GameMap {
  private app: Application;
  private mapContainer: Container | null = null;
  private units: UnitRenderer[] = [];

  private constructor() {
    // 팩토리 메서드 사용 시 constructor는 비워둡니다.
    this.app = new Application();
  }

  // 팩토리 메서드: 비동기 초기화를 책임지고 인스턴스를 반환
  public static async create(canvas: HTMLCanvasElement): Promise<GameMap> {
    const map = new GameMap();
    await map.initializeAsync(canvas); // 비동기 초기화 완료를 기다림
    return map;
  }

  // 맵 초기화 및 유닛 배치 로직을 비동기 메서드로 분리
  private async initializeAsync(canvas: HTMLCanvasElement): Promise<void> {
    // [IMPORTANT] v8에서는 init()을 통해 옵션 전달 및 초기화
    await this.app.init({
      canvas: canvas, // 제공된 캔버스 사용
      width: MAP_COLS * TILE_SIZE,
      height: MAP_ROWS * TILE_SIZE,
      backgroundColor: 0xaaaaaa,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // 3. 맵 컨테이너 초기화
    this.mapContainer = new Container();
    this.app.stage.addChild(this.mapContainer);

    console.log(
      `GameMap 초기화 완료. 크기: ${this.app.renderer.width}x${this.app.renderer.height}`
    );

    // 4. 유닛 배치
    this.initializeMap();

    // 5. 렌더링 및 애니메이션 시작
    this.app.ticker.add(this.update.bind(this));

    // 캔버스가 DOM에 추가되었는지 확인 (Remix/React 환경에서 필요할 수 있음)
    // document.body.appendChild(this.app.canvas);
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
    if (this.mapContainer) {
      try {
        const unit = new UnitRenderer(unitId, TILE_SIZE);
        unit.setMapPosition(mapX, mapY);
        this.mapContainer.addChild(unit);
        this.units.push(unit);
        return unit;
      } catch (error) {
        console.error(error);
        // 유닛 생성 실패 시 더미 유닛을 반환하거나 예외를 다시 던질 수 있습니다.
        throw error;
      }
    } else {
      throw `[ERROR_MODULE_DEFENCE] mapContainer가 생성되지 않았습니다.`;
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
      if (typeof delta === "number") {
        // 현재 픽셀 위치를 기준으로 타일 인덱스 계산
        let currentTileX = drone.x / TILE_SIZE;

        if (currentTileX >= endX) {
          direction = -1;
        } else if (currentTileX <= startX) {
          direction = 1;
        }

        // 부드러운 움직임을 위해 픽셀 단위로 이동
        drone.x += direction * 1.5 * delta;
      }
    });
  }

  /**
   * 렌더 루프에서 호출되는 업데이트 함수 (게임 로직)
   * @param delta 시간 변화량 (PixiJS Ticker에서 제공)
   */
  private update(delta: Ticker): void {
    // 여기에 게임 유닛의 충돌 처리, 상태 업데이트 등의 로직을 구현합니다.
    // 예: 움직이는 유닛이 적과 충돌했는지 확인 등
  }

  // (선택 사항) 맵의 다른 상태를 변경하거나 유닛을 제거하는 메소드 추가 가능
}
