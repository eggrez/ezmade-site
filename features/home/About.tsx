"use client";

import { motion, useReducedMotion } from "framer-motion";

import Section from "@/components/layout/Section";
import WideContainer from "@/components/layout/WideContainer";
import PortraitImage from "@/components/media/PortraitImage";

const ease = [0.22, 1, 0.36, 1] as const;

export default function About() {
  const shouldReduceMotion = useReducedMotion();

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
              scale: 0.994,
              filter: "blur(5px)",
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
        amount: 0.3,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 1.35,
        ease,
      }}
    >
      <Section id="about" spacing="generous">
        <WideContainer>
          <div className="grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-[clamp(72px,7vw,160px)]">
            {/* Left title */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? {
                      opacity: 1,
                      x: 0,
                    }
                  : {
                      opacity: 0,
                      x: -12,
                    }
              }
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.45,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1.1,
                ease,
              }}
              className="lg:pt-4 lg:text-right"
            >
              <h2 className="text-[clamp(1.8rem,2.5vw,3rem)] font-medium leading-none tracking-[-0.04em] text-[var(--color-text-secondary)]">
                About
                <br />
                <span className="block h-8" />
                EZ.
              </h2>
            </motion.div>

            {/* Right content */}
            <div className="min-w-0">
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
                        filter: "blur(4px)",
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
                  amount: 0.35,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.25,
                  delay: shouldReduceMotion ? 0 : 0.12,
                  ease,
                }}
                className="flex lg:justify-end"
              >
                <motion.div
                  initial="rest"
                  animate="rest"
                  whileHover={shouldReduceMotion ? "rest" : "hover"}
                  whileFocus={shouldReduceMotion ? "rest" : "hover"}
                  className={[
                    "group relative aspect-[4/5]",
                    "w-full max-w-[620px]",
                    "overflow-hidden rounded-sm",
                    "bg-neutral-200",
                    "outline-none",
                  ].join(" ")}
                  tabIndex={0}
                >
                  {/* Portrait */}
                  <motion.div
                    className="absolute inset-0"
                    variants={{
                      rest: {
                        scale: 1,
                        filter:
                          "grayscale(1) saturate(0) contrast(0.96) brightness(0.97)",
                      },
                      hover: {
                        scale: 1.055,
                        filter:
                          "grayscale(0) saturate(1) contrast(1) brightness(1)",
                      },
                    }}
                    transition={{
                      duration: 1.65,
                      ease,
                    }}
                  >
                    <PortraitImage
                      src="/images/about/egor-grigoriev.jpg"
                      alt="Egor Grigoriev portrait"
                    />
                  </motion.div>

                  {/* Soft matte veil */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-white"
                    variants={{
                      rest: {
                        opacity: 0.08,
                      },
                      hover: {
                        opacity: 0,
                      },
                    }}
                    transition={{
                      duration: 1.5,
                      ease,
                    }}
                  />

                  {/* Slow glass reflection */}
                  <motion.div
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute",
                      "-left-[70%] top-[-70%]",
                      "h-[260%] w-[48%]",
                      "rotate-[18deg]",
                      "bg-gradient-to-r",
                      "from-transparent",
                      "via-white/22",
                      "to-transparent",
                      "blur-2xl",
                      "mix-blend-screen",
                    ].join(" ")}
                    variants={{
                      rest: {
                        x: "-15%",
                        opacity: 0,
                      },
                      hover: {
                        x: "420%",
                        opacity: [0, 0.32, 0.2, 0],
                      },
                    }}
                    transition={{
                      x: {
                        duration: 4.2,
                        ease,
                      },
                      opacity: {
                        duration: 4.2,
                        times: [0, 0.08, 0.86, 1],
                        ease,
                      },
                    }}
                  />

                  {/* Delicate glass edge */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[1px] rounded-[1px] border border-white/40"
                    variants={{
                      rest: {
                        opacity: 0,
                      },
                      hover: {
                        opacity: 0.65,
                      },
                    }}
                    transition={{
                      duration: 1.2,
                      ease,
                    }}
                  />

                  {/* Soft depth */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                    variants={{
                      rest: {
                        opacity: 0,
                      },
                      hover: {
                        opacity: 1,
                      },
                    }}
                    transition={{
                      duration: 1.2,
                      ease,
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={
                  shouldReduceMotion
                    ? {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }
                    : {
                        opacity: 0,
                        y: 14,
                        filter: "blur(3px)",
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                viewport={{
                  once: true,
                  amount: 0.45,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.15,
                  delay: shouldReduceMotion ? 0 : 0.22,
                  ease,
                }}
                className="mt-14 flex lg:justify-end"
              >
                <div className="w-full max-w-[620px] space-y-8">
                  <p className="text-[clamp(1.4rem,2vw,2rem)] leading-[1.28] tracking-[-0.04em] text-[var(--color-text)]">
                    EZ is a creative production studio founded by Egor
                    Grigoriev, specializing in cinematic commercials,
                    product films and visual storytelling.
                  </p>

                  <p className="max-w-[560px] text-[clamp(1.05rem,1.25vw,1.3rem)] leading-[1.65] tracking-[-0.02em] text-[var(--color-text-secondary)]">
                    Made easy isn&apos;t about making the work easier.
                    It&apos;s about making the process effortless for
                    our clients while never compromising on craft.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </WideContainer>
      </Section>
    </motion.div>
  );
}