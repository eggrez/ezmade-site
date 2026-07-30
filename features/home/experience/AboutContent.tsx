"use client";

import {
  motion,
  useReducedMotion,
  useTransform,
} from "framer-motion";

import Section from "@/components/layout/Section";
import WideContainer from "@/components/layout/WideContainer";
import PortraitImage from "@/components/media/PortraitImage";

import type { HomeSceneProps } from "./types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function AboutContent({
  progress,
}: HomeSceneProps) {
  const shouldReduceMotion = useReducedMotion();

  /*
   * Inside About there is no additional blur or scale.
   * The content enters with soft opacity and vertical motion.
   */

  const titleOpacity = useTransform(
    progress,
    [0.04, 0.28],
    [0, 1],
  );

  const titleY = useTransform(
    progress,
    [0.04, 0.28],
    [24, 0],
  );

  const imageOpacity = useTransform(
    progress,
    [0.1, 0.34],
    [0, 1],
  );

  const imageY = useTransform(
    progress,
    [0.1, 0.34],
    [18, 0],
  );

  const textOpacity = useTransform(
    progress,
    [0.22, 0.46],
    [0, 1],
  );

  const textY = useTransform(
    progress,
    [0.22, 0.46],
    [12, 0],
  );

  return (
    <div className="h-full w-full">
      <Section
        id="about"
        spacing="generous"
        className="flex h-full items-center"
      >
        <WideContainer>
          <div
            className={[
              "grid items-stretch",
              "gap-14",
              "lg:grid-cols-[minmax(0,1fr)_minmax(420px,620px)]",
              "lg:gap-[clamp(72px,7vw,160px)]",
            ].join(" ")}
          >
            {/* Left side */}

            <div className="flex min-w-0 items-center">
              <div className="w-full">
                <motion.h2
                  style={{
                    opacity: shouldReduceMotion
                      ? 1
                      : titleOpacity,
                    y: shouldReduceMotion ? 0 : titleY,
                  }}
                  className={[
                    "whitespace-nowrap",
                    "text-[clamp(4rem,7.2vw,9rem)]",
                    "font-medium",
                    "leading-[0.86]",
                    "tracking-[-0.075em]",
                    "text-[var(--color-text)]",
                  ].join(" ")}
                >
                  Made easy.
                </motion.h2>

                <motion.p
                  style={{
                    opacity: shouldReduceMotion
                      ? 1
                      : textOpacity,
                    y: shouldReduceMotion ? 0 : textY,
                  }}
                  className={[
                    "mt-[clamp(34px,4vw,64px)]",
                    "max-w-[540px]",
                    "pl-[4px]",
                    "text-[clamp(1rem,1.15vw,1.22rem)]",
                    "leading-[1.6]",
                    "tracking-[-0.025em]",
                    "text-[var(--color-text-secondary)]",
                  ].join(" ")}
                >
                  Made easy isn&apos;t about making the work
                  easier. It&apos;s about making the process
                  effortless for our clients while never
                  compromising on craft.
                </motion.p>
              </div>
            </div>

            {/* Right side */}

            <div className="w-full">
              <div className="ml-auto w-full max-w-[620px]">
                <motion.div
                  style={{
                    opacity: shouldReduceMotion
                      ? 1
                      : imageOpacity,
                    y: shouldReduceMotion ? 0 : imageY,
                  }}
                >
                  <motion.div
                    initial="rest"
                    animate="rest"
                    whileHover={
                      shouldReduceMotion ? "rest" : "hover"
                    }
                    whileFocus={
                      shouldReduceMotion ? "rest" : "hover"
                    }
                    className={[
                      "group relative",
                      "aspect-[4/5]",
                      "w-full",
                      "overflow-hidden",
                      "rounded-sm",
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
                      className={[
                        "pointer-events-none",
                        "absolute inset-[1px]",
                        "rounded-[1px]",
                        "border border-white/40",
                      ].join(" ")}
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
                      className={[
                        "pointer-events-none",
                        "absolute inset-0",
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
                      ].join(" ")}
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

                {/* Studio description */}

                <motion.div
                  style={{
                    opacity: shouldReduceMotion
                      ? 1
                      : textOpacity,
                    y: shouldReduceMotion ? 0 : textY,
                  }}
                  className="mt-10 w-full"
                >
                  <p
                    className={[
                      "w-full",
                      "text-[clamp(1.25rem,1.7vw,1.85rem)]",
                      "leading-[1.3]",
                      "tracking-[-0.04em]",
                      "text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    EZ is a creative production studio founded
                    <br className="hidden lg:block" />
                    <span className="hidden lg:inline"> </span>
                    by{" "}
                    <span className="whitespace-nowrap">
                      Egor Grigoriev
                    </span>
                    , specializing in cinematic commercials,
                    product films and visual storytelling.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </WideContainer>
      </Section>
    </div>
  );
}