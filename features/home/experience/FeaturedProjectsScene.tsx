"use client";

import {
  motion,
  MotionValue,
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

type CardMotion = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

function getCardMotion(
  index: number,
  activeIndex: number | null,
): CardMotion {
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
    currentColumn === activeColumn
      ? 0
      : currentColumn > activeColumn
        ? 1
        : -1;

  const verticalDirection =
    currentRow === activeRow
      ? 0
      : currentRow > activeRow
        ? 1
        : -1;

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
  const start = 0.14 + index * 0.07;
  const end = start + 0.2;

  const revealOpacity = useTransform(
    progress,
    [start, end],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );

  const revealY = useTransform(
    progress,
    [start, end],
    shouldReduceMotion ? [0, 0] : [42, 0],
  );

  const revealScale = useTransform(
    progress,
    [start, end],
    shouldReduceMotion ? [1, 1] : [0.975, 1],
  );

  const revealBlur = useTransform(
    progress,
    [start, end],
    shouldReduceMotion
      ? ["blur(0px)", "blur(0px)"]
      : ["blur(9px)", "blur(0px)"],
  );

  const cardMotion = getCardMotion(
    index,
    activeIndex,
  );

  return (
    <motion.div
      style={{
        opacity: revealOpacity,
        y: revealY,
        scale: revealScale,
        filter: revealBlur,
      }}
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
  const shouldReduceMotion =
    useReducedMotion() ?? false;

  const featuredProjects = projects.slice(0, 4);

  const [
    activeProjectIndex,
    setActiveProjectIndex,
  ] = useState<number | null>(null);

  const titleOpacity = useTransform(
    progress,
    [0.04, 0.22],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );

  const titleX = useTransform(
    progress,
    [0.04, 0.22],
    shouldReduceMotion ? [0, 0] : [-32, 0],
  );

  const titleBlur = useTransform(
    progress,
    [0.04, 0.22],
    shouldReduceMotion
      ? ["blur(0px)", "blur(0px)"]
      : ["blur(8px)", "blur(0px)"],
  );

  const buttonOpacity = useTransform(
    progress,
    [0.55, 0.74],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );

  const buttonY = useTransform(
    progress,
    [0.55, 0.74],
    shouldReduceMotion ? [0, 0] : [18, 0],
  );

  return (
    <section
      id="selected-work"
      className={[
        "flex h-full w-full items-center",
        "bg-[var(--color-bg)]",
        "px-[clamp(24px,4vw,72px)]",
        "py-[clamp(28px,5vh,64px)]",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto grid w-full max-w-[1800px]",
          "grid-cols-1 gap-8",
          "lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.65fr)]",
          "lg:gap-[clamp(48px,7vw,140px)]",
        ].join(" ")}
      >
        <motion.div
          style={{
            opacity: titleOpacity,
            x: titleX,
            filter: titleBlur,
          }}
          className="lg:pt-3 lg:text-right"
        >
          <h2
            className={[
              "text-[clamp(2rem,4vw,4.5rem)]",
              "font-medium leading-[0.94]",
              "tracking-[-0.055em]",
              "text-[var(--color-text-secondary)]",
            ].join(" ")}
          >
            Selected
            <br />
            Work.
          </h2>
        </motion.div>

        <div className="w-full">
          <div
            className={[
              "grid grid-cols-2",
              "gap-[clamp(12px,2vw,32px)]",
            ].join(" ")}
            onMouseLeave={() =>
              setActiveProjectIndex(null)
            }
          >
            {featuredProjects.map(
              (project, index) => (
                <AnimatedProject
                  key={project.slug}
                  index={index}
                  activeIndex={activeProjectIndex}
                  progress={progress}
                  shouldReduceMotion={
                    shouldReduceMotion
                  }
                  onActivate={() =>
                    setActiveProjectIndex(index)
                  }
                  onDeactivate={() =>
                    setActiveProjectIndex(null)
                  }
                >
                  <ProjectCard project={project} />
                </AnimatedProject>
              ),
            )}
          </div>

          <motion.div
            style={{
              opacity: buttonOpacity,
              y: buttonY,
            }}
            className={[
              "mt-[clamp(24px,4vh,60px)]",
              "flex justify-center",
            ].join(" ")}
          >
            <TransitionLink
              href="/work"
              className={[
                "group relative isolate",
                "inline-flex items-center justify-center",
                "overflow-hidden rounded-full",
                "border border-black/[0.10]",
                "bg-white/[0.24]",
                "px-6 py-3",
                "text-sm font-normal leading-none",
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