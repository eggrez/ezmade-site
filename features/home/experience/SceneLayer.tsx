"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

import { defaultScenePreset } from "./timeline";
import type { SceneLayerProps } from "./types";

export default function SceneLayer({
  target,
  children,
  className = "",
  contentClassName = "",
  preset,
}: SceneLayerProps) {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const isHero = target === "hero";
  const motionPreset = { ...defaultScenePreset, ...preset };

  // Observe native scrolling without pinning, snapping or intercepting input.
  // Once revealed, content remains visible as the section leaves the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isHero ? ["start start", "end start"] : ["start end", "start 35%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.6,
  });
  const reveal = useTransform(progress, (value) => {
    const t = Math.min(1, Math.max(0, value / 0.45));
    return t * t * (3 - 2 * t);
  });
  const opacity = useTransform(reveal, [0, 1], [0, 1]);
  const y = useTransform(reveal, [0, 1], [motionPreset.enterY, 0]);
  const scale = useTransform(reveal, [0, 1], [motionPreset.enterScale, 1]);
  const blur = useTransform(reveal, [0, 1], [motionPreset.enterBlur, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <section
      ref={ref}
      data-home-scene={target}
      className={["relative", className].join(" ")}
    >
      <motion.div
        style={shouldReduceMotion || isHero ? undefined : { opacity, y, scale, filter }}
        className={[
          "relative w-full origin-center",
          "will-change-[transform,opacity,filter]",
          contentClassName,
        ].join(" ")}
      >
        {children(progress, scrollYProgress)}
      </motion.div>
    </section>
  );
}
