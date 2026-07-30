"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { useState } from "react";

import type { Discipline } from "@/lib/disciplines";

type DisciplineMenuProps = {
  disciplines: Discipline[];
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function DisciplineMenu({
  disciplines,
}: DisciplineMenuProps) {
  const shouldReduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const [shiningSlug, setShiningSlug] =
    useState<string | null>(null);

  const [shineRun, setShineRun] = useState(0);

  function handleEnter(
    slug: string,
    index: number,
  ) {
    setActiveIndex(index);

    if (!shouldReduceMotion) {
      setShiningSlug(slug);
      setShineRun((currentRun) => currentRun + 1);
    }
  }

  function handleLeave() {
    setActiveIndex(null);
    setShiningSlug(null);
  }

  function getOffset(index: number) {
    if (
      shouldReduceMotion ||
      activeIndex === null ||
      index === activeIndex
    ) {
      return 0;
    }

    return index < activeIndex ? -16 : 16;
  }

  return (
    <nav
      aria-label="Project disciplines"
      className="w-full"
      onMouseLeave={handleLeave}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-[clamp(30px,3.8vw,92px)] gap-y-6 lg:flex-nowrap">
        {disciplines.map((discipline, index) => {
          const isActive = activeIndex === index;

          const isDimmed =
            activeIndex !== null &&
            activeIndex !== index;

          const isShining =
            shiningSlug === discipline.slug;

          return (
            <motion.div
              key={discipline.slug}
              animate={{
                x: getOffset(index),
                scale: isActive ? 1.012 : 1,
                opacity: isDimmed ? 0.28 : 1,
              }}
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : 1.05,
                ease,
              }}
              className="relative"
              style={{
                zIndex: isActive ? 2 : 1,
              }}
            >
              <Link
                href={`/work/${discipline.slug}`}
                className={[
                  "relative block whitespace-nowrap",
                  "text-[clamp(1.4rem,2.15vw,3.5rem)]",
                  "font-medium leading-none tracking-[-0.05em]",
                  "text-[var(--color-text)]",
                  "focus-visible:outline-none",
                  "focus-visible:opacity-100",
                ].join(" ")}
                onMouseEnter={() =>
                  handleEnter(
                    discipline.slug,
                    index,
                  )
                }
                onFocus={() =>
                  handleEnter(
                    discipline.slug,
                    index,
                  )
                }
                onBlur={handleLeave}
              >
                <span className="relative block py-[0.08em]">
                  <span className="relative z-10 block">
                    {discipline.title}
                  </span>

                  {isShining && (
                    <motion.span
                      key={`${discipline.slug}-${shineRun}`}
                      aria-hidden="true"
                      initial={{
                        opacity: 0.4,
                        backgroundPosition: "92% 0%",
                      }}
                      animate={{
                        opacity: [0.4, 0.32, 0],
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
                        setShiningSlug(
                          (currentSlug) =>
                            currentSlug ===
                            discipline.slug
                              ? null
                              : currentSlug,
                        );
                      }}
                      className={[
                        "pointer-events-none absolute inset-0 z-20",
                        "block",
                        "text-transparent",
                        "bg-[linear-gradient(105deg,transparent_36%,rgba(255,255,255,0.14)_45%,rgba(255,255,255,0.92)_49%,rgba(255,255,255,0.20)_53%,transparent_62%)]",
                        "bg-[length:300%_100%]",
                        "bg-clip-text",
                        "[-webkit-background-clip:text]",
                      ].join(" ")}
                    >
                      {discipline.title}
                    </motion.span>
                  )}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}