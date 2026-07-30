"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { type MotionValue } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type HeroMistScene3DProps = {
  progress: MotionValue<number>;
};

type MistLayerProps = {
  index: number;
  progressRef: React.MutableRefObject<number>;
  maskTexture: THREE.Texture;
};

const EZ_MASK_SRC = "/images/ez-wordmark-mask.png";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uLayer;

  varying vec2 vUv;
  varying float vDisplacement;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vUv = uv;

    vec3 transformed = position;

    float broad = noise(
      uv * vec2(2.3, 1.8) +
      vec2(uTime * 0.018, -uTime * 0.012) +
      uLayer * 0.41
    );

    float detail = noise(
      uv * vec2(6.4, 4.8) +
      vec2(-uTime * 0.011, uTime * 0.016) +
      uLayer * 0.77
    );

    float displacement = (broad * 0.72 + detail * 0.28) - 0.5;
    vDisplacement = displacement;

    transformed.z += displacement * (0.22 + uLayer * 0.06);
    transformed.x += sin(uv.y * 6.0 + uTime * 0.08 + uLayer) * 0.025;
    transformed.y += cos(uv.x * 5.0 - uTime * 0.07 + uLayer) * 0.018;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMask;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uLayer;

  varying vec2 vUv;
  varying float vDisplacement;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float sampleMask(vec2 uv) {
    return texture2D(uMask, uv).r;
  }

  float softMask(vec2 uv) {
    vec2 px = vec2(0.0022, 0.0044);

    float value = 0.0;
    value += sampleMask(uv) * 0.28;
    value += sampleMask(uv + vec2(px.x, 0.0)) * 0.12;
    value += sampleMask(uv - vec2(px.x, 0.0)) * 0.12;
    value += sampleMask(uv + vec2(0.0, px.y)) * 0.12;
    value += sampleMask(uv - vec2(0.0, px.y)) * 0.12;
    value += sampleMask(uv + px) * 0.06;
    value += sampleMask(uv - px) * 0.06;
    value += sampleMask(uv + vec2(px.x, -px.y)) * 0.06;
    value += sampleMask(uv + vec2(-px.x, px.y)) * 0.06;

    return value;
  }

  void main() {
    float mask = softMask(vUv);

    float broad = noise(
      vUv * vec2(2.4, 1.7) +
      vec2(uTime * 0.014, -uTime * 0.01) +
      uLayer * 0.36
    );

    float medium = noise(
      vUv * vec2(5.2, 3.8) +
      vec2(-uTime * 0.009, uTime * 0.013) +
      uLayer * 0.69
    );

    float fine = noise(
      vUv * vec2(11.0, 8.0) +
      vec2(uTime * 0.006, uTime * 0.008) +
      uLayer
    );

    float density = broad * 0.55 + medium * 0.3 + fine * 0.15;
    density = smoothstep(0.18, 0.84, density + vDisplacement * 0.18);

    float brokenShape = mask - (medium - 0.5) * 0.12;
    float shape = smoothstep(0.06, 0.58, brokenShape);

    vec3 shadow = vec3(0.20, 0.29, 0.27);
    vec3 light = vec3(0.70, 0.74, 0.64);
    vec3 color = mix(shadow, light, density);

    color *= 0.92 + broad * 0.22 + uLayer * 0.035;

    float alpha = shape * mix(0.48, 1.0, density) * uOpacity;

    if (alpha < 0.006) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

function smoothstep(min: number, max: number, value: number) {
  const x = Math.min(Math.max((value - min) / (max - min), 0), 1);
  return x * x * (3 - 2 * x);
}

function MistLayer({
  index,
  progressRef,
  maskTexture,
}: MistLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const layer = index / 5;

  const uniforms = useMemo(
    () => ({
      uMask: { value: maskTexture },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uLayer: { value: layer },
    }),
    [layer, maskTexture],
  );

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;

    if (!mesh || !material) {
      return;
    }

    const progress = progressRef.current;

    const reveal = smoothstep(0.16, 0.38, progress);
    const dissolve = 1 - smoothstep(0.82, 0.98, progress);
    const envelope = reveal * dissolve;

    const opacityByLayer = [0.3, 0.25, 0.21, 0.175, 0.145, 0.12];
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uOpacity.value =
      envelope * (opacityByLayer[index] ?? 0.12);

    const depth = -0.28 + index * 0.12 + progress * 0.22;
    const driftX = (index - 2.5) * 0.035 + Math.sin(progress * 4 + index) * 0.025;
    const driftY = (2.5 - index) * 0.02 - progress * 0.055;

    mesh.position.z = THREE.MathUtils.damp(mesh.position.z, depth, 3.2, delta);
    mesh.position.x = THREE.MathUtils.damp(mesh.position.x, driftX, 2.8, delta);
    mesh.position.y = THREE.MathUtils.damp(mesh.position.y, driftY, 2.8, delta);

    mesh.rotation.z = THREE.MathUtils.damp(
      mesh.rotation.z,
      (index - 2.5) * 0.004,
      3,
      delta,
    );

    const scale = 1.04 + index * 0.018 + progress * 0.045;
    mesh.scale.x = THREE.MathUtils.damp(mesh.scale.x, scale, 3, delta);
    mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, scale, 3, delta);
  });

  return (
    <mesh ref={meshRef} renderOrder={index}>
      <planeGeometry args={[8.4, 4.16, 80, 44]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.NormalBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MistVolume({ progress }: HeroMistScene3DProps) {
  const progressRef = useRef(progress.get());
  const maskTexture = useTexture(EZ_MASK_SRC);

  useEffect(() => {
    return progress.on("change", (latest) => {
      progressRef.current = latest;
    });
  }, [progress]);

  useEffect(() => {
    maskTexture.colorSpace = THREE.NoColorSpace;
    maskTexture.minFilter = THREE.LinearFilter;
    maskTexture.magFilter = THREE.LinearFilter;
    maskTexture.generateMipmaps = false;
    maskTexture.needsUpdate = true;
  }, [maskTexture]);

  useFrame(({ camera }, delta) => {
    const progressValue = progressRef.current;

    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      5.0 + progressValue * 0.32,
      2.6,
      delta,
    );

    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      progressValue * 0.035,
      2.6,
      delta,
    );

    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => (
        <MistLayer
          key={index}
          index={index}
          progressRef={progressRef}
          maskTexture={maskTexture}
        />
      ))}
    </group>
  );
}

export default function HeroMistScene3D({
  progress,
}: HeroMistScene3DProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 5],
          fov: 47,
          near: 0.1,
          far: 20,
        }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
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
          <MistVolume progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}