"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
} from "framer-motion";

import { defaultScenePreset } from "./timeline";
import type { SceneLayerProps } from "./types";

export default function SceneLayer({
  progress,
  range,
  children,

  className = "",
  contentClassName = "",

  preset,
  managePointerEvents = true,
}: SceneLayerProps) {
  const shouldReduceMotion =
    useReducedMotion() ?? false;

  const motionPreset = {
    ...defaultScenePreset,
    ...preset,
  };

  const isFinalScene =
    range.exitEnd >= 1 &&
    range.holdEnd >= 1;

  const opacity = useTransform(
    progress,
    isFinalScene
      ? [
          range.enterStart,
          range.enterEnd,
          1,
        ]
      : [
          range.enterStart,
          range.enterEnd,
          range.holdEnd,
          range.exitEnd,
        ],
    isFinalScene
      ? [0, 1, 1]
      : [0, 1, 1, 0],
  );

  const y = useTransform(
    progress,
    isFinalScene
      ? [
          range.enterStart,
          range.enterEnd,
          1,
        ]
      : [
          range.enterStart,
          range.enterEnd,
          range.holdEnd,
          range.exitEnd,
        ],
    isFinalScene
      ? [
          motionPreset.enterY,
          0,
          0,
        ]
      : [
          motionPreset.enterY,
          0,
          0,
          motionPreset.exitY,
        ],
  );

  const scale = useTransform(
    progress,
    isFinalScene
      ? [
          range.enterStart,
          range.enterEnd,
          1,
        ]
      : [
          range.enterStart,
          range.enterEnd,
          range.holdEnd,
          range.exitEnd,
        ],
    isFinalScene
      ? [
          motionPreset.enterScale,
          1,
          1,
        ]
      : [
          motionPreset.enterScale,
          1,
          1,
          motionPreset.exitScale,
        ],
  );

  const blur = useTransform(
    progress,
    isFinalScene
      ? [
          range.enterStart,
          range.enterEnd,
          1,
        ]
      : [
          range.enterStart,
          range.enterEnd,
          range.holdEnd,
          range.exitEnd,
        ],
    isFinalScene
      ? [
          motionPreset.enterBlur,
          0,
          0,
        ]
      : [
          motionPreset.enterBlur,
          0,
          0,
          motionPreset.exitBlur,
        ],
  );

  const filter =
    useMotionTemplate`blur(${blur}px)`;

  const pointerEvents = useTransform(
    progress,
    (value) => {
      if (!managePointerEvents) {
        return "auto";
      }

      const interactiveStart =
        range.enterStart +
        (range.enterEnd - range.enterStart) *
          0.55;

      const interactiveEnd =
        isFinalScene
          ? 1
          : range.holdEnd +
            (range.exitEnd - range.holdEnd) *
              0.45;

      return value >= interactiveStart &&
        value <= interactiveEnd
        ? "auto"
        : "none";
    },
  );

  return (
    <motion.section
      aria-hidden={undefined}
      style={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              pointerEvents: "auto",
            }
          : {
              opacity,
              y,
              scale,
              filter,
              pointerEvents,
            }
      }
      className={[
        "absolute inset-0",
        "origin-center",
        "will-change-[transform,opacity,filter]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "relative h-full w-full",
          contentClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </motion.section>
  );
}