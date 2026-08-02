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
  className={[
    "flex h-full items-center",

    "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:items-start",
    "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:pt-[5.25rem]",
  ].join(" ")}
>
        <WideContainer>
          <div
  className={[
    "grid items-stretch",
    "gap-8",

    "[@media(max-height:720px)]:gap-4",

    "[@media(min-width:768px)_and_(max-width:1279px)]:-translate-y-[clamp(1.5rem,4vh,3.5rem)]",
    "[@media(min-width:540px)_and_(max-width:1279px)]:gap-6",

    "xl:translate-y-0",
    "xl:gap-[clamp(72px,7vw,160px)]",
    "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:items-center",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:gap-10",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:translate-y-0",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!gap-12",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!translate-y-0",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:items-center",
    "xl:grid-cols-[minmax(0,1fr)_minmax(420px,620px)]",
  ].join(" ")}
>
            {/* Left side */}

            <div
  className={[
    "mt-10 flex min-w-0 items-center",

    "[@media(max-height:720px)]:mt-16",
"[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:!mt-0",
    "[@media(min-width:768px)_and_(max-width:1279px)]:mt-20",
    "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mt-0",

    "xl:mt-0",
    "[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!mt-0",
  ].join(" ")}
>
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

 "text-[3rem]",
"leading-[0.9]",
"[@media(min-width:1024px)_and_(max-height:700px)]:text-[2.5rem]",
"[@media(max-height:720px)]:text-[2.35rem]",
"[@media(max-height:720px)]:leading-[0.92]",

  "xl:text-[clamp(4rem,7.2vw,9rem)]",
  "[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!text-[2.75rem]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!leading-[0.92]",
  "xl:leading-[0.86]",

  "font-medium",
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
                    "mt-8",
"[@media(max-height:720px)]:text-[0.8rem]",
"lg:mt-[clamp(34px,4vw,64px)]",
                    "[@media(min-width:1024px)_and_(max-height:700px)]:max-w-[280px]",

"[@media(min-width:540px)_and_(max-width:767px)]:max-w-[38ch]",
"[@media(min-width:768px)_and_(max-width:1279px)]:max-w-[46ch]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!mt-8",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!max-w-[34ch]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!text-[0.9rem]",
                    "pl-[4px]",
                    "text-[clamp(1rem,1.15vw,1.22rem)]",
                    "[@media(min-width:540px)_and_(max-width:767px)]:text-[0.92rem]",
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
              <div
  className={[
    "mx-auto w-full",
    "max-w-[520px]",

    "[@media(min-width:540px)_and_(max-width:767px)]:max-w-[430px]",
    "[@media(min-width:768px)_and_(max-width:1023px)]:max-w-[560px]",
    "[@media(min-width:1024px)_and_(max-width:1279px)]:max-w-[620px]",

   "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:max-w-[350px]",

    "xl:ml-auto",
    "xl:mr-0",
    "xl:max-w-[620px]",
    "[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!max-w-[420px]",
  ].join(" ")}
>
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
  "aspect-[4/4.6]",
  "[@media(min-width:1024px)_and_(max-height:700px)]:aspect-[4/3.9]",
  "w-full",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:aspect-[4/5]",
  "overflow-hidden",
  "rounded-sm",
  "bg-neutral-200",
  "outline-none",

  "[@media(max-width:430px)_and_(max-height:720px)]:mx-auto",
"[@media(max-width:430px)_and_(max-height:720px)]:w-[80%]",

"[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:mx-auto",
"[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:w-[68%]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!mt-4",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!aspect-[4/4.6]",
  "xl:w-full",
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
  className="[@media(min-width:1024px)_and_(max-height:700px)]:object-[75%_center]"
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
                 className={[
  "mt-6 w-full",

  "[@media(max-width:430px)_and_(max-height:720px)]:mx-auto",
  "[@media(max-width:430px)_and_(max-height:720px)]:w-[80%]",

  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:mx-auto",
  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:w-[68%]",

  "[@media(max-height:720px)]:mt-3",
  "[@media(min-width:540px)_and_(max-width:1279px)]:mt-4",

  "xl:mt-10",
].join(" ")}
                >
                  <p
                    className={[
  "w-full",
  "text-[0.88rem]",
  "min-[390px]:text-[1.05rem]",
  "leading-[1.35]",

  "max-w-[34ch]",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:max-w-none",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:text-[0.95rem]",

  "[@media(max-width:430px)_and_(max-height:720px)]:max-w-none",

  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:max-w-none",

  "[@media(min-width:768px)_and_(max-width:1023px)]:max-w-[64ch]",
  "[@media(min-width:768px)_and_(max-width:1279px)]:leading-[1.3]",

  "[@media(min-width:1024px)_and_(max-width:1279px)]:max-w-[88ch]",

  "lg:text-[clamp(1.25rem,1.7vw,1.85rem)]",
  "lg:leading-[1.3]",
  "[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!max-w-[420px]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!text-[1rem]",
"[@media(min-width:1200px)_and_(max-width:1400px)_and_(max-height:900px)]:!leading-[1.3]",

  "xl:max-w-none",

  "tracking-[-0.04em]",
  "text-[var(--color-text)]",
].join(" ")}
                  >
                    EZ is a creative production studio founded{" "}
<span className="whitespace-nowrap">
   by Egor Grigoriev
</span>
, specializing in cinematic commercials, product films and visual storytelling.
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