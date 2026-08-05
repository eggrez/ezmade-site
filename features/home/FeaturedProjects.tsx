"use client";

import {
  motion,
  type MotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useState } from "react";

import ProjectCard from "@/components/projects/ProjectCard";
import TransitionLink from "@/components/transitions/TransitionLink";
import { projects } from "@/lib/projects";

type FeaturedProjectsSceneProps = {
  progress: MotionValue<number>;
};

const layerKeepAliveOpacity = 0.012;

type CardMotion = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

function getCardMotion(index: number, activeIndex: number | null): CardMotion {
  if (activeIndex === null) {
    return {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: 1,
    };
  }

  if (index === activeIndex) {
    return {
      x: 0,
      y: 0,
      scale: 1.012,
      opacity: 1,
      zIndex: 10,
    };
  }

  const currentRow = Math.floor(index / 2);
  const currentColumn = index % 2;

  const activeRow = Math.floor(activeIndex / 2);
  const activeColumn = activeIndex % 2;

  const horizontalDirection =
    currentColumn === activeColumn ? 0 : currentColumn > activeColumn ? 1 : -1;

  const verticalDirection =
    currentRow === activeRow ? 0 : currentRow > activeRow ? 1 : -1;

  return {
    x: horizontalDirection * 14,
    y: verticalDirection * 12,
    scale: 0.992,
    opacity: 0.82,
    zIndex: 1,
  };
}

type AnimatedProjectProps = {
  index: number;
  activeIndex: number | null;
  progress: MotionValue<number>;
  shouldReduceMotion: boolean;
  children: React.ReactNode;
  onActivate: () => void;
  onDeactivate: () => void;
};

