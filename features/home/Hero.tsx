"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  /*
   * Плавность основной сцены.
   *
   * Эта пружина отвечает за сборку логотипа,
   * dolly back и атмосферное движение.
   */
  const progress = useSpring(scrollYProgress, {
    stiffness: 56,
    damping: 29,
    mass: 0.74,
    restDelta: 0.0005,
  });

  /*
   * --------------------------------------------------------
   * 01. СБОРКА ЛОГОТИПА
   * --------------------------------------------------------
   *
   * На первом экране виден только квадрат.
   * При скролле вся композиция плавно смещается влево,
   * а EZ постепенно входит в фокус.
   *
   * В конце логотип больше не разбирается.
   * Его целиком накрывает белый свет.
   */

  const brandGroupX = useTransform(
    progress,
    [0, 0.045, 0.24],
    [55, 55, 0],
  );

  const wordOpacity = useTransform(
    progress,
    [0, 0.055, 0.12, 0.27],
    [0, 0, 0.1, 1],
  );

  const wordBlur = useTransform(
    progress,
    [0.055, 0.12, 0.27],
    [5, 4, 0],
  );

  const wordScale = useTransform(
    progress,
    [0.055, 0.27],
    [0.992, 1],
  );

  const wordFilter = useMotionTemplate`blur(${wordBlur}px)`;

  /*
   * --------------------------------------------------------
   * 02. DOLLY BACK
   * --------------------------------------------------------
   *
   * Бренд и видео отдаляются с разной скоростью.
   * За счёт этого движение ощущается как работа камеры,
   * а не как простое уменьшение интерфейса.
   */

  const brandScale = useTransform(
    progress,
    [0, 0.18, 0.48, 0.78, 1],
    [1.07, 1.035, 0.975, 0.91, 0.89],
  );

  const brandY = useTransform(
    progress,
    [0, 0.2, 0.5, 0.78, 1],
    [0, -3, -11, -22, -25],
  );

  const videoScale = useTransform(
    progress,
    [0, 0.18, 0.5, 0.8, 1],
    [1.18, 1.16, 1.09, 1.025, 1],
  );

  const videoY = useTransform(
    progress,
    [0, 0.5, 0.8, 1],
    [18, 9, 0, -2],
  );

  /*
   * Белый первый экран постепенно открывает облака.
   * Прозрачность самого видео не меняется.
   */

  const openingVeilOpacity = useTransform(
    progress,
    [0, 0.18, 0.33, 0.53],
    [1, 1, 0.72, 0],
  );

  /*
   * --------------------------------------------------------
   * 03. МЯГКИЙ БЛИК
   * --------------------------------------------------------
   *
   * Блик появляется только после того, как EZ почти собрался.
   * Он медленно проходит через композицию и больше не повторяется.
   *
   * Благодаря mix-blend-screen он почти не виден на белом фоне,
   * но слегка подсвечивает чёрные элементы логотипа.
   */



  /*
   * --------------------------------------------------------
   * 04. БЕСШОВНЫЙ СВЕТОВОЙ ПЕРЕХОД
   * --------------------------------------------------------
   *
   * Переход начинается значительно раньше,
   * но развивается очень медленно.
   *
   * Логотип не исчезает самостоятельно:
   * свет постепенно снижает контраст всей сцены,
   * а затем полностью поглощает и изображение, и бренд.
   */

  const transitionGlowOpacity = useTransform(
    progress,
    [0.56, 0.67, 0.82, 1],
    [0, 0.08, 0.5, 1],
  );

  const transitionGlowScale = useTransform(
    progress,
    [0.56, 0.78, 1],
    [0.72, 0.9, 1.18],
  );

  const transitionGlowY = useTransform(
    progress,
    [0.56, 0.78, 1],
    [150, 80, -10],
  );

  /*
   * Общая световая дымка заполняет весь viewport.
   * Она убирает ощущение отдельного градиентного объекта.
   */

  const atmosphereOpacity = useTransform(
    progress,
    [0.65, 0.76, 0.9, 1],
    [0, 0.05, 0.46, 1],
  );

  /*
   * Финальный слой работает от прямого scrollYProgress.
   *
   * Даже если пользователь быстро прокрутит сцену,
   * слой успеет полностью закрыть видео до выхода из sticky.
   *
   * Полностью белым экран становится только у самого конца,
   * поэтому после перехода не остаётся длинной пустой паузы.
   */

  const finalVeilOpacity = useTransform(
    scrollYProgress,
    [0.82, 0.9, 0.97, 1],
    [0, 0.04, 0.56, 1],
  );

  return (
    <section
      ref={heroRef}
      aria-label="EZ introduction"
      className={[
        "relative",
        "h-[225svh]",
        "-mb-px",
        "bg-[var(--color-bg)]",
      ].join(" ")}
    >
      <div
        className={[
          "sticky top-0",
          "h-svh w-full",
          "overflow-hidden",
          "bg-[var(--color-bg)]",
        ].join(" ")}
      >
        <div
  aria-hidden="true"
  className={[
    "pointer-events-none",
    "absolute left-1/2 top-0",
    "z-[999] h-full w-[2px]",
    "-translate-x-1/2",
    "bg-red-500",
  ].join(" ")}
/>
        {/* Video */}
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
            "will-change-transform",
          ].join(" ")}
        >
          <video
            className="h-full w-full object-cover"
            src="https://media.ezmade.pro/videos/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </motion.div>

        {/* Первый белый экран */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: shouldReduceMotion
              ? 0
              : openingVeilOpacity,
          }}
          className={[
            "pointer-events-none",
            "absolute -inset-[4px] z-10",
            "bg-[var(--color-bg)]",
            "will-change-opacity",
          ].join(" ")}
        />

        {/* Brand */}
        <div
          className={[
            "pointer-events-none",
            "absolute inset-0 z-20",
            "flex items-center justify-center",
            "px-6",
            "outline outline-1 outline-red-500",
          ].join(" ")}
        >
          <motion.div
            style={
              shouldReduceMotion
                ? undefined
                : {
                    x: brandGroupX,
                    y: brandY,
                    scale: brandScale,
                  }
            }
           className={[
  "relative",
  "flex items-center",
  "will-change-transform",
].join(" ")}
          >
            {/* Square mark */}
            <img
              src="/images/logo.svg"
              alt=""
              aria-hidden="true"
              className={[
                "block shrink-0",
                "h-[clamp(4.5rem,6.25vw,6.5rem)]",
                "w-[clamp(4.5rem,6.25vw,6.5rem)]",
              ].join(" ")}
            />

           {/* EZ — Regular 400 */}
