import React, { useEffect, useRef } from 'react';
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
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsMotionType,
  Mesh,
  DynamicTexture,
  Vector4,
  Quaternion,
  PointerEventTypes,
} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import havokWasmUrl from '@babylonjs/havok/lib/esm/HavokPhysics.wasm?url';

interface Dice3DCanvasProps {
  dice: number[];
  held: boolean[];
  onToggleHold: (index: number) => void;
  isMyTurn: boolean;
  rollsLeft: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 1~6 점 다이내믹 텍스처 생성 (temp.txt 동일)
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
    const startX = (num - 1) * faceSize;
    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(startX, 0, faceSize, faceSize);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 4;
    ctx.strokeRect(startX + 2, 2, faceSize - 4, faceSize - 4);

    ctx.fillStyle = num === 1 ? '#d62828' : '#1d3557';
    const dots = dotPositions[num];
    const dotRadius = faceSize * 0.09;

    dots.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(startX + px * faceSize, py * faceSize, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  dynamicTexture.update();
  return dynamicTexture;
};

// 1~6 주사위 면 맵핑 (temp.txt와 일치)
const valToLocalNormal: Record<number, Vector3> = {
  1: new Vector3(0, 0, 1),   // 1-dot face (+Z Front)
  6: new Vector3(0, 0, -1),  // 6-dot face (-Z Back)
  2: new Vector3(1, 0, 0),   // Right (+X)
  5: new Vector3(-1, 0, 0),  // Left (-X)
  3: new Vector3(0, 1, 0),   // Top (+Y)
  4: new Vector3(0, -1, 0),  // Bottom (-Y)
};

const getTargetQuaternion = (targetVal: number): Quaternion => {
  const localDir = valToLocalNormal[targetVal] || new Vector3(0, 1, 0);
  const q = new Quaternion();
  Quaternion.FromUnitVectorsToRef(localDir, Vector3.Up(), q);
  return q;
};

// temp.txt 원본 getDiceTopValue 함수
export const getDiceTopValue = (diceMesh: Mesh): number => {
  const localNormals = [
    { normal: new Vector3(0, 0, 1), val: 1 },  // (+Z) = 1
    { normal: new Vector3(0, 0, -1), val: 6 }, // (-Z) = 6
    { normal: new Vector3(1, 0, 0), val: 2 },  // Right (+X)
    { normal: new Vector3(-1, 0, 0), val: 5 }, // Left (-X)
    { normal: new Vector3(0, 1, 0), val: 3 },  // Top (+Y)
    { normal: new Vector3(0, -1, 0), val: 4 }  // Bottom (-Y)
  ];

  const rotationQuat = diceMesh.rotationQuaternion || Quaternion.FromEulerVector(diceMesh.rotation);

  let maxDot = -Infinity;
  let topValue = 1;

  const worldUp = Vector3.Up();

  for (const face of localNormals) {
    const worldNormal = Vector3.Zero();
    face.normal.rotateByQuaternionToRef(rotationQuat, worldNormal);

    const dot = Vector3.Dot(worldNormal, worldUp);

    if (dot > maxDot) {
      maxDot = dot;
      topValue = face.val;
    }
  }

  return topValue;
};

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
  const diceObjectsRef = useRef<{ mesh: Mesh; aggregate: PhysicsAggregate }[]>([]);

  const diceRef = useRef(dice);
  const heldRef = useRef(held);
  const isMyTurnRef = useRef(isMyTurn);
  const rollsLeftRef = useRef(rollsLeft);
  const onToggleHoldRef = useRef(onToggleHold);
  const isRollingInternalRef = useRef(false);
  const onRollCompleteRef = useRef(onRollComplete);
  const rollStartTimeRef = useRef(0);

  diceRef.current = dice;
  heldRef.current = held;
  isMyTurnRef.current = isMyTurn;
  rollsLeftRef.current = rollsLeft;
  onToggleHoldRef.current = onToggleHold;
  onRollCompleteRef.current = onRollComplete;

  // Scene initialization (temp.txt 원본 파라미터 복구)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine;
    let scene: Scene;
    let isDisposed = false;

