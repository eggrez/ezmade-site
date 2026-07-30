"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { type MotionValue } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type HeroLogoGeometry3DProps = {
  progress: MotionValue<number>;
};

type LogoVolumeProps = {
  progress: MotionValue<number>;
};

const LOGO_SRC = "/images/ez-wordmark.svg";
const LAYER_COUNT = 18;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function LogoVolume({ progress }: LogoVolumeProps) {
  const svg = useLoader(SVGLoader, LOGO_SRC);

  const rootRef = useRef<THREE.Group>(null);
  const mistRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const progressRef = useRef(progress.get());

  const { geometries, center, normalizedScale } = useMemo(() => {
    const created: THREE.ExtrudeGeometry[] = [];
    const bounds = new THREE.Box3();

    svg.paths.forEach((path, pathIndex) => {
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.55,
          bevelEnabled: true,
          bevelThickness: 0.08,
          bevelSize: 0.065,
          bevelSegments: 2,
          curveSegments: 12,
          steps: 1,
        });

        /*
         * Чуть сближаем E и Z, не меняя исходный SVG-файл.
         */
        geometry.translate(pathIndex === 0 ? 1.7 : -1.7, 0, -0.275);

        geometry.computeVertexNormals();
        geometry.computeBoundingBox();

        if (geometry.boundingBox) {
          bounds.union(geometry.boundingBox);
        }

        created.push(geometry);
      });
    });

    const size = new THREE.Vector3();
    const centerPoint = new THREE.Vector3();

    bounds.getSize(size);
    bounds.getCenter(centerPoint);

    /*
     * В прошлой версии targetWidth=7 — знак обрезался.
     * Теперь оставляем много воздуха вокруг него.
     */
    const targetWidth = 5.15;
    const scale = size.x > 0 ? targetWidth / size.x : 1;

    return {
      geometries: created,
      center: centerPoint,
      normalizedScale: scale,
    };
  }, [svg]);

  const layers = useMemo(
    () =>
      Array.from({ length: LAYER_COUNT }, (_, index) => {
        const centered = index - (LAYER_COUNT - 1) / 2;
        const normalized = centered / ((LAYER_COUNT - 1) / 2);

        return {
          z: centered * 0.13,
          x: Math.sin(index * 2.13) * 0.018,
          y: Math.cos(index * 1.71) * 0.014,
          scale: 1 + Math.abs(normalized) * 0.035,
          opacity: 0.018 + (1 - Math.abs(normalized)) * 0.018,
        };
      }),
    [],
  );

  useEffect(() => {
    return progress.on("change", (latest) => {
      progressRef.current = latest;
    });
  }, [progress]);

  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose());
    };
  }, [geometries]);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const mist = mistRef.current;
    const core = coreRef.current;

    if (!root || !mist || !core) {
      return;
    }

    const p = progressRef.current;

    const reveal = smoothstep((p - 0.04) / 0.22);
    const dissolve = 1 - smoothstep((p - 0.8) / 0.18);
    const visibility = reveal * dissolve;

    root.visible = visibility > 0.002;

    /*
     * Собираем слои из глубины: сначала туман широкий,
     * затем на короткое время становится читаемой форма.
     */
    const assembly = 1 - reveal;
    mist.scale.z = THREE.MathUtils.damp(
      mist.scale.z,
      1 + assembly * 2.8,
      3.2,
      delta,
    );

    mist.rotation.z = Math.sin(state.clock.elapsedTime * 0.11) * 0.012;
    mist.rotation.y = Math.sin(state.clock.elapsedTime * 0.09) * 0.045;

    core.rotation.y = Math.sin(state.clock.elapsedTime * 0.14) * 0.025;

    root.position.z = THREE.MathUtils.damp(
      root.position.z,
      -0.2 + p * 0.4,
      3,
      delta,
    );

    root.position.y = THREE.MathUtils.damp(
      root.position.y,
      -0.03 + p * 0.025,
      3,
      delta,
    );

    root.rotation.x = THREE.MathUtils.damp(
      root.rotation.x,
      THREE.MathUtils.degToRad(-1.2 + p * 0.8),
      3,
      delta,
    );

    root.rotation.y = THREE.MathUtils.damp(
      root.rotation.y,
      THREE.MathUtils.degToRad(1.8 - p * 1.4),
      3,
      delta,
    );

    const overallScale = normalizedScale * (0.96 + visibility * 0.04);
    root.scale.x = THREE.MathUtils.damp(
      root.scale.x,
      overallScale,
      4,
      delta,
    );
    root.scale.y = THREE.MathUtils.damp(
      root.scale.y,
      -overallScale,
      4,
      delta,
    );
    root.scale.z = THREE.MathUtils.damp(
      root.scale.z,
      overallScale,
      4,
      delta,
    );

    mist.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const material = object.material;

      if (material instanceof THREE.MeshBasicMaterial) {
        const baseOpacity =
          typeof object.userData.baseOpacity === "number"
            ? object.userData.baseOpacity
            : 0.025;

        material.opacity = baseOpacity * visibility;
      }
    });

    core.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const material = object.material;

      if (material instanceof THREE.MeshPhysicalMaterial) {
        /*
         * Ядро остаётся очень слабым — это не белый пластиковый знак.
         */
        material.opacity = 0.11 * visibility;
        material.emissiveIntensity = 0.14 + visibility * 0.08;
      }
    });
  });

  const basePosition: [number, number, number] = [
    -center.x * normalizedScale,
    center.y * normalizedScale,
    -center.z * normalizedScale,
  ];

  return (
    <group
      ref={rootRef}
      position={basePosition}
      scale={[normalizedScale, -normalizedScale, normalizedScale]}
    >
      <group ref={mistRef}>
        {layers.flatMap((layer, layerIndex) =>
          geometries.map((geometry, geometryIndex) => (
            <mesh
              key={`mist-${layerIndex}-${geometryIndex}`}
              geometry={geometry}
              position={[layer.x, layer.y, layer.z]}
              scale={layer.scale}
              renderOrder={1}
              userData={{ baseOpacity: layer.opacity }}
            >
              <meshBasicMaterial
                color="#d9e1d4"
                transparent
                opacity={0}
                depthWrite={false}
                depthTest
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          )),
        )}
      </group>

      <group ref={coreRef}>
        {geometries.map((geometry, index) => (
          <mesh
            key={`core-${index}`}
            geometry={geometry}
            renderOrder={2}
          >
            <meshPhysicalMaterial
              color="#cbd5ca"
              emissive="#75887f"
              emissiveIntensity={0.16}
              metalness={0}
              roughness={0.78}
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      Math.sin(time * 0.08) * 0.055,
      2.5,
      delta,
    );

    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      Math.cos(time * 0.07) * 0.035,
      2.5,
      delta,
    );

    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      8.4,
      2.5,
      delta,
    );

    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({ progress }: HeroLogoGeometry3DProps) {
  return (
    <>
      {/*
       * Canvas прозрачный: облачное видео Hero остаётся настоящим фоном.
       * Three.js рисует только объём EZ поверх него.
       */}
      <fog attach="fog" args={["#6d7f78", 6.5, 12]} />

      <ambientLight intensity={0.3} />

      <directionalLight
        position={[-4, 5, 6]}
        intensity={1.6}
        color="#e1e8dc"
      />

      <directionalLight
        position={[4, -2, 3]}
        intensity={0.65}
        color="#7f9992"
      />

      <LogoVolume progress={progress} />
      <CameraRig />
    </>
  );
}

export default function HeroLogoGeometry3D({
  progress,
}: HeroLogoGeometry3DProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 8.4],
          fov: 43,
          near: 0.1,
          far: 30,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <Suspense fallback={null}>
          <Scene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}