function AnimatedProject({
  index,
  activeIndex,
  progress,
  shouldReduceMotion,
  children,
  onActivate,
  onDeactivate,
}: AnimatedProjectProps) {
  const cardMotion = getCardMotion(index, activeIndex);

  /*
 * Карточки раскрываются медленнее и сильнее перекрываются.
 * Последняя карточка полностью появляется примерно к 0.62.
 */
const revealStart = 0.12 + index * 0.055;
const revealEnd = 0.42 + index * 0.055;

  const revealOpacity = useTransform(
    progress,
    [revealStart, revealEnd],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );

 const revealY = useTransform(
  progress,
  [revealStart, revealEnd],
  shouldReduceMotion ? [0, 0] : [56, 0],
);

const revealScale = useTransform(
  progress,
  [revealStart, revealEnd],
  shouldReduceMotion ? [1, 1] : [0.965, 1],
);

const revealBlur = useTransform(
  progress,
  [revealStart, revealEnd],
  shouldReduceMotion
    ? ["blur(0px)", "blur(0px)"]
    : ["blur(12px)", "blur(0px)"],
);

  return (
    <motion.div
      style={{
        opacity: revealOpacity,
        y: revealY,
        scale: revealScale,
        filter: revealBlur,
      }}
      className="will-change-[transform,opacity,filter]"
    >
      <motion.div
        animate={
          shouldReduceMotion
            ? {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
              }
            : {
                x: cardMotion.x,
                y: cardMotion.y,
                scale: cardMotion.scale,
                opacity: cardMotion.opacity,
              }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.95,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "relative",
          zIndex: cardMotion.zIndex,
        }}
        onMouseEnter={onActivate}
        onFocusCapture={onActivate}
        onBlurCapture={onDeactivate}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function FeaturedProjectsScene({
  progress,
}: FeaturedProjectsSceneProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const featuredProjects = projects.slice(0, 4);

  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(
    null,
  );

  const titleOpacity = useTransform(
  progress,
  [0.06, 0.3],
  shouldReduceMotion ? [1, 1] : [0, 1],
);

const titleY = useTransform(
  progress,
  [0.06, 0.3],
  shouldReduceMotion ? [0, 0] : [28, 0],
);

const titleScale = useTransform(
  progress,
  [0.06, 0.3],
  shouldReduceMotion ? [1, 1] : [0.98, 1],
);

const titleBlur = useTransform(
  progress,
  [0.06, 0.3],
  shouldReduceMotion
    ? ["blur(0px)", "blur(0px)"]
    : ["blur(10px)", "blur(0px)"],
);

  const buttonOpacity = useTransform(
  progress,
  [0.56, 0.82],
  shouldReduceMotion ? [1, 1] : [layerKeepAliveOpacity, 1],
);

const buttonY = useTransform(
  progress,
  [0.56, 0.82],
  shouldReduceMotion ? [0, 0] : [28, 0],
);

const buttonScale = useTransform(
  progress,
  [0.56, 0.82],
  shouldReduceMotion ? [1, 1] : [0.975, 1],
);

const buttonBlur = useTransform(
  progress,
  [0.56, 0.82],
  shouldReduceMotion
    ? ["blur(0px)", "blur(0px)"]
    : ["blur(8px)", "blur(0px)"],
);

  return (
    <section
      id="selected-work"
      className={[
  "flex h-full w-full items-start",
  "bg-[var(--color-bg)]",
  "px-[clamp(24px,4vw,72px)]",

  "pt-[clamp(7.5rem,16svh,10.5rem)]",
  "pb-8",

  "[@media(max-width:390px)_and_(max-height:720px)]:pt-[5rem]",
  "[@media(max-width:390px)_and_(max-height:720px)]:pb-3",

  "[@media(min-width:768px)_and_(max-width:1023px)]:pt-[6rem]",
  "[@media(min-width:768px)_and_(max-width:1023px)]:pb-4",
  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:pt-[5.5rem]",
"[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:pb-3",

  "lg:items-center",
  "lg:py-[clamp(28px,5vh,64px)]",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!items-start",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!pt-[5.5rem]",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!pb-3",
].join(" ")}
    >
      <div
        className={[
  "mx-auto grid w-full max-w-[1800px]",
  "grid-cols-1 gap-6",
  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:gap-4",

  "lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.65fr)]",
  "lg:gap-[clamp(48px,7vw,140px)]",

  "[@media(min-width:1024px)_and_(max-width:1180px)]:!grid-cols-1",
  "[@media(min-width:1024px)_and_(max-width:1180px)]:!gap-6",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!grid-cols-1",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!gap-3",
].join(" ")}
      >
       <motion.div
  style={{
    opacity: titleOpacity,
    y: titleY,
    scale: titleScale,
    filter: titleBlur,
  }}
  className={[
  "relative",
  "text-left",
  "will-change-[transform,opacity,filter]",

  "lg:w-[300px]",
  "lg:justify-self-start",
  "lg:right-10",
  "lg:pt-3",
  "lg:text-right",

  "[@media(min-width:1024px)_and_(max-width:1180px)]:!w-auto",
  "[@media(min-width:1024px)_and_(max-width:1180px)]:!right-0",
  "[@media(min-width:1024px)_and_(max-width:1180px)]:!pt-0",
  "[@media(min-width:1024px)_and_(max-width:1180px)]:!text-left",

  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!w-auto",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!right-0",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!pt-0",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!text-left",
].join(" ")}
>
  <h2
    className={[
      "text-[1.8rem]",
      "font-medium leading-[0.95]",
      "tracking-[-0.04em]",
      "text-[var(--color-text-secondary)]",

      "lg:text-[clamp(1.8rem,2.5vw,3.2rem)]",
      "lg:leading-[0.94]",
      "lg:tracking-[-0.055em]",
      "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!text-[1.7rem]",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!leading-none",
    ].join(" ")}
  >
    <span className="lg:hidden [@media(min-width:1024px)_and_(max-width:1180px)]:!inline">
  Selected Work.
</span>

<span className="hidden lg:inline [@media(min-width:1024px)_and_(max-width:1180px)]:!hidden">
  Selected
  <br />
  Work.
</span>
  </h2>
</motion.div>

        <div className="w-full">
          <div
            className={[
  "grid grid-cols-1",
  "gap-4",

  "[@media(max-width:390px)_and_(max-height:720px)]:gap-2.5",
  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:gap-2.5",

  "md:gap-3",

  "lg:grid-cols-2",
  "lg:gap-[clamp(12px,2vw,32px)]",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!grid-cols-2",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!gap-1.5",
].join(" ")}
            onMouseLeave={() => setActiveProjectIndex(null)}
          >
            {featuredProjects.map((project, index) => (
<div
  key={project.slug}
 className={[
  "mx-auto w-full",

  "[@media(max-width:390px)_and_(max-height:720px)]:max-w-[310px]",
  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:max-w-[300px]",

  "md:max-w-[560px]",
  "[@media(min-width:768px)_and_(max-width:819px)]:max-w-[520px]",

  "lg:max-w-none",

  "[@media(min-width:1024px)_and_(max-width:1180px)]:!max-w-none",
 "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!max-w-[300px]",
 "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mx-auto",

  index === 2
    ? "hidden lg:block"
    : "",
].join(" ")}
>
    <AnimatedProject
      index={index}
      activeIndex={activeProjectIndex}
      progress={progress}
      shouldReduceMotion={shouldReduceMotion}
      onActivate={() => setActiveProjectIndex(index)}
      onDeactivate={() => setActiveProjectIndex(null)}
    >
      <ProjectCard project={project} />
    </AnimatedProject>
  </div>
))}
          </div>

          <motion.div
            style={{
              opacity: buttonOpacity,
              y: buttonY,
              scale: buttonScale,
              filter: buttonBlur,
            }}
           className={[
  "transform-gpu [backface-visibility:hidden]",
  "will-change-[transform,opacity,filter]",
  "mt-[clamp(24px,4vh,60px)]",

  "[@media(max-width:390px)_and_(max-height:720px)]:mt-3",
  "[@media(min-width:540px)_and_(max-width:767px)_and_(max-height:720px)]:mt-3",
  "[@media(min-width:768px)_and_(max-width:819px)]:mt-8",
"[@media(min-width:820px)_and_(max-width:1023px)]:mt-8",
"[@media(min-width:1024px)_and_(max-width:1180px)]:mt-10",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mt-2",

  "flex justify-center",
].join(" ")}
          >
            <TransitionLink
              href="/work"
              transitionIntent="from-works"
              className={[
                "ez-glass-control group relative isolate",
                "inline-flex items-center justify-center",
                "overflow-hidden rounded-full",
                "border border-black/[0.10]",
                "bg-white/[0.24]",
                "px-6 py-3",
"text-sm font-normal leading-none",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!px-5",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!py-2.5",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!text-xs",
"[@media(min-width:768px)_and_(max-width:1023px)]:px-8",
"[@media(min-width:768px)_and_(max-width:1023px)]:py-3.5",
"[@media(min-width:768px)_and_(max-width:1023px)]:text-base",


"[@media(min-width:1024px)_and_(max-width:1180px)]:px-9",
"[@media(min-width:1024px)_and_(max-width:1180px)]:py-4",
"[@media(min-width:1024px)_and_(max-width:1180px)]:text-base",
                "text-[var(--color-text)]",

                "shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_30px_rgba(17,17,17,0.04)]",
                "backdrop-blur-xl",

                "transition-[border-color,box-shadow,transform]",
                "duration-700",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",

                "hover:scale-[1.035]",
                "hover:border-white/[0.32]",
                "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_14px_38px_rgba(17,17,17,0.14)]",

                "focus-visible:outline-none",
                "focus-visible:ring-1",
                "focus-visible:ring-black/20",
                "focus-visible:ring-offset-2",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute inset-0 -z-20",
                  "bg-black/[0.84]",
                  "opacity-0",
                  "transition-opacity duration-700",
                  "group-hover:opacity-100",
                  "group-focus-visible:opacity-100",
                ].join(" ")}
              />

              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "-left-[45%] top-[-130%] -z-10",
                  "h-[360%] w-[72%] rotate-[22deg]",
                  "bg-gradient-to-r",
                  "from-transparent via-white/45 to-transparent",
                  "blur-md",
                  "transition-transform duration-[1600ms]",
                  "ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover:translate-x-[240%]",
                  "group-focus-visible:translate-x-[240%]",
                ].join(" ")}
              />

              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute",
                  "inset-[1px] -z-10",
                  "rounded-full",
                  "bg-gradient-to-b",
                  "from-white/20 to-transparent",
                ].join(" ")}
              />

              <span
                className={[
                  "relative z-10",
                  "transition-colors duration-700",
                  "group-hover:text-white",
                  "group-focus-visible:text-white",
                ].join(" ")}
              >
                View all projects
              </span>
            </TransitionLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}