<h1
  className={[
    "ml-[clamp(0.72rem,1vw,1rem)]",

    /*
     * Запас вынесен на обычную внешнюю обёртку.
     * Поэтому он предотвращает обрезание, но не участвует
     * в растеризации blur-слоя.
     */
    "px-[0.12em]",
    "py-[0.18em]",
    "-my-[0.18em]",

    "text-[clamp(5.05rem,7.7vw,7.95rem)]",
    "font-normal",
    "leading-[0.73]",
    "tracking-[-0.064em]",
    "text-[var(--color-text)]",
    "[text-shadow:none]",
  ].join(" ")}
>
  <motion.span
    style={
      shouldReduceMotion
        ? undefined
        : {
            opacity: wordOpacity,
            scale: wordScale,
            filter: wordFilter,
          }
    }
    className={[
      "inline-block",
      "origin-center",
      "will-change-[transform,opacity,filter]",
    ].join(" ")}
  >
    EZ
  </motion.span>
</h1>

            
          </motion.div>
        </div>

        {/*
         * Первый световой слой.
         *
         * Это большое радиальное свечение,
         * которое заметно выходит за границы viewport.
         * Поэтому у него нет видимой горизонтальной кромки.
         */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: shouldReduceMotion
              ? 0
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
            "absolute -inset-x-[36%] -bottom-[42%] z-30",
            "h-[170svh]",
            "origin-bottom",
            "will-change-[transform,opacity]",
          ].join(" ")}
        />

        {/*
         * Второй световой слой.
         *
         * Более широкий и слабый ореол смягчает основной свет
         * и не позволяет ему считываться как отдельный CSS-градиент.
         */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: shouldReduceMotion
              ? 0
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

        {/* Равномерное атмосферное осветление */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: shouldReduceMotion
              ? 0
              : atmosphereOpacity,
          }}
          className={[
            "pointer-events-none",
            "absolute -inset-[6px] z-35",
            "bg-[var(--color-bg)]",
            "will-change-opacity",
          ].join(" ")}
        />

        {/* Финальная защита от линии и мелькания видео */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: shouldReduceMotion
              ? 0
              : finalVeilOpacity,
          }}
          className={[
            "pointer-events-none",
            "absolute -inset-[8px] z-40",
            "bg-[var(--color-bg)]",
            "will-change-opacity",
          ].join(" ")}
        />
      </div>

      {/*
       * Небольшое физическое перекрытие со следующим блоком.
       * Оно страхует стык от субпиксельной линии браузера.
       */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none",
          "absolute inset-x-0 bottom-[-2px]",
          "z-50 h-2",
          "bg-[var(--color-bg)]",
        ].join(" ")}
      />
    </section>
  );
}