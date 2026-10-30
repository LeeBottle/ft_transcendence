import { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  PBRMaterial,
  Color3,
  DirectionalLight,
  HemisphericLight,
  UniversalCamera,
  Mesh,
  DynamicTexture,
  Vector4,
  Quaternion,
  PointerEventTypes,
} from '@babylonjs/core';

interface Dice3DCanvasProps {
  dice: number[];
  held: boolean[];
  onToggleHold: (index: number) => void;
  isMyTurn: boolean;
  rollsLeft: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 🎯 결정론적 의사 난수 생성기 (Mulberry32)
// A와 B가 동일한 seed를 받으면 100% 동일한 난수 수열을 생성합니다.
function createSeededRandom(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t >>> 0) / 4294967296;
  };
}

// 주사위 눈금 및 턴/남은 굴림 횟수 기반 시드 산출
function getDiceRollSeed(dice: number[], rollsLeft: number): number {
  let s = 17;
  for (let i = 0; i < dice.length; i++) {
    s = (s * 31 + (dice[i] || 1)) | 0;
  }
  s = (s * 31 + rollsLeft) | 0;
  return s;
}

// 🎲 매 굴림마다 테이블 전역에 자유롭고 다양하게 흩어지도록 하는 결정론적 동적 분포 생성기
// (주사위끼리 겹치지 않으면서도, 굴릴 때마다 완전히 다른 위치로 흩어지며 A/B 양쪽 화면에서 100% 동일함)
function generateDynamicScatterPositions(rng: () => number, count: number): Vector3[] {
  const positions: Vector3[] = [];
  const minDistance = 1.45; // 주사위끼리 겹치지 않는 최소 안전 거리 (주사위 크기 1.15)
  const BOUND_X = 3.2;
  const BOUND_Z = 2.8;

  // 이번 굴림의 메인 투척 군집 중심점 (테이블 위 임의의 위치로 매번 달라짐)
  const centerX = (rng() - 0.5) * 2.4;
  const centerZ = (rng() - 0.5) * 2.0;

  for (let i = 0; i < count; i++) {
    let placed = false;
    let attempts = 0;
    let pos = new Vector3(0, 0.55, 0);

    while (!placed && attempts < 60) {
      attempts++;
      // 중심점 주변으로 무작위 방사형 각도 및 거리로 자유롭게 흩어짐
      const angle = rng() * Math.PI * 2;
      const radius = 0.6 + rng() * 2.4;
      const x = Math.max(-BOUND_X, Math.min(BOUND_X, centerX + Math.cos(angle) * radius));
      const z = Math.max(-BOUND_Z, Math.min(BOUND_Z, centerZ + Math.sin(angle) * radius));
      pos = new Vector3(x, 0.55, z);

      // 기존에 배치된 다른 주사위들과 너무 가까우면 재배치 (충돌 및 겹침 방지)
      const isTooClose = positions.some((other) => Vector3.Distance(pos, other) < minDistance);
      if (!isTooClose) {
        placed = true;
      }
    }

    positions.push(pos);
  }

  return positions;
}