    const initBabylon = async () => {
      engine = new Engine(canvas, true);
      engineRef.current = engine;

      scene = new Scene(engine);
      sceneRef.current = scene;
      scene.clearColor = new Color3(0.08, 0.08, 0.12).toColor4();

      // 카메라 설정 (UniversalCamera, 1:1 정사각형 보드가 한눈에 들어오는 시점 pos: 0, 14, 0)
      const camera = new UniversalCamera('topCamera', new Vector3(0, 14, 0), scene);
      camera.setTarget(Vector3.Zero());

      // temp.txt 조명 설정
      const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
      hemiLight.intensity = 0.6;

      const dirLight = new DirectionalLight('dirLight', new Vector3(-0.5, -1, -0.5), scene);
      dirLight.position = new Vector3(5, 12, 5);
      dirLight.intensity = 1.2;

      // Havok Physics
      const havokInstance = await HavokPhysics({
        locateFile: () => havokWasmUrl,
      });
      if (isDisposed) return;

      const hk = new HavokPlugin(true, havokInstance);
      scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

      // 1:1 정사각형 화면에 맞춘 바닥 및 경계벽 설정 (groundSize: 10, 벽 1단위 안쪽 배치)
      const groundSize = 10;
      const halfSize = groundSize / 2; // 5.0

      const ground = MeshBuilder.CreateBox('ground', { width: 12, height: 0.4, depth: 12 }, scene);
      ground.position.y = -0.25;

      const groundMat = new PBRMaterial('groundMat', scene);
      groundMat.albedoColor = new Color3(0.15, 0.35, 0.25);
      groundMat.roughness = 0.8;
      ground.material = groundMat;

      new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, restitution: 0.1 }, scene);

      // 벽 설정 (높이: 15, 두께: 0.5, 반발력: 0.2) - 기존 대비 안쪽(±4.8)으로 ±1 줄여 화면 밖 이탈 완벽 차단
      const wallThickness = 0.5;
      const wallHeight = 15;
      const createWall = (x: number, z: number, w: number, d: number) => {
        const wall = MeshBuilder.CreateBox('wall', { width: w, height: wallHeight, depth: d }, scene);
        wall.position.set(x, wallHeight / 2 - 0.25, z);
        wall.isVisible = false;
        new PhysicsAggregate(wall, PhysicsShapeType.BOX, { mass: 0, restitution: 0.2 }, scene);
      };

      const wallOffset = halfSize - wallThickness / 2; // 4.75
      const wallLen = groundSize + wallThickness * 2;
      createWall(0, wallOffset, wallLen, wallThickness);   // North (+Z)
      createWall(0, -wallOffset, wallLen, wallThickness);  // South (-Z)
      createWall(wallOffset, 0, wallThickness, wallLen);   // East (+X)
      createWall(-wallOffset, 0, wallThickness, wallLen);  // West (-X)

      // 천장 설정 (높이: 6, restitution: 0.1) - 공중 뛰어오름 방지
      const ceilingHeight = 6;
      const ceiling = MeshBuilder.CreateBox('ceiling', { width: wallLen, height: 0.5, depth: wallLen }, scene);
      ceiling.position.y = ceilingHeight;
      ceiling.isVisible = false;
      new PhysicsAggregate(ceiling, PhysicsShapeType.BOX, { mass: 0, restitution: 0.1 }, scene);

      // temp.txt 주사위 재질 설정 (diceMat: roughness: 0.2, metallic: 0.05)
      const diceTexture = createDiceTexture(scene);
      const diceMat = new PBRMaterial('diceMat', scene);
      diceMat.albedoTexture = diceTexture;
      diceMat.roughness = 1.0;
      diceMat.metallic = 0.0;

      // temp.txt localNormals (+Z=1, -Z=6)에 정확히 매칭되도록 faceOrder = [1, 6, 2, 5, 3, 4] 설정
      // Index 0 (+Z, Front): 1
      // Index 1 (-Z, Back): 6
      // Index 2 (+X, Right): 2
      // Index 3 (-X, Left): 5
      // Index 4 (+Y, Top): 3
      // Index 5 (-Y, Bottom): 4
      const faceUV: Vector4[] = new Array(6);
      const faceOrder = [1, 6, 2, 5, 3, 4];
      for (let i = 0; i < 6; i++) {
        const num = faceOrder[i];
        faceUV[i] = new Vector4((num - 1) / 6, 0, num / 6, 1);
      }

      diceObjectsRef.current = [];

      const spacing = 2.0;
      const startX = -((5 - 1) * spacing) / 2;

      for (let i = 0; i < 5; i++) {
        // temp.txt 주사위 크기 size: 1.1
        const diceMesh = MeshBuilder.CreateBox(`dice_${i}`, { size: 1.2, faceUV }, scene);
        diceMesh.material = diceMat;
        diceMesh.isVisible = !heldRef.current[i];

        const posX = startX + i * spacing;
        diceMesh.position.set(posX, 0.55, 0);

        const targetVal = diceRef.current[i] || 1;
        diceMesh.rotationQuaternion = getTargetQuaternion(targetVal);

        // 자연스러운 3D 바운스를 위한 물리 파라미터 (restitution: 0.35, friction: 0.5)
        const aggregate = new PhysicsAggregate(
          diceMesh,
          PhysicsShapeType.BOX,
          { mass: 1, restitution: 0.35, friction: 0.5 },
          scene
        );

        aggregate.body.setLinearDamping(0.5);
        aggregate.body.setAngularDamping(0.5);
        aggregate.body.disablePreStep = false;
        aggregate.body.setMotionType(PhysicsMotionType.STATIC);

        diceObjectsRef.current.push({ mesh: diceMesh, aggregate });
      }

      // 물리 이탈 방지 안전 클램핑 & 정지 관측
      scene.onAfterPhysicsObservable.add(() => {
        if (diceObjectsRef.current.length === 0) return;

        // 벽 이탈 방지 안전 위치 클램프 (groundSize = 12, maxBound = 5.2)
        const maxBound = 5.2;
        diceObjectsRef.current.forEach(({ mesh, aggregate }) => {
          let isOut = false;
          if (Math.abs(mesh.position.x) > maxBound) {
            mesh.position.x = Math.sign(mesh.position.x) * maxBound;
            isOut = true;
          }
          if (Math.abs(mesh.position.z) > maxBound) {
            mesh.position.z = Math.sign(mesh.position.z) * maxBound;
            isOut = true;
          }
          if (mesh.position.y > 6.5) {
            mesh.position.y = 6.5;
            isOut = true;
          } else if (mesh.position.y < 0.3) {
            mesh.position.y = 0.35;
            isOut = true;
          }

          if (isOut && aggregate && aggregate.body) {
            const currentVel = aggregate.body.getLinearVelocity();
            aggregate.body.setLinearVelocity(currentVel.scale(0.3));
          }
        });

        if (!isRollingInternalRef.current) return;

        const elapsedTime = Date.now() - rollStartTimeRef.current;

        // 굴리기 시작 후 700ms 이후 착지 감속 구간 동안 Slerp로 서버 결과 눈금이 위로 오도록 부드럽게 보정
        if (elapsedTime > 700) {
          diceObjectsRef.current.forEach(({ mesh }, idx) => {
            if (heldRef.current[idx] || !mesh.rotationQuaternion) return;

            const targetVal = diceRef.current[idx] || 1;
            const targetQuat = getTargetQuaternion(targetVal);

            // 보정 비율 (시간이 지날수록 targetQuat 쪽으로 부드럽게 흡수)
            const lerpFactor = Math.min((elapsedTime - 700) / 800, 0.25);
            Quaternion.SlerpToRef(mesh.rotationQuaternion, targetQuat, lerpFactor, mesh.rotationQuaternion);
          });
        }

        // 굴리기 시작 후 최소 300ms 지난 시점부터 자연 정지 감지
        if (elapsedTime > 300) {
          const isAllStopped = diceObjectsRef.current.every(({ aggregate }, idx) => {
            if (heldRef.current[idx]) return true;
            const linearVel = aggregate.body.getLinearVelocity();
            const angularVel = aggregate.body.getAngularVelocity();
            return linearVel.length() < 0.08 && angularVel.length() < 0.08;
          });

          if (isAllStopped) {
            isRollingInternalRef.current = false;

            diceObjectsRef.current.forEach(({ mesh, aggregate }, idx) => {
              if (!heldRef.current[idx]) {
                const targetVal = diceRef.current[idx] || 1;
                const targetQuat = getTargetQuaternion(targetVal);
                mesh.rotationQuaternion = targetQuat;

                if (aggregate && aggregate.body) {
                  aggregate.body.setMotionType(PhysicsMotionType.STATIC);
                  aggregate.body.setLinearVelocity(Vector3.Zero());
                  aggregate.body.setAngularVelocity(Vector3.Zero());
                }
              }
            });

            if (onRollCompleteRef.current) {
              onRollCompleteRef.current();
            }
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
                rollsLeftRef.current < 3
              ) {
                onToggleHoldRef.current(index);
              }
            }
          }
        }
      });

      engine.runRenderLoop(() => {
        scene.render();
      });
    };

    initBabylon();

    const handleResize = () => {
      engineRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      engineRef.current?.resize();
    });
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      sceneRef.current?.dispose();
      engineRef.current?.dispose();
    };
  }, []);

  // 자연스러운 공중 던지기 및 감속 시 Slerp 보정 굴리기 동작
  useEffect(() => {
    if (!isRolling || diceObjectsRef.current.length === 0) return;

    isRollingInternalRef.current = true;
    rollStartTimeRef.current = Date.now();

    const activeIndices = diceObjectsRef.current
      .map((_, idx) => idx)
      .filter((idx) => !heldRef.current[idx]);

    diceObjectsRef.current.forEach(({ mesh, aggregate }, idx) => {
      if (heldRef.current[idx]) {
        mesh.isVisible = false;
        aggregate.body.setLinearVelocity(Vector3.Zero());
        aggregate.body.setAngularVelocity(Vector3.Zero());
      }
    });

    const activeCount = activeIndices.length;
    const spacing = 1.5;
    const activeStartX = -((Math.max(activeCount, 1) - 1) * spacing) / 2;

    activeIndices.forEach((diceIdx, i) => {
      const { mesh, aggregate } = diceObjectsRef.current[diceIdx];
      mesh.isVisible = true;

      // 공중 무작위 시작 위치 및 회전
      const offsetX = (Math.random() - 0.5) * 1.5;
      const offsetZ = (Math.random() - 0.5) * 1.5;
      const startPos = new Vector3(
        activeStartX + i * spacing + offsetX * 0.15,
        1.4 + Math.random() * 0.4,
        offsetZ * 0.15
      );

      const startQuat = Quaternion.RotationYawPitchRoll(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      aggregate.body.disablePreStep = false;
      aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
      aggregate.body.setLinearVelocity(Vector3.Zero());
      aggregate.body.setAngularVelocity(Vector3.Zero());

      mesh.position.copyFrom(startPos);
      mesh.rotationQuaternion = startQuat;

      // 무작위 포스 & 스핀 토크 부여
      const force = new Vector3(
        (Math.random() - 0.5) * 1.8,
        1.8 + Math.random() * 0.8,
        (Math.random() - 0.5) * 1.8
      );
      const torque = new Vector3(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );

      aggregate.body.applyImpulse(force, mesh.getAbsolutePosition());
      aggregate.body.applyAngularImpulse(torque);
    });
  }, [isRolling]);

  // 주사위 위치 및 가시성 Sync (새 턴(rollsLeft===3)일 때만 1열 배치, 굴림 후(rollsLeft<3)에는 착지 위치 유지)
  useEffect(() => {
    if (isRolling) return;
    isRollingInternalRef.current = false;

    const isNewTurn = rollsLeft === 3;

    if (isNewTurn) {
      // 턴이 새로 시작되었을 때 (rollsLeft === 3) -> 5개 주사위를 1열 정렬 및 STATIC 고정
      const spacing = 1.6;
      const startX = -((5 - 1) * spacing) / 2;

      diceObjectsRef.current.forEach(({ mesh, aggregate }, idx) => {
        mesh.isVisible = true;
        const targetVal = dice[idx] || 1;
        const targetQuat = getTargetQuaternion(targetVal);
        const posX = startX + idx * spacing;

        mesh.position.set(posX, 0.55, 0);
        mesh.rotationQuaternion = targetQuat;

        if (aggregate && aggregate.body) {
          aggregate.body.disablePreStep = false;
          aggregate.body.setMotionType(PhysicsMotionType.STATIC);
          aggregate.body.setLinearVelocity(Vector3.Zero());
          aggregate.body.setAngularVelocity(Vector3.Zero());
        }
      });
    } else {
      // 굴림 진행 중/후 (rollsLeft < 3) -> 1열 정렬하지 않고 굴러서 착지한 3D 바닥 위치 그대로 유지
      diceObjectsRef.current.forEach(({ mesh, aggregate }, idx) => {
        const isHeld = held[idx];
        mesh.isVisible = !isHeld;

        if (aggregate && aggregate.body) {
          aggregate.body.setMotionType(PhysicsMotionType.STATIC);
          aggregate.body.setLinearVelocity(Vector3.Zero());
          aggregate.body.setAngularVelocity(Vector3.Zero());
        }
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
