안녕하세요! PixiJS를 사용하여 TypeScript 환경에서 게임 유닛들을 정의하고 맵에 그리는 코드를 작성해 드리겠습니다.

제공해주신 사양을 바탕으로 유닛 타입들을 정의하고, 각 유닛을 PixiJS의 Graphics와 Text 객체를 사용하여 간단한 사각형과 텍스트로 표현하는 클래스 구조를 만들겠습니다.

🚀 PixiJS 유닛 렌더링 코드 (TypeScript)
이 코드는 유닛 정보를 담는 UnitSpec 인터페이스와, 이를 바탕으로 PixiJS 컨테이너에 유닛을 그리는 UnitRenderer 클래스로 구성됩니다.

1. 유닛 사양 정의 (unit-specs.ts)
제공해주신 표 정보를 기반으로 유닛의 시각적 속성을 정의합니다.

// unit-specs.ts

/**
 * 게임 유닛의 시각적 및 논리적 속성을 정의하는 인터페이스.
 * 배경색, 테두리, 표시할 알파벳 등을 포함합니다.
 */
export interface UnitSpec {
    /** 유닛의 고유 ID (예: 'tile-plain', 'mountain', 'resource-A') */
    id: string;
    /** 유닛이 속한 카테고리 (예: '타일', '자원', '아군 유닛') */
    category: string;
    /** 유닛의 이름 (예: '일반적인 빈 땅', '산', '생산 및 자원 운반 드론') */
    name: string;
    /** 배경 색상 (PixiJS에서 사용할 수 있도록 0x로 변환된 hex code) */
    backgroundColor: number;
    /** 테두리 굵기 (픽셀) */
    borderThickness: number;
    /** 유닛 중앙에 표시할 알파벳/숫자 */
    letter: string;
    /** 유닛에 대한 설명 */
    description: string;
}

// Color Code string을 PixiJS에서 사용하는 number 타입으로 변환하는 헬퍼 함수
const hexToNumber = (hex: string): number => {
    // #을 제거하고 16진수로 파싱
    return parseInt(hex.replace('#', ''), 16);
};

```
/**
 * 게임 내 모든 유닛 타입에 대한 사양 정의.
 */
export const UNIT_SPECS: UnitSpec[] = [
    // --- 타일 ---
    { id: 'tile-plain', category: '타일', name: '일반적인 빈 땅', backgroundColor: hexToNumber('#CCCCCC'), borderThickness: 0, letter: '', description: '가장 기본적인 타일.' },
    { id: 'tile-mountain', category: '타일', name: '적도 아군도 지나갈 수 없는 산', backgroundColor: hexToNumber('#555555'), borderThickness: 2, letter: 'M', description: '통과 불가능. 시각적으로 확실히 구분.' },

    // --- 자원 (간단히 3가지만 예시로) ---
    { id: 'resource-A', category: '자원', name: '자원 A (철)', backgroundColor: hexToNumber('#CCCC00'), borderThickness: 1, letter: 'A', description: '자원 종류 A.' },
    { id: 'resource-B', category: '자원', name: '자원 B (금)', backgroundColor: hexToNumber('#CCAA00'), borderThickness: 1, letter: 'B', description: '자원 종류 B.' },
    { id: 'resource-C', category: '자원', name: '자원 C (석탄)', backgroundColor: hexToNumber('#C0C000'), borderThickness: 1, letter: 'C', description: '자원 종류 C.' },

    // --- 구조물 ---
    { id: 'structure-combiner-1', category: '구조물', name: '자원 조합기 (1단계)', backgroundColor: hexToNumber('#009900'), borderThickness: 2, letter: 'C1', description: '자원 조합기 1단계.' },
    { id: 'structure-combiner-5', category: '구조물', name: '자원 조합기 (5단계)', backgroundColor: hexToNumber('#33CC33'), borderThickness: 5, letter: 'C5', description: '자원 조합기 5단계.' },
    { id: 'structure-processor-1', category: '구조물', name: '자원 가공기 (1단계)', backgroundColor: hexToNumber('#0000CC'), borderThickness: 2, letter: 'P1', description: '자원 가공기 1단계.' },
    { id: 'structure-processor-5', category: '구조물', name: '자원 가공기 (5단계)', backgroundColor: hexToNumber('#3333FF'), borderThickness: 5, letter: 'P5', description: '자원 가공기 5단계.' },

    // --- 아군 유닛 ---
    { id: 'unit-drone', category: '아군 유닛', name: '생산 및 자원 운반 드론', backgroundColor: hexToNumber('#FFFFFF'), borderThickness: 1, letter: 'D', description: '움직이는 유닛.' },

    // --- 적 ---
    { id: 'enemy-1', category: '적', name: '적 (레벨 1)', backgroundColor: hexToNumber('#CC0000'), borderThickness: 1, letter: 'E1', description: '적 레벨 1.' },
    { id: 'enemy-10', category: '적', name: '적 (레벨 10)', backgroundColor: hexToNumber('#660000'), borderThickness: 5, letter: 'E10', description: '적 레벨 10.' },

    // --- 부산물 (간단히 2가지만 예시로) ---
    { id: 'byproduct-1', category: '부산물', name: '부산물 O1', backgroundColor: hexToNumber('#FF9900'), borderThickness: 1, letter: 'O1', description: '부산물 종류 1.' },
    { id: 'byproduct-2', category: '부산물', name: '부산물 O2', backgroundColor: hexToNumber('#FF7700'), borderThickness: 1, letter: 'O2', description: '부산물 종류 2.' },

    // --- 방어 구조물 ---
    { id: 'defense-tower-1', category: '방어 구조물', name: '타워 (레벨 1)', backgroundColor: hexToNumber('#9900CC'), borderThickness: 2, letter: 'T1', description: '타워 레벨 1.' },
    { id: 'defense-tower-10', category: '방어 구조물', name: '타워 (레벨 10)', backgroundColor: hexToNumber('#CC66FF'), borderThickness: 5, letter: 'T10', description: '타워 레벨 10.' },
];
```

