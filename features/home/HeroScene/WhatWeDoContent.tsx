"use client";

import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useState } from "react";

import SplitSection from "@/components/layout/SplitSection";

type WhatWeDoContentProps = {
  progress: MotionValue<number>;
  onNavigateToSelectedWork: () => void | Promise<void>;
};

type Service = {
  title: string;
};

type ServiceRowProps = {
  service: Service;
  index: number;
  progress: MotionValue<number>;
  activeIndex: number | null;
  shiningService: string | null;
  shineRun: number;
  shouldReduceMotion: boolean;
  onEnter: (
    title: string,
    index: number,
  ) => void;
  onLeave: () => void;
  onShineComplete: (title: string) => void;
  onSelect: () => void | Promise<void>;
};

const services: Service[] = [
  {
    title: "Direction",
  },
  {
    title: "Color Grading",
  },
  {
    title: "Editing",
  },
  {
    title: "Sound Design",
  },
  {
    title: "3D",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/*
 * Тайминги появления услуг внутри локального progress
 * сцены What We Do.
 *
 * Блок начинает собираться сразу после белого перехода
 * из Hero и успевает полностью проявиться до hold-фазы.
 */
const serviceRevealRanges = [
  [0.18, 0.28],
  [0.215, 0.315],
  [0.25, 0.35],
  [0.285, 0.385],
  [0.32, 0.42],
] as const;

function useReveal(
  progress: MotionValue<number>,
  start: number,
  end: number,
) {
  const opacity = useTransform(
    progress,
    [start, end],
    [0, 1],
  );

  const y = useTransform(
    progress,
    [start, end],
    [20, 0],
  );

  const scale = useTransform(
    progress,
    [start, end],
    [0.988, 1],
  );

  const blur = useTransform(
    progress,
    [start, end],
    [8, 0],
  );

  const filter =
    useMotionTemplate`blur(${blur}px)`;

  return {
    opacity,
    y,
    scale,
    filter,
  };
}

function ServiceRow({
  service,
  index,
  progress,
  activeIndex,
  shiningService,
  shineRun,
  shouldReduceMotion,
  onEnter,
  onLeave,
  onShineComplete,
  onSelect,
}: ServiceRowProps) {
  const [revealStart, revealEnd] =
    serviceRevealRanges[index];

  const reveal = useReveal(
    progress,
    revealStart,
    revealEnd,
  );

  const isActive = activeIndex === index;

  const isDimmed =
    activeIndex !== null && activeIndex !== index;

  const isShining =
    shiningService === service.title;

  function getServiceOffset() {
    if (
      shouldReduceMotion ||
      activeIndex === null ||
      index === activeIndex
    ) {
      return 0;
    }

    return index < activeIndex ? -14 : 14;
  }

  return (
    /*
     * Внешний слой отвечает только за scroll reveal.
     *
     * Он отделён от hover-анимации, чтобы два разных
     * источника движения не пытались одновременно
     * управлять свойствами y и scale.
     */
    <motion.div
      style={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }
          : reveal
      }
      className={[
        "w-fit lg:ml-auto",
        "will-change-[transform,opacity,filter]",
      ].join(" ")}
    >
      {/*
       * Внутренний слой сохраняет исходную hover-логику:
       * активный пункт слегка увеличивается,
       * соседние пункты раздвигаются и приглушаются.
       */}
      <motion.div
        animate={{
          y: getServiceOffset(),
          scale: isActive ? 1.008 : 1,
          opacity: isDimmed ? 0.25 : 1,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 1.05,
          ease,
        }}
        style={{
          position: "relative",
          zIndex: isActive ? 2 : 1,
        }}
      >
        <button
          type="button"
          onClick={() => {
            void onSelect();
          }}
          onMouseEnter={() =>
            onEnter(service.title, index)
          }
          onFocus={() =>
            onEnter(service.title, index)
          }
          onBlur={onLeave}
          className={[
            "relative block w-fit",
            "bg-transparent p-0",
            "text-left lg:text-right",
            "focus-visible:outline-none",
            "focus-visible:opacity-100",
          ].join(" ")}
          aria-label={`Go to selected work from ${service.title}`}
        >
          <span className="relative block py-[0.12em]">
            <span
              className={[
                "relative z-10 block",
                "text-[clamp(3rem,6vw,7rem)]",
                "font-medium leading-[0.94]",
                "tracking-[-0.065em]",
                "text-[var(--color-text)]",
              ].join(" ")}
            >
              {service.title}
            </span>

            {isShining && (
              <motion.span
                key={`${service.title}-${shineRun}`}
                aria-hidden="true"
                initial={{
                  opacity: 0.42,
                  backgroundPosition: "92% 0%",
                }}
                animate={{
                  opacity: [0.42, 0.34, 0],
                  backgroundPosition: [
                    "92% 0%",
                    "-55% 0%",
                    "-92% 0%",
                  ],
                }}
                transition={{
                  duration: 5.4,
                  times: [0, 0.9, 1],
                  ease,
                }}
                onAnimationComplete={() =>
                  onShineComplete(service.title)
                }
                className={[
                  "pointer-events-none",
                  "absolute inset-0 z-20",
                  "block",
                  "text-[clamp(3rem,6vw,7rem)]",
                  "font-medium leading-[0.94]",
                  "tracking-[-0.065em]",
                  "text-transparent",
                  "bg-[linear-gradient(105deg,transparent_36%,rgba(255,255,255,0.14)_45%,rgba(255,255,255,0.92)_49%,rgba(255,255,255,0.20)_53%,transparent_62%)]",
                  "bg-[length:300%_100%]",
                  "bg-clip-text",
                  "[-webkit-background-clip:text]",
                ].join(" ")}
              >
                {service.title}
              </motion.span>
            )}
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function WhatWeDoContent({
  progress,
  onNavigateToSelectedWork,
}: WhatWeDoContentProps) {
  const shouldReduceMotion =
    useReducedMotion() ?? false;

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const [shiningService, setShiningService] =
    useState<string | null>(null);

  const [shineRun, setShineRun] = useState(0);

  /*
   * SplitSection остаётся в текущем виде,
   * поэтому заголовок и базовый layout проявляются
   * через внешний motion-контейнер.
   *
   * Сами услуги затем появляются отдельно
   * через собственные диапазоны progress.
   */
  const sectionReveal = useReveal(
    progress,
    0.12,
    0.24,
  );

  /*
   * Фон и содержимое мягко подхватывают белый переход
   * из Hero. После проявления блок остаётся видимым
   * на всей hold-фазе сцены.
   */
  const contentVisibility = useTransform(
    progress,
    [0.08, 0.18],
    [0, 1],
  );

  function handleServiceEnter(
    title: string,
    index: number,
  ) {
    setActiveIndex(index);

    if (!shouldReduceMotion) {
      setShiningService(title);
      setShineRun(
        (currentRun) => currentRun + 1,
      );
    }
  }

  function handleServiceLeave() {
    setActiveIndex(null);
    setShiningService(null);
  }

  function handleShineComplete(title: string) {
    setShiningService((currentService) =>
      currentService === title
        ? null
        : currentService,
    );
  }

  return (
    <motion.div
      aria-label="What we do"
      style={{
        opacity: shouldReduceMotion
          ? 1
          : contentVisibility,
      }}
      className={[
        "absolute inset-0 z-20",
        "flex items-center",
        "bg-[var(--color-bg)]",
        "will-change-opacity",
      ].join(" ")}
    >
      <motion.div
        style={
          shouldReduceMotion
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }
            : sectionReveal
        }
        className={[
          "w-full",
          "will-change-[transform,opacity,filter]",
        ].join(" ")}
      >
        <SplitSection
          title="What we do."
          spacing="generous"
          layout="extra-wide"
        >
          <div
            className={[
              "flex flex-col",
              "gap-[clamp(10px,0.8vw,16px)]",
              "text-left lg:text-right",
            ].join(" ")}
            onMouseLeave={handleServiceLeave}
          >
            {services.map(
              (service, index) => (
                <ServiceRow
                  key={service.title}
                  service={service}
                  index={index}
                  progress={progress}
                  activeIndex={activeIndex}
                  shiningService={
                    shiningService
                  }
                  shineRun={shineRun}
                  shouldReduceMotion={
                    shouldReduceMotion
                  }
                  onEnter={
                    handleServiceEnter
                  }
                  onLeave={
                    handleServiceLeave
                  }
                  onShineComplete={
                    handleShineComplete
                  }
                  onSelect={
                    onNavigateToSelectedWork
                  }
                />
              ),
            )}
          </div>
        </SplitSection>
      </motion.div>
    </motion.div>
  );
}