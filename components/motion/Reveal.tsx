"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import type { ReactNode } from "react";

export type RevealPreset =
  | "soft"
  | "fade"
  | "rise"
  | "left"
  | "right"
  | "scale";

type RevealProps = {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
  delay?: number;
  duration?: number;
  amount?: number;
  once?: boolean;
} & Omit<
  HTMLMotionProps<"div">,
  | "children"
  | "className"
  | "initial"
  | "animate"
  | "whileInView"
  | "transition"
  | "viewport"
>;

const ease = [0.22, 1, 0.36, 1] as const;

const presets = {
  soft: {
    initial: {
      opacity: 0,
      y: 14,
      scale: 0.994,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    },
  },

  fade: {
    initial: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  },

  rise: {
    initial: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  },

  left: {
    initial: {
      opacity: 0,
      x: -18,
      filter: "blur(3px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
  },

  right: {
    initial: {
      opacity: 0,
      x: 18,
      filter: "blur(3px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
  },

  scale: {
    initial: {
      opacity: 0,
      scale: 0.985,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
  },
} satisfies Record<
  RevealPreset,
  {
    initial: Record<string, number | string>;
    visible: Record<string, number | string>;
  }
>;

export default function Reveal({
  children,
  className = "",
  preset = "soft",
  delay = 0,
  duration = 1.2,
  amount = 0.24,
  once = true,
  ...motionProps
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const selectedPreset = presets[preset];

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? selectedPreset.visible
          : selectedPreset.initial
      }
      whileInView={selectedPreset.visible}
      viewport={{
        once,
        amount,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease,
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}