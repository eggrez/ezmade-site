"use client";

import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";

const HeroMistScene3D = dynamic(
  () => import("./HeroMistScene3D"),
  {
    ssr: false,
    loading: () => null,
  },
);

type HeroContentProps = {
  /**
   * Сглаженный прогресс общей HeroScene.
   * Используется для основной анимации Hero.
   */
  progress: MotionValue<number>;

  /**
   * Прямой прогресс общей HeroScene без spring.
   * Используется для финальной светлой защиты,
   * чтобы она успевала закрывать видео при быстром скролле.
   */
  rawProgress: MotionValue<number>;
};

export default function HeroContent({
  progress,
  rawProgress,
}: HeroContentProps) {
  const shouldReduceMotion = useReducedMotion();

  /*
   * --------------------------------------------------------
   * 01. ЦЕНТРАЛЬНЫЙ ЗНАК
   * --------------------------------------------------------
   *
   * Квадрат остаётся строго по центру.
   * Никуда не уезжает и не собирается с wordmark.
   *
   * Он долго держится, затем медленно растворяется
   * через opacity + очень мягкий blur.
   */

  const introMarkOpacity = useTransform(
    progress,
    [0, 0.1, 0.17, 0.25],
    [1, 1, 0.72, 0],
  );

  const introMarkBlur = useTransform(
    progress,
    [0, 0.13, 0.2, 0.25],
    [0, 0, 2, 10],
  );

  const introMarkScale = useTransform(
    progress,
    [0, 0.12, 0.25],
    [1.04, 1, 0.985],
  );

  const introMarkY = useTransform(
    progress,
    [0, 0.12, 0.25],
    [0, 0, -5],
  );

  const introMarkFilter =
    useMotionTemplate`blur(${introMarkBlur}px)`;

  /*
   * --------------------------------------------------------
   * 02. БОЛЬШОЙ WORDMARK EZ
   * --------------------------------------------------------
   *
   * Между исчезновением центрального квадрата
   * и появлением букв оставлена небольшая пауза.
   *
   * Wordmark не выезжает и не раскрывается маской.
   * Он проявляется практически незаметно:
   *
   * opacity
   * blur
   * минимальный scale
   */

  const wordmarkOpacity = useTransform(
  progress,
  [0, 0.32, 0.4, 0.53, 0.61, 0.69],
  [0, 0, 0.12, 1, 1, 0],
);

const wordmarkBlur = useTransform(
  progress,
  [0.32, 0.42, 0.53, 0.61, 0.69],
  [18, 8, 0, 0, 12],
);

const wordmarkScale = useTransform(
  progress,
  [0.32, 0.53, 0.69],
  [0.992, 1, 1.006],
);

const wordmarkY = useTransform(
  progress,
  [0.32, 0.53, 0.69],
  [5, 0, -3],
);

  /*
   * Очень небольшая вариация яркости.
   * Это не должна быть заметная пульсация.
   *
   * Она лишь слегка убирает цифровую неподвижность.
   */

  const wordmarkBrightness = useTransform(
    progress,
    [0.34, 0.45, 0.53, 0.61, 0.69],
    [0.96, 1, 0.985, 1, 0.96],
  );

  const wordmarkFilter =
    useMotionTemplate`blur(${wordmarkBlur}px) brightness(${wordmarkBrightness})`;

  /*
   * --------------------------------------------------------
   * 03. МАЛЕНЬКИЙ ЗНАК-ПОДПИСЬ
   * --------------------------------------------------------
   *
   * Это отдельная копия знака.
   * Она появляется только вместе с большим EZ.
   *
   * Центральный intro-знак к этому моменту уже исчез.
   */

  const signatureOpacity = useTransform(
    progress,
    [0, 0.34, 0.42, 0.56, 0.64, 0.69],
    [0, 0, 0.82, 0.82, 0.28, 0],
  );

  const signatureBlur = useTransform(
    progress,
    [0.34, 0.43, 0.59, 0.69],
    [6, 0, 0, 5],
  );

  const signatureY = useTransform(
    progress,
    [0.34, 0.44, 0.6, 0.69],
    [5, 0, 0, -3],
  );

  const signatureFilter =
    useMotionTemplate`blur(${signatureBlur}px)`;

  /*
   * --------------------------------------------------------
   * 04. VIDEO / DOLLY BACK
   * --------------------------------------------------------
   */

  const videoScale = useTransform(
    progress,
    [0, 0.12, 0.34, 0.54, 0.68],
    [1.18, 1.16, 1.09, 1.025, 1],
  );

  const videoY = useTransform(
    progress,
    [0, 0.34, 0.54, 0.68],
    [18, 9, 0, -2],
  );

  /*
   * Начальный светлый экран открывает видео.
   */

  const openingVeilOpacity = useTransform(
    progress,
    [0, 0.08, 0.16, 0.26],
    [1, 1, 0.62, 0],
  );

  /*
   * --------------------------------------------------------
   * 05. ФИНАЛЬНЫЙ СВЕТОВОЙ ПЕРЕХОД
   * --------------------------------------------------------
   */

  const transitionGlowOpacity = useTransform(
    progress,
    [0.92, 0.95, 0.98, 1],
    [0, 0.04, 0.5, 1],
  );

  const transitionGlowScale = useTransform(
    progress,
    [0.72, 0.86, 1],
    [0.72, 0.94, 1.18],
  );

  const transitionGlowY = useTransform(
    progress,
    [0.72, 0.86, 1],
    [150, 76, -10],
  );

  const atmosphereOpacity = useTransform(
    progress,
    [0.94, 0.965, 0.985, 1],
    [0, 0.04, 0.46, 1],
  );

  /*
   * Финальная защита работает от rawProgress,
   * поэтому не отстаёт от быстрого скролла.
   */

  const finalVeilOpacity = useTransform(
    rawProgress,
    [0.96, 0.975, 0.99, 1],
    [0, 0.04, 0.62, 1],
  );

  /*
   * После завершения перехода Hero исчезает.
   */

  const heroOpacity = useTransform(
    progress,
    [0.69, 0.74],
    [1, 0],
  );

  return (
    <motion.div
      aria-label="EZ introduction"
      style={{
        opacity: shouldReduceMotion ? 0 : heroOpacity,
      }}
      className={[
        "pointer-events-none",
        "absolute inset-0 z-10",
        "overflow-hidden",
        "bg-[var(--color-bg)]",
        "will-change-opacity",
      ].join(" ")}
    >
      {/* -------------------------------------------------- */}
      {/* Video                                              */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-hidden="true"
        style={
          shouldReduceMotion
            ? undefined
            : {
                scale: videoScale,
                y: videoY,
              }
        }
        className={[
          "absolute -inset-[6%]",
          "transform-gpu",
          "will-change-transform",
        ].join(" ")}
      >
        <video
          className="h-full w-full object-cover"
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </motion.div>

      {/* -------------------------------------------------- */}
      {/* Начальный светлый экран                            */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion
            ? 1
            : openingVeilOpacity,
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-[4px] z-10",
          "bg-[var(--color-bg)]",
          "will-change-opacity",
        ].join(" ")}
      />

      {/* -------------------------------------------------- */}
      {/* Центральный intro-знак                             */}
      {/* -------------------------------------------------- */}

      <div
        className={[
          "pointer-events-none",
          "absolute inset-0 z-20",
          "flex items-center justify-center",
          "px-6",
        ].join(" ")}
      >
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  filter: "blur(10px)",
                  scale: 0.985,
                }
          }
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
          }}
          transition={{
            duration: 1.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: introMarkOpacity,
                  filter: introMarkFilter,
                  scale: introMarkScale,
                  y: introMarkY,
                }
          }
          className={[
            "relative shrink-0",
            "h-[clamp(4.8rem,6.4vw,6.8rem)]",
            "w-[clamp(4.8rem,6.4vw,6.8rem)]",
            "transform-gpu",
            "will-change-transform",
          ].join(" ")}
        >
          <img
            src="/images/logo-mark.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="block h-full w-full"
          />
        </motion.div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Объёмная туманная форма EZ                         */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-label="EZ"

        className={[
          "pointer-events-none",
          "absolute inset-0 z-20",
          "transform-gpu",
          "will-change-[transform,opacity,filter]",
        ].join(" ")}
      >
        <HeroMistScene3D progress={progress} />
      </motion.div>

      {/* -------------------------------------------------- */}
      {/* Нижнее основное свечение                           */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion
            ? 1
            : transitionGlowOpacity,
          scale: shouldReduceMotion
            ? 1
            : transitionGlowScale,
          y: shouldReduceMotion
            ? 0
            : transitionGlowY,
          background:
            "radial-gradient(ellipse 105% 82% at 50% 105%, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 98%, transparent) 22%, color-mix(in srgb, var(--color-bg) 78%, transparent) 46%, color-mix(in srgb, var(--color-bg) 34%, transparent) 72%, transparent 100%)",
        }}
        className={[
          "pointer-events-none",
          "absolute",
          "-inset-x-[35%]",
          "-bottom-[45%]",
          "z-30",
          "h-[160svh]",
          "origin-bottom",
          "blur-[10px]",
          "will-change-[transform,opacity]",
        ].join(" ")}
      />

      {/* -------------------------------------------------- */}
      {/* Дополнительный широкий ореол                       */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion
            ? 1
            : transitionGlowOpacity,
          scale: shouldReduceMotion
            ? 1
            : transitionGlowScale,
          background:
            "radial-gradient(ellipse 130% 105% at 50% 112%, color-mix(in srgb, var(--color-bg) 72%, transparent) 0%, color-mix(in srgb, var(--color-bg) 30%, transparent) 52%, transparent 100%)",
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-x-[48%] -bottom-[55%] z-30",
          "h-[190svh]",
          "origin-bottom",
          "blur-[18px]",
          "will-change-[transform,opacity]",
        ].join(" ")}
      />

      {/* -------------------------------------------------- */}
      {/* Общее атмосферное осветление                       */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion
            ? 1
            : atmosphereOpacity,
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-[6px] z-35",
          "bg-[var(--color-bg)]",
          "will-change-opacity",
        ].join(" ")}
      />

      {/* -------------------------------------------------- */}
      {/* Финальная защита от линии и мелькания видео        */}
      {/* -------------------------------------------------- */}

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion
            ? 1
            : finalVeilOpacity,
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-[8px] z-40",
          "bg-[var(--color-bg)]",
          "will-change-opacity",
        ].join(" ")}
      />
    </motion.div>
  );
}