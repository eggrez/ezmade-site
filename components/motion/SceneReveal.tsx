"use client";

import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";

type SceneRevealProps = {
  progress: MotionValue<number>;
  children: ReactNode;

  start?: number;
  end?: number;

  fromY?: number;
  fromScale?: number;
  fromBlur?: number;

  className?: string;
};

export default function SceneReveal({
  progress,
  children,

  start = 0.9,
  end = 1,

  fromY = 40,
  fromScale = 0.985,
  fromBlur = 10,

  className = "",
}: SceneRevealProps) {
  const shouldReduceMotion =
    useReducedMotion() ?? false;

  const opacity = useTransform(
    progress,
    [start, end],
    [0, 1],
  );

  const y = useTransform(
    progress,
    [start, end],
    [fromY, 0],
  );

  const scale = useTransform(
    progress,
    [start, end],
    [fromScale, 1],
  );

  const blur = useTransform(
    progress,
    [start, end],
    [fromBlur, 0],
  );

  const filter =
    useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      style={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }
          : {
              opacity,
              y,
              scale,
              filter,
            }
      }
      className={[
        "will-change-[transform,opacity,filter]",
        className,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}