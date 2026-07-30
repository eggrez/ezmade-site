"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

const projects = [1, 2, 3, 4];

const ease = [0.22, 1, 0.36, 1] as const;

export default function SelectedWork() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="selected-work"
      className="scroll-mt-24 bg-[var(--color-bg)] px-[clamp(32px,4vw,72px)] py-40"
    >
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
                y: 18,
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
          amount: 0.18,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 1.25,
          ease,
        }}
        className="flex justify-center"
      >
        <div className="flex w-full max-w-[1500px] justify-between gap-16">
          {/* Left */}
          <motion.div
            initial={
              shouldReduceMotion
                ? {
                    opacity: 1,
                    x: 0,
                  }
                : {
                    opacity: 0,
                    x: -18,
                  }
            }
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.1,
              delay: shouldReduceMotion ? 0 : 0.08,
              ease,
            }}
            className="w-[340px] shrink-0 pt-4 text-right"
          >
            <h2 className="text-[clamp(1.8rem,3vw,3rem)] font-medium tracking-[-0.04em] text-[var(--color-text-secondary)]">
              Selected
              <br />
              Work.
            </h2>
          </motion.div>

          {/* Right */}
          <div className="w-full max-w-[720px]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.16,
              }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: shouldReduceMotion
                      ? 0
                      : 0.12,
                    delayChildren: shouldReduceMotion
                      ? 0
                      : 0.18,
                  },
                },
              }}
              className="grid grid-cols-2 gap-8"
            >
              {projects.map((project) => (
                <motion.div
                  key={project}
                  variants={{
                    hidden: shouldReduceMotion
                      ? {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          filter: "blur(0px)",
                        }
                      : {
                          opacity: 0,
                          y: 24,
                          scale: 0.985,
                          filter: "blur(5px)",
                        },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                      transition: {
                        duration: shouldReduceMotion
                          ? 0
                          : 1.05,
                        ease,
                      },
                    },
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 1.015,
                          y: -3,
                        }
                  }
                  transition={{
                    duration: 0.65,
                    ease,
                  }}
                  className="aspect-[16/10] overflow-hidden rounded-sm bg-neutral-200"
                >
                  <div className="h-full w-full transition-opacity duration-500 hover:opacity-90" />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={
                shouldReduceMotion
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 0,
                      y: 14,
                    }
              }
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.8,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1,
                delay: shouldReduceMotion ? 0 : 0.42,
                ease,
              }}
              className="mt-20 flex justify-center"
            >
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-lg text-[var(--color-text-secondary)] transition-colors duration-500 hover:text-[var(--color-text)]"
              >
                <span>View all projects</span>

                <motion.span
                  aria-hidden="true"
                  className="inline-block"
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: 4,
                        }
                  }
                  transition={{
                    duration: 0.45,
                    ease,
                  }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}