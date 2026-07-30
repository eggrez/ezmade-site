"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { type MotionValue } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type HeroCloudLogoParticlesProps = {
  progress: MotionValue<number>;
};

type ParticleFieldProps = {
  progress: MotionValue<number>;
};

const LOGO_SRC = "/images/ez-wordmark.svg";
const PARTICLE_COUNT = 32000;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function sampleTriangle(
  a: THREE.Vector2,
  b: THREE.Vector2,
  c: THREE.Vector2,
) {
  let r1 = Math.random();
  let r2 = Math.random();

  if (r1 + r2 > 1) {
    r1 = 1 - r1;
    r2 = 1 - r2;
  }

  return new THREE.Vector2(
    a.x + r1 * (b.x - a.x) + r2 * (c.x - a.x),
    a.y + r1 * (b.y - a.y) + r2 * (c.y - a.y),
  );
}

function buildLogoTargets(svg: ReturnType<SVGLoader["parse"]>) {
  const triangles: {
    a: THREE.Vector2;
    b: THREE.Vector2;
    c: THREE.Vector2;
    area: number;
  }[] = [];

  const bounds = new THREE.Box2();

  svg.paths.forEach((path, pathIndex) => {
    const shapes = SVGLoader.createShapes(path);

    shapes.forEach((shape) => {
      const points = shape.getPoints(64);
      points.forEach((point) => bounds.expandByPoint(point));

      const contour = shape.getPoints(64);
      const holes = shape.holes.map((hole) => hole.getPoints(32));
      const faces = THREE.ShapeUtils.triangulateShape(contour, holes);

      const allPoints = [...contour, ...holes.flat()];

      faces.forEach(([ia, ib, ic]) => {
        const a = allPoints[ia].clone();
        const b = allPoints[ib].clone();
        const c = allPoints[ic].clone();

        const area = Math.abs(
          (a.x * (b.y - c.y) +
            b.x * (c.y - a.y) +
            c.x * (a.y - b.y)) /
            2,
        );

        if (area > 0.0001) {
          // Слегка сближаем E и Z в самой системе частиц.
          const shift = pathIndex === 0 ? 1.7 : -1.7;
          a.x += shift;
          b.x += shift;
          c.x += shift;

          triangles.push({ a, b, c, area });
        }
      });
    });
  });

  const totalArea = triangles.reduce((sum, triangle) => sum + triangle.area, 0);
  const cumulative: number[] = [];
  let running = 0;

  triangles.forEach((triangle) => {
    running += triangle.area / totalArea;
    cumulative.push(running);
  });

  const size = bounds.getSize(new THREE.Vector2());
  const center = bounds.getCenter(new THREE.Vector2());
  const scale = size.x > 0 ? 5.2 / size.x : 1;

  const targets = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const pick = Math.random();
    let triangleIndex = cumulative.findIndex((value) => value >= pick);

    if (triangleIndex < 0) {
      triangleIndex = triangles.length - 1;
    }

    const triangle = triangles[triangleIndex];
    const point = sampleTriangle(triangle.a, triangle.b, triangle.c);

    targets[i * 3] = (point.x - center.x) * scale;
    targets[i * 3 + 1] = -(point.y - center.y) * scale;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.55;
  }

  return targets;
}

function buildCloudPositions() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = Math.pow(Math.random(), 0.7) * 6.5;
    const angle = Math.random() * Math.PI * 2;

    positions[i * 3] =
      Math.cos(angle) * radius + (Math.random() - 0.5) * 2.4;
    positions[i * 3 + 1] =
      Math.sin(angle) * radius * 0.42 + (Math.random() - 0.5) * 2.0;
    positions[i * 3 + 2] =
      -1.2 + (Math.random() - 0.5) * 5.5;

    randoms[i] = Math.random();
    sizes[i] = 0.65 + Math.random() * 1.8;
  }

  return { positions, randoms, sizes };
}

const vertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uOpacity;
  uniform float uDissolve;

  attribute vec3 aTarget;
  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying float vSoftness;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    float localDelay = aRandom * 0.18;
    float morph = smoothstep(localDelay, 1.0, uMorph);

    vec3 cloud = position;

    float drift = uTime * (0.10 + aRandom * 0.08);
    cloud.x += sin(drift + position.y * 0.75 + aRandom * 8.0) * 0.24;
    cloud.y += cos(drift * 0.8 + position.x * 0.55 + aRandom * 5.0) * 0.16;
    cloud.z += sin(drift * 0.55 + aRandom * 12.0) * 0.18;

    vec3 target = aTarget;
    target.x += sin(uTime * 0.35 + aRandom * 15.0) * 0.025;
    target.y += cos(uTime * 0.28 + aRandom * 9.0) * 0.018;

    vec3 mixedPosition = mix(cloud, target, morph);

    float breakup = smoothstep(0.0, 1.0, uDissolve);
    mixedPosition.x += sin(aRandom * 31.0 + uTime * 0.7) * breakup * 1.6;
    mixedPosition.y += cos(aRandom * 19.0 + uTime * 0.6) * breakup * 0.9;
    mixedPosition.z += (aRandom - 0.5) * breakup * 3.0;

    vec4 mvPosition = modelViewMatrix * vec4(mixedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float perspective = 220.0 / max(1.0, -mvPosition.z);
    gl_PointSize = aSize * perspective;

    float formationGlow = 0.3 + morph * 0.7;
    float noiseFade = 0.72 + hash(mixedPosition + uTime * 0.02) * 0.28;

    vAlpha = uOpacity * formationGlow * noiseFade;
    vSoftness = morph;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vSoftness;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    float core = 1.0 - smoothstep(0.0, 0.16, d);
    float haze = 1.0 - smoothstep(0.05, 0.5, d);

    float alpha = mix(haze * 0.22, haze * 0.5 + core * 0.35, vSoftness);
    alpha *= vAlpha;

    if (alpha < 0.008) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function ParticleField({ progress }: ParticleFieldProps) {
  const svg = useLoader(SVGLoader, LOGO_SRC);
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef(progress.get());

  const geometry = useMemo(() => {
    const cloud = buildCloudPositions();
    const targets = buildLogoTargets(svg);

    const bufferGeometry = new THREE.BufferGeometry();

    bufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(cloud.positions, 3),
    );
    bufferGeometry.setAttribute(
      "aTarget",
      new THREE.BufferAttribute(targets, 3),
    );
    bufferGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(cloud.randoms, 1),
    );
    bufferGeometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(cloud.sizes, 1),
    );

    bufferGeometry.computeBoundingSphere();

    return bufferGeometry;
  }, [svg]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uOpacity: { value: 0 },
          uDissolve: { value: 0 },
          uColor: { value: new THREE.Color("#d8dfd4") },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
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
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    const p = progressRef.current;

    /*
     * Сцена:
     * 0.00–0.16 — только облачное поле
     * 0.16–0.48 — частицы постепенно находят форму
     * 0.48–0.68 — короткий читаемый момент
     * 0.68–0.92 — форма распадается
     */
    const morphIn = smoothstep((p - 0.14) / 0.34);
    const morphOut = 1 - smoothstep((p - 0.69) / 0.23);
    const morph = morphIn * morphOut;

    const fadeIn = smoothstep((p - 0.03) / 0.12);
    const fadeOut = 1 - smoothstep((p - 0.88) / 0.1);
    const opacity = fadeIn * fadeOut;

    const dissolve = smoothstep((p - 0.68) / 0.24);

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMorph.value = morph;
    material.uniforms.uOpacity.value = opacity * 0.62;
    material.uniforms.uDissolve.value = dissolve;

    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.08) * 0.025;
      pointsRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.008;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function CameraRig() {
  const { camera } = useThree();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      Math.sin(t * 0.07) * 0.08,
      2.5,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      Math.cos(t * 0.06) * 0.05,
      2.5,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      8.8,
      2.5,
      delta,
    );

    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({ progress }: HeroCloudLogoParticlesProps) {
  return (
    <>
      <fog attach="fog" args={["#81928a", 7.5, 13]} />
      <ParticleField progress={progress} />
      <CameraRig />
    </>
  );
}

export default function HeroCloudLogoParticles({
  progress,
}: HeroCloudLogoParticlesProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Canvas
        dpr={[1, 1.4]}
        camera={{
          position: [0, 0, 8.8],
          fov: 44,
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
