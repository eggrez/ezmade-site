"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import SplitSection from "@/components/layout/SplitSection";

const services = [
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

export default function WhatWeDo() {
  const shouldReduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const [shiningService, setShiningService] =
    useState<string | null>(null);

  const [shineRun, setShineRun] = useState(0);

  function handleServiceEnter(
    title: string,
    index: number,
  ) {
    setActiveIndex(index);

    if (!shouldReduceMotion) {
      setShiningService(title);
      setShineRun((currentRun) => currentRun + 1);
    }
  }

  function handleServiceLeave() {
    setActiveIndex(null);
    setShiningService(null);
  }

  function getServiceOffset(index: number) {
    if (
      shouldReduceMotion ||
      activeIndex === null ||
      index === activeIndex
    ) {
      return 0;
    }

    return index < activeIndex ? -14 : 14;
  }

  function scrollToSelectedWork() {
    document
      .getElementById("selected-work")
      ?.scrollIntoView({
        behavior: shouldReduceMotion
          ? "auto"
          : "smooth",
        block: "start",
      });
  }

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }
          : {
              opacity: 0,
              y: 14,
              scale: 0.992,
              filter: "blur(6px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.28,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 1.25,
        ease,
      }}
    >
      <SplitSection
        title="What we do."
        spacing="generous"
        layout="extra-wide"
      >
        <div
          className="flex flex-col gap-[clamp(10px,0.8vw,16px)] text-left lg:text-right"
          onMouseLeave={handleServiceLeave}
        >
          {services.map((service, index) => {
            const isActive = activeIndex === index;

            const isDimmed =
              activeIndex !== null &&
              activeIndex !== index;

            const isShining =
              shiningService === service.title;

            return (
              <motion.div
                key={service.title}
                animate={{
                  y: getServiceOffset(index),
                  scale: isActive ? 1.008 : 1,
                  opacity: isDimmed ? 0.25 : 1,
                }}
                transition={{
                  duration: shouldReduceMotion
                    ? 0
                    : 1.05,
                  ease,
                }}
                className="w-fit lg:ml-auto"
                style={{
                  position: "relative",
                  zIndex: isActive ? 2 : 1,
                }}
              >
                <button
                  type="button"
                  onClick={scrollToSelectedWork}
                  onMouseEnter={() =>
                    handleServiceEnter(
                      service.title,
                      index,
                    )
                  }
                  onFocus={() =>
                    handleServiceEnter(
                      service.title,
                      index,
                    )
                  }
                  onBlur={handleServiceLeave}
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
                    <span className="relative z-10 block text-[clamp(3rem,6vw,7rem)] font-medium leading-[0.94] tracking-[-0.065em] text-[var(--color-text)]">
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
                        onAnimationComplete={() => {
                          setShiningService(
                            (currentService) =>
                              currentService ===
                              service.title
                                ? null
                                : currentService,
                          );
                        }}
                        className={[
                          "pointer-events-none absolute inset-0 z-20",
                          "block text-[clamp(3rem,6vw,7rem)]",
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
            );
          })}
        </div>
      </SplitSection>
    </motion.div>
  );
}