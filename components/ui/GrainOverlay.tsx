"use client";

import { useEffect, useRef } from "react";

type GrainOverlayProps = {
  grainOpacity?: number;
  materialOpacity?: number;
  emulsionOpacity?: number;
  colorDriftOpacity?: number;
  fps?: number;
  density?: number;
};

function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let result = value;

    result = Math.imul(
      result ^ (result >>> 15),
      result | 1,
    );

    result ^= result +
      Math.imul(
        result ^ (result >>> 7),
        result | 61,
      );

    return (
      ((result ^ (result >>> 14)) >>> 0) /
      4294967296
    );
  };
}

export default function GrainOverlay({
  grainOpacity = 0.12,
  materialOpacity = 0.16,
  emulsionOpacity = 0.18,
  colorDriftOpacity = 0.1,
  fps = 10,
  density = 0.0018,
}: GrainOverlayProps) {
  const materialCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const emulsionCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const grainCanvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const materialCanvas =
      materialCanvasRef.current;

    const emulsionCanvas =
      emulsionCanvasRef.current;

    const grainCanvas =
      grainCanvasRef.current;

    if (
      !materialCanvas ||
      !emulsionCanvas ||
      !grainCanvas
    ) {
      return;
    }

    const materialContext =
      materialCanvas.getContext("2d", {
        alpha: true,
      });

    const emulsionContext =
      emulsionCanvas.getContext("2d", {
        alpha: true,
      });

    const grainContext =
      grainCanvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

    if (
      !materialContext ||
      !emulsionContext ||
      !grainContext
    ) {
      return;
    }

    const reducedMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const materialRandom =
      createRandom(184729);

    const emulsionRandom =
      createRandom(927451);

    let animationFrameId = 0;
    let previousTime = 0;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particleCount = 0;

    const resizeCanvas = (
      canvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
    ) => {
      canvas.width = Math.round(
        width * pixelRatio,
      );

      canvas.height = Math.round(
        height * pixelRatio,
      );

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0,
      );
    };

    const drawMaterial = () => {
      materialContext.clearRect(
        0,
        0,
        width,
        height,
      );

      /*
       * Низкочастотная неоднородность основы.
       * Она не должна читаться как отдельные пятна.
       */
      const cloudCount = Math.max(
        28,
        Math.round(
          (width * height) / 70000,
        ),
      );

      for (
        let index = 0;
        index < cloudCount;
        index += 1
      ) {
        const x =
          materialRandom() * width;

        const y =
          materialRandom() * height;

        const radius =
          140 +
          materialRandom() * 420;

        const isCyan =
          materialRandom() > 0.45;

        const gradient =
          materialContext.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            radius,
          );

        if (isCyan) {
          gradient.addColorStop(
            0,
            "rgba(64, 111, 118, 0.035)",
          );

          gradient.addColorStop(
            0.5,
            "rgba(64, 111, 118, 0.012)",
          );
        } else {
          gradient.addColorStop(
            0,
            "rgba(66, 105, 91, 0.03)",
          );

          gradient.addColorStop(
            0.5,
            "rgba(66, 105, 91, 0.01)",
          );
        }

        gradient.addColorStop(
          1,
          "rgba(0, 0, 0, 0)",
        );

        materialContext.fillStyle =
          gradient;

        materialContext.fillRect(
          x - radius,
          y - radius,
          radius * 2,
          radius * 2,
        );
      }

      /*
       * Очень короткие волокна.
       * Они добавляют материальность,
       * но не должны выглядеть как линии.
       */
      const fiberCount = Math.min(
        9000,
        Math.round(
          width * height * 0.0022,
        ),
      );

      materialContext.lineCap = "round";

      for (
        let index = 0;
        index < fiberCount;
        index += 1
      ) {
        const x =
          materialRandom() * width;

        const y =
          materialRandom() * height;

        const length =
          1.5 +
          materialRandom() * 5;

        const angle =
          materialRandom() *
          Math.PI *
          2;

        const alpha =
          0.012 +
          materialRandom() * 0.012;

        materialContext.beginPath();

        materialContext.moveTo(
          x,
          y,
        );

        materialContext.lineTo(
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length,
        );

        materialContext.strokeStyle =
          `rgba(46, 72, 72, ${alpha})`;

        materialContext.lineWidth =
          0.25 +
          materialRandom() * 0.35;

        materialContext.stroke();
      }

      /*
       * Микропоры поверхности.
       */
      const poreCount = Math.min(
        14000,
        Math.round(
          width * height * 0.003,
        ),
      );

      for (
        let index = 0;
        index < poreCount;
        index += 1
      ) {
        const x =
          materialRandom() * width;

        const y =
          materialRandom() * height;

        const radius =
          0.15 +
          materialRandom() * 0.45;

        materialContext.beginPath();

        materialContext.arc(
          x,
          y,
          radius,
          0,
          Math.PI * 2,
        );

        materialContext.fillStyle =
          `rgba(
            35,
            58,
            60,
            ${0.012 + materialRandom() * 0.012}
          )`;

        materialContext.fill();
      }
    };

    const drawEmulsion = () => {
      emulsionContext.clearRect(
        0,
        0,
        width,
        height,
      );

      const cloudCount = Math.max(
        20,
        Math.round(
          (width * height) / 95000,
        ),
      );

      for (
        let index = 0;
        index < cloudCount;
        index += 1
      ) {
        const x =
          emulsionRandom() * width;

        const y =
          emulsionRandom() * height;

        const radius =
          180 +
          emulsionRandom() * 360;

        const blue =
          emulsionRandom() > 0.5;

        const gradient =
          emulsionContext.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            radius,
          );

        if (blue) {
          gradient.addColorStop(
            0,
            "rgba(45, 82, 105, 0.035)",
          );

          gradient.addColorStop(
            0.5,
            "rgba(45, 82, 105, 0.011)",
          );
        } else {
          gradient.addColorStop(
            0,
            "rgba(56, 102, 88, 0.032)",
          );

          gradient.addColorStop(
            0.5,
            "rgba(56, 102, 88, 0.01)",
          );
        }

        gradient.addColorStop(
          1,
          "rgba(0, 0, 0, 0)",
        );

        emulsionContext.fillStyle =
          gradient;

        emulsionContext.fillRect(
          x - radius,
          y - radius,
          radius * 2,
          radius * 2,
        );
      }
    };

    const drawGrainParticle = (
      x: number,
      y: number,
      radius: number,
      light: boolean,
      alpha: number,
    ) => {
      grainContext.beginPath();

      grainContext.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2,
      );

      grainContext.fillStyle = light
        ? `rgba(244, 251, 248, ${alpha})`
        : `rgba(18, 30, 32, ${alpha})`;

      grainContext.fill();
    };

    const renderGrain = () => {
      grainContext.clearRect(
        0,
        0,
        width,
        height,
      );

      for (
        let index = 0;
        index < particleCount;
        index += 1
      ) {
        const clusterX =
          Math.random() * width;

        const clusterY =
          Math.random() * height;

        const clusterSize =
          Math.random() < 0.16
            ? 2 + Math.floor(
                Math.random() * 3,
              )
            : 1;

        for (
          let particle = 0;
          particle < clusterSize;
          particle += 1
        ) {
          const offset =
            clusterSize === 1
              ? 0
              : 1.5 +
                Math.random() * 3;

          const angle =
            Math.random() *
            Math.PI *
            2;

          const x =
            clusterX +
            Math.cos(angle) * offset;

          const y =
            clusterY +
            Math.sin(angle) * offset;

          const sizeRandom =
            Math.random();

          let radius: number;

          if (sizeRandom < 0.76) {
            radius =
              0.22 +
              Math.random() * 0.42;
          } else if (
            sizeRandom < 0.96
          ) {
            radius =
              0.65 +
              Math.random() * 0.5;
          } else {
            radius =
              1.15 +
              Math.random() * 0.7;
          }

          const light =
            Math.random() > 0.56;

          const alpha = light
            ? 0.1 +
              Math.random() * 0.14
            : 0.07 +
              Math.random() * 0.12;

          drawGrainParticle(
            x,
            y,
            radius,
            light,
            alpha,
          );
        }
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      pixelRatio = Math.min(
        window.devicePixelRatio,
        1.25,
      );

      resizeCanvas(
        materialCanvas,
        materialContext,
      );

      resizeCanvas(
        emulsionCanvas,
        emulsionContext,
      );

      resizeCanvas(
        grainCanvas,
        grainContext,
      );

      particleCount = Math.round(
        width * height * density,
      );

      drawMaterial();
      drawEmulsion();
    };

    const frameDuration =
      1000 / fps;

    const animate = (time: number) => {
      if (
        time - previousTime >=
        frameDuration
      ) {
        renderGrain();
        previousTime = time;
      }

      animationFrameId =
        window.requestAnimationFrame(
          animate,
        );
    };

    const startAnimation = () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      renderGrain();

      if (
        !reducedMotionQuery.matches
      ) {
        previousTime = 0;

        animationFrameId =
          window.requestAnimationFrame(
            animate,
          );
      }
    };

    const handleResize = () => {
      resize();
      startAnimation();
    };

    const handleMotionChange = () => {
      startAnimation();
    };

    resize();
    startAnimation();

    window.addEventListener(
      "resize",
      handleResize,
    );

    reducedMotionQuery.addEventListener(
      "change",
      handleMotionChange,
    );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      reducedMotionQuery.removeEventListener(
        "change",
        handleMotionChange,
      );
    };
  }, [density, fps]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Физическая фактура основы */}
      <canvas
        ref={materialCanvasRef}
        className="absolute inset-0"
        style={{
          opacity: materialOpacity,
          mixBlendMode: "multiply",
          filter: "blur(0.12px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Цветовая неоднородность эмульсии */}
      <canvas
        ref={emulsionCanvasRef}
        className="absolute inset-0"
        style={{
          opacity: emulsionOpacity,
          mixBlendMode: "soft-light",
          filter: "blur(12px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Cyan-green color drift */}
      <div
        className="absolute inset-0"
        style={{
          opacity: colorDriftOpacity,
          mixBlendMode: "soft-light",
          background: `
            radial-gradient(
              circle at 72% 24%,
              rgba(60, 128, 142, 0.16) 0%,
              rgba(60, 128, 142, 0.045) 22%,
              transparent 50%
            ),
            radial-gradient(
              circle at 24% 76%,
              rgba(66, 124, 99, 0.11) 0%,
              rgba(66, 124, 99, 0.03) 25%,
              transparent 48%
            ),
            linear-gradient(
              135deg,
              rgba(46, 92, 108, 0.03),
              rgba(54, 101, 83, 0.018),
              transparent 68%
            )
          `,
        }}
      />

      {/* Живое кластерное плёночное зерно */}
      <canvas
        ref={grainCanvasRef}
        className="absolute inset-0"
        style={{
          opacity: grainOpacity,
          mixBlendMode: "soft-light",
          filter: "blur(0.16px)",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}