2. 유닛 렌더러 구현 (UnitRenderer.ts)
PixiJS를 사용하여 실제로 유닛을 그리는 클래스입니다. 각 유닛은 하나의 사각형과 그 위에 텍스트로 표현됩니다.

```
// UnitRenderer.ts
import * as PIXI from 'pixi.js';
import { UnitSpec, UNIT_SPECS } from './unit-specs'; // 위의 정의 파일에서 import

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
        
        const spec = UNIT_SPECS.find(s => s.id === unitId);
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
                fontFamily: 'Arial',
                fontSize: size * 0.4, // 타일 크기의 40% 정도 크기
                fill: 0x000000, // 텍스트 색상 (검은색)
                align: 'center',
                fontWeight: 'bold',
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
```

3. 메인 애플리케이션 예시 (main.ts)
실제 PixiJS 애플리케이션을 설정하고 유닛들을 맵에 배치하는 예제입니다.


```
// main.ts
import * as PIXI from 'pixi.js';
import { UnitRenderer } from './UnitRenderer';
import { UNIT_SPECS } from './unit-specs';

const TILE_SIZE = 50; // 각 타일/유닛의 크기 (50x50 픽셀)
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

// PixiJS 애플리케이션 초기화
const app = new PIXI.Application({ 
    width: MAP_WIDTH, 
    height: MAP_HEIGHT, 
    backgroundColor: 0xAAAAAA // 앱 배경색
});

document.body.appendChild(app.view as HTMLCanvasElement);

// 유닛들을 담을 메인 컨테이너
const mapContainer = new PIXI.Container();
app.stage.addChild(mapContainer);

/**
 * 맵에 유닛들을 배치하는 함수
 */
function placeUnitsOnMap() {
    // 모든 유닛 사양을 가져와서 맵에 배치
    const unitsToRender = UNIT_SPECS.filter(spec => spec.id !== 'tile-plain'); // 빈 타일은 제외하고 배치

    let mapX = 0;
    let mapY = 0;

    unitsToRender.forEach((spec, index) => {
        // UnitRenderer 인스턴스 생성
        const unit = new UnitRenderer(spec.id, TILE_SIZE);
        
        // 맵 좌표 설정
        unit.setMapPosition(mapX, mapY);
        
        // 맵 컨테이너에 추가
        mapContainer.addChild(unit);

        // 다음 유닛 위치 계산
        mapX++;
        // 맵 폭을 넘어가면 다음 줄로 이동
        if (mapX * TILE_SIZE > MAP_WIDTH - TILE_SIZE) {
            mapX = 0;
            mapY++;
        }
        
        // 맵 높이를 넘어가면 중단 (예제이므로)
        if (mapY * TILE_SIZE >= MAP_HEIGHT) {
            console.log("Not all units fit on map demo.");
            return;
        }
    });
    
    // (선택 사항) 맵 중앙에 배치
    mapContainer.x = (MAP_WIDTH - mapX * TILE_SIZE) / 2;
}

// 맵에 유닛 배치 시작
placeUnitsOnMap();

// 유닛 움직임 예시 (드론)
const droneSpec = UNIT_SPECS.find(s => s.id === 'unit-drone');
if (droneSpec) {
    const drone = new UnitRenderer(droneSpec.id, TILE_SIZE);
    drone.setMapPosition(1, 8); // (1, 8) 위치에 드론 배치
    mapContainer.addChild(drone);

    let direction = 1; // 1: 오른쪽, -1: 왼쪽
    const startX = 1;
    const endX = 10;
    
    app.ticker.add((delta) => {
        // 드론의 현재 타일 X 위치를 기준으로 이동 로직 구현
        let currentTileX = Math.round(drone.x / TILE_SIZE);

        if (currentTileX >= endX) {
            direction = -1;
        } else if (currentTileX <= startX) {
            direction = 1;
        }

        // 부드러운 움직임을 위해 픽셀 단위로 이동
        drone.x += direction * 2 * delta; 
        
        // 유닛의 위치가 타일 경계를 벗어났을 때 렌더링되는 사각형의 중심 텍스트가 
        // 흐릿해지는 것을 방지하기 위해 정수로 반올림
        drone.x = Math.round(drone.x * 10) / 10;
    });
}
```

예상 결과
위의 코드를 실행하면 다음과 같이 정의된 속성에 따라 렌더링된 유닛들이 그리드 형태로 배치된 것을 볼 수 있습니다.

배경 색상: 각 유닛의 배경색 코드에 따라 채워집니다.

테두리: borderThickness에 따라 테두리 굵기가 다르게 표시됩니다. (예: C5는 굵게, A는 얇게)

알파벳: 각 유닛의 중앙에 정의된 알파벳(예: M, C1, D, E10)이 표시됩니다.

다음 단계로 어떤 작업을 원하시나요?

특정 유닛의 색상/테두리 스타일을 미세하게 조정해 드릴까요?

맵의 그리드 라인을 추가하여 타일 경계를 더 명확하게 표시해 드릴까요?

특정 유닛(예: 드론)의 사용자 입력에 따른 이동 로직 구현을 도와드릴까요?