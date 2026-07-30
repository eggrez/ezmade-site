"use client";

import {
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import type { RefObject } from "react";

export function useTimeline(
  targetRef: RefObject<HTMLElement | null>,
) {
  const shouldReduceMotion =
    useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(
    scrollYProgress,
    shouldReduceMotion
      ? {
          stiffness: 1000,
          damping: 100,
          mass: 0.1,
        }
      : {
          stiffness: 90,
          damping: 22,
          mass: 0.45,
        },
  );

  return {
    progress,
    rawProgress: scrollYProgress,
    shouldReduceMotion,
  };
}