// 1~6 점 다이내믹 텍스처 생성
const createDiceTexture = (scene: Scene): DynamicTexture => {
  const textureSize = 1536;
  const faceSize = 256;
  const dynamicTexture = new DynamicTexture('diceTexture', { width: textureSize, height: faceSize }, scene, false);
  const ctx = dynamicTexture.getContext();

  const dotPositions: Record<number, number[][]> = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.25, 0.2], [0.75, 0.2], [0.25, 0.5], [0.75, 0.5], [0.25, 0.8], [0.75, 0.8]],
  };

  for (let num = 1; num <= 6; num++) {
    const offsetX = (num - 1) * faceSize;

    // 부드러운 상아색 주사위 바탕
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(offsetX, 0, faceSize, faceSize);

    // 테두리 라운딩 음영
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 4;
    ctx.strokeRect(offsetX + 2, 2, faceSize - 4, faceSize - 4);

    // 주사위 눈 (1점은 붉은색, 나머지는 흑단색)
    ctx.fillStyle = num === 1 ? '#d90429' : '#111827';
    const dots = dotPositions[num];
    const dotRadius = num === 1 ? 26 : 20;

    for (const [nx, ny] of dots) {
      const cx = offsetX + nx * faceSize;
      const cy = ny * faceSize;
      ctx.beginPath();
      ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  dynamicTexture.update();
  return dynamicTexture;
};

// 주사위 눈금 번호가 +Y(윗면)을 향하도록 만드는 정확한 쿼터니언 매핑
const valToLocalNormal: Record<number, Vector3> = {
  1: new Vector3(0, 0, 1),   // +Z
  6: new Vector3(0, 0, -1),  // -Z
  2: new Vector3(1, 0, 0),   // +X
  5: new Vector3(-1, 0, 0),  // -X
  3: new Vector3(0, 1, 0),   // +Y
  4: new Vector3(0, -1, 0),  // -Y
};

const getTargetQuaternion = (targetVal: number): Quaternion => {
  const localDir = valToLocalNormal[targetVal] || new Vector3(0, 1, 0);
  const q = new Quaternion();
  Quaternion.FromUnitVectorsToRef(localDir, Vector3.Up(), q);
  return q;
};

// 🎯 주사위 1개당 결정론적 수학 궤적 정의
interface DiceTrajectory {
  startPos: Vector3;
  midPos: Vector3;
  endPos: Vector3;
  rotAxis: Vector3;
  spinSpeed: number;
  initialQuat: Quaternion;
  targetQuat: Quaternion;
}

export default function Dice3DCanvas({
  dice,
  held,
  onToggleHold,
  isMyTurn,
  rollsLeft,
  isRolling,
  onRollComplete,
}: Dice3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const diceMeshesRef = useRef<Mesh[]>([]);

  const diceRef = useRef(dice);
  const heldRef = useRef(held);
  const isMyTurnRef = useRef(isMyTurn);
  const rollsLeftRef = useRef(rollsLeft);
  const onToggleHoldRef = useRef(onToggleHold);
  const onRollCompleteRef = useRef(onRollComplete);

  // 결정론적 애니메이션 상태 Ref
  const isAnimatingRef = useRef(false);
  const animStartTimeRef = useRef(0);
  const trajectoriesRef = useRef<DiceTrajectory[]>([]);

  diceRef.current = dice;
  heldRef.current = held;
  isMyTurnRef.current = isMyTurn;
  rollsLeftRef.current = rollsLeft;
  onToggleHoldRef.current = onToggleHold;
  onRollCompleteRef.current = onRollComplete;

  // 1. Scene & 3D Environment Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDisposed = false;

    const initBabylon = async () => {
      const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
      engineRef.current = engine;

      const scene = new Scene(engine);
      sceneRef.current = scene;
      // 🌿 원래의 고급스러운 카지노/보드게임 펠트 초록색 계열 배경
      scene.clearColor = new Color3(0.10, 0.24, 0.16).toColor4();

      // 🎥 카메라 기울기 조절: 텅 빈 검은 벽면이 보이지 않고 바닥이 꽉 차도록 안정적인 시점으로 보정 (pos: 0, 13.5, -1.8)
      const camera = new UniversalCamera('camera', new Vector3(0, 13.5, -1.8), scene);
      camera.setTarget(new Vector3(0, 0, 0.1));

      // 조명 설정 (초록 펠트가 은은하고 선명하게 보이도록)
      const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
      hemiLight.intensity = 0.85;

      const dirLight = new DirectionalLight('dirLight', new Vector3(-0.3, -1, 0.4), scene);
      dirLight.position = new Vector3(3, 14, -3);
      dirLight.intensity = 1.2;

      // 🌿 원래의 초록색 펠트 보드게임 바닥 복원 (화면 밖 텅 빈 공간이 전혀 안 보이도록 24x24 넉넉한 크기 적용)
      const ground = MeshBuilder.CreateBox('ground', { width: 24, height: 0.5, depth: 24 }, scene);
      ground.position.y = -0.25;
      const groundMat = new PBRMaterial('groundMat', scene);
      groundMat.albedoColor = new Color3(0.15, 0.38, 0.24); // 원래의 초록색 계열 펠트 컬러
      groundMat.roughness = 0.75;
      groundMat.metallic = 0.05;
      ground.material = groundMat;

      // 주사위 텍스처
      const diceTexture = createDiceTexture(scene);
      const diceMat = new PBRMaterial('diceMat', scene);
      diceMat.albedoTexture = diceTexture;
      diceMat.roughness = 0.4;
      diceMat.metallic = 0.05;

      const faceUV: Vector4[] = new Array(6);
      const faceOrder = [1, 6, 2, 5, 3, 4];
      for (let i = 0; i < 6; i++) {
        const num = faceOrder[i];
        faceUV[i] = new Vector4((num - 1) / 6, 0, num / 6, 1);
      }

      diceMeshesRef.current = [];

      // 5개 주사위 메시 생성 (기본 1열 대기 배치)
      const spacing = 1.6;
      const startX = -((5 - 1) * spacing) / 2;

      for (let i = 0; i < 5; i++) {
        const diceMesh = MeshBuilder.CreateBox(`dice_${i}`, { size: 1.15, faceUV }, scene);
        diceMesh.material = diceMat;
        diceMesh.isVisible = !heldRef.current[i];

        const posX = startX + i * spacing;
        diceMesh.position.set(posX, 0.55, 0);

        const targetVal = diceRef.current[i] || 1;
        diceMesh.rotationQuaternion = getTargetQuaternion(targetVal);

        diceMeshesRef.current.push(diceMesh);
      }

      // 🎯 [핵심] 매 프레임 결정론적 수학 궤적 계산 렌더 루프
      scene.onBeforeRenderObservable.add(() => {
        if (!isAnimatingRef.current || trajectoriesRef.current.length === 0) return;

        const DURATION = 1350; // 총 굴림 시간 1.35초
        const elapsed = Date.now() - animStartTimeRef.current;
        const progress = Math.min(elapsed / DURATION, 1.0);

        trajectoriesRef.current.forEach((traj, idx) => {
          if (heldRef.current[idx]) return;

          const mesh = diceMeshesRef.current[idx];
          if (!mesh) return;

          // 1) X, Z 수평 이동 (출발 -> 중간 튕김 -> 최종 안착 베지어 보간)
          const t = progress;
          const oneMinusT = 1 - t;
          const posX = oneMinusT * oneMinusT * traj.startPos.x + 2 * oneMinusT * t * traj.midPos.x + t * t * traj.endPos.x;
          const posZ = oneMinusT * oneMinusT * traj.startPos.z + 2 * oneMinusT * t * traj.midPos.z + t * t * traj.endPos.z;

          // 2) Y 수직 바운스 물리 포물선 곡선 (3단계 튕김)
          let posY = 0.55;
          if (t < 0.45) {
            // 1단계: 높은 공중에서 첫 번째 바닥 낙하 (4.2 -> 0.55)
            const p1 = t / 0.45;
            posY = 0.55 + (1 - p1 * p1) * (traj.startPos.y - 0.55);
          } else if (t < 0.8) {
            // 2단계: 첫 번째 튕김 바운스 (최대 높이 1.8)
            const p2 = (t - 0.45) / 0.35;
            posY = 0.55 + Math.sin(p2 * Math.PI) * 1.5;
          } else if (t < 1.05) {
            // 3단계: 두 번째 잔 튕김 (최대 높이 0.5)
            const p3 = (t - 0.8) / 0.25;
            posY = 0.55 + Math.sin(p3 * Math.PI) * 0.45;
          } else {
            // 4단계: 바닥에 닿아 부드럽게 미끄러지며 안착
            posY = 0.55;
          }

          mesh.position.set(posX, posY, posZ);

          // 3) 회전 궤적: 고속 스핀 회전 -> 목표 쿼터니언(서버 결과)으로 부드러운 Slerp 착지
          if (t < 0.65) {
            // 초반: 축 기준 고속 회전
            const angle = t * traj.spinSpeed * Math.PI * 2;
            const spinQuat = Quaternion.RotationAxis(traj.rotAxis, angle);
            mesh.rotationQuaternion = spinQuat.multiply(traj.initialQuat);
          } else {
            // 후반: 착지 감속하며 목표 눈금 쿼터니언으로 완벽 수렴
            const slerpT = Math.min((t - 0.65) / 0.35, 1.0);
            if (!mesh.rotationQuaternion) {
              mesh.rotationQuaternion = Quaternion.Identity();
            }
            Quaternion.SlerpToRef(mesh.rotationQuaternion, traj.targetQuat, slerpT * 0.35, mesh.rotationQuaternion);
          }
        });

        // 애니메이션 완료 처리
        if (progress >= 1.0) {
          isAnimatingRef.current = false;

          // 모든 굴린 주사위를 정확히 최종 앵커 위치 및 목표 각도에 고정
          trajectoriesRef.current.forEach((traj, idx) => {
            if (!heldRef.current[idx]) {
              const mesh = diceMeshesRef.current[idx];
              if (mesh) {
                mesh.position.copyFrom(traj.endPos);
                mesh.rotationQuaternion = traj.targetQuat.clone();
              }
            }
          });

          if (onRollCompleteRef.current) {
            onRollCompleteRef.current();
          }
        }
      });

      // 클릭 시 KEEP 토글 (굴리기가 1회 이상 진행된 경우: rollsLeft < 3)
      scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
          const pickResult = pointerInfo.pickInfo;
          if (pickResult && pickResult.hit && pickResult.pickedMesh) {
            const pickedName = pickResult.pickedMesh.name;
            if (pickedName.startsWith('dice_')) {
              const index = parseInt(pickedName.split('_')[1], 10);
              if (
                !isNaN(index) &&
                isMyTurnRef.current &&
                rollsLeftRef.current > 0 &&
                rollsLeftRef.current < 3 &&
                !isAnimatingRef.current
              ) {
                onToggleHoldRef.current(index);
              }
            }
          }
        }
      });

      engine.runRenderLoop(() => {
        if (!isDisposed) {
          scene.render();
        }
      });
    };

    initBabylon();

    const handleResize = () => {
      engineRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      sceneRef.current?.dispose();
      engineRef.current?.dispose();
    };
  }, []);

  // 2. 🎯 [핵심] 주사위 굴림(isRolling) 발생 시 100% 동일한 수학적 궤적 생성
  useEffect(() => {
    if (!isRolling || diceMeshesRef.current.length === 0) return;

    // A와 B가 100% 동일한 시드를 계산
    const rollSeed = getDiceRollSeed(diceRef.current, rollsLeftRef.current);
    const rng = createSeededRandom(rollSeed);

    const activeIndices = diceMeshesRef.current
      .map((_, idx) => idx)
      .filter((idx) => !heldRef.current[idx]);

    const activeCount = activeIndices.length;
    const spacing = 1.4;
    const activeStartX = -((Math.max(activeCount, 1) - 1) * spacing) / 2;

    // 🎲 굴릴 때마다 테이블 전역에 매번 새롭고 다양하게 흩어지는 5개 안착 좌표 생성 (A, B 100% 동일)
    const dynamicScatterPositions = generateDynamicScatterPositions(rng, 5);

    const newTrajectories: DiceTrajectory[] = [];

    for (let idx = 0; idx < 5; idx++) {
      const mesh = diceMeshesRef.current[idx];
      const isHeld = heldRef.current[idx];

      if (isHeld) {
        mesh.isVisible = false;
        newTrajectories.push({
          startPos: mesh.position.clone(),
          midPos: mesh.position.clone(),
          endPos: mesh.position.clone(),
          rotAxis: Vector3.Up(),
          spinSpeed: 0,
          initialQuat: mesh.rotationQuaternion || Quaternion.Identity(),
          targetQuat: mesh.rotationQuaternion || Quaternion.Identity(),
        });
      } else {
        mesh.isVisible = true;

        const activeOrder = activeIndices.indexOf(idx);

        // 시드 기반 공중 시작 위치 (A, B 100% 동일)
        const startX = activeStartX + activeOrder * spacing + (rng() - 0.5) * 0.6;
        const startY = 4.2 + rng() * 0.8;
        const startZ = -2.4 + (rng() - 0.5) * 0.8;
        const startPos = new Vector3(startX, startY, startZ);

        // 시드 기반 최종 안착 위치 (매 굴림마다 사방으로 다이나믹하게 흩어짐!)
        const endPos = dynamicScatterPositions[idx];

        // 시드 기반 중간 바운스 위치 (출발점과 도착점 사이에서 자연스럽게 튕김)
        const midX = (startPos.x + endPos.x) / 2 + (rng() - 0.5) * 1.5;
        const midZ = (startPos.z + endPos.z) / 2 + (rng() - 0.5) * 1.5;
        const midPos = new Vector3(midX, 0.55, midZ);

        // 시드 기반 회전축 및 스핀 속도 (A, B 100% 동일)
        const rotAxis = new Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
        const spinSpeed = 4.5 + rng() * 2.5;

        // 초기 쿼터니언 및 최종 목표 쿼터니언 (서버 눈금값)
        const initialQuat = Quaternion.RotationYawPitchRoll(
          rng() * Math.PI * 2,
          rng() * Math.PI * 2,
          rng() * Math.PI * 2
        );
        const targetVal = diceRef.current[idx] || 1;
        const targetQuat = getTargetQuaternion(targetVal);

        newTrajectories.push({
          startPos,
          midPos,
          endPos,
          rotAxis,
          spinSpeed,
          initialQuat,
          targetQuat,
        });
      }
    }

    trajectoriesRef.current = newTrajectories;
    animStartTimeRef.current = Date.now();
    isAnimatingRef.current = true;
  }, [isRolling]);

  // 3. 주사위 눈금 및 가시성 동기화 (턴 시작 또는 비애니메이션 상태)
  useEffect(() => {
    if (isRolling || isAnimatingRef.current) return;

    const isNewTurn = rollsLeft === 3;

    if (isNewTurn) {
      // 턴 시작 시 1열 정돈 배치
      const spacing = 1.6;
      const startX = -((5 - 1) * spacing) / 2;

      diceMeshesRef.current.forEach((mesh, idx) => {
        mesh.isVisible = true;
        const targetVal = dice[idx] || 1;
        const targetQuat = getTargetQuaternion(targetVal);
        const posX = startX + idx * spacing;

        mesh.position.set(posX, 0.55, 0);
        mesh.rotationQuaternion = targetQuat;
      });
    } else {
      // 굴림 후: 각 주사위 가시성 및 눈금 유지
      diceMeshesRef.current.forEach((mesh, idx) => {
        const isHeld = held[idx];
        mesh.isVisible = !isHeld;

        const targetVal = dice[idx] || 1;
        mesh.rotationQuaternion = getTargetQuaternion(targetVal);
      });
    }
  }, [dice, held, rollsLeft, isRolling]);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', outline: 'none', touchAction: 'none' }}
      />
    </div>
  );
}
