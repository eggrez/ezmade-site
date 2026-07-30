"use client";

import {
  MotionValue,
  useTransform,
} from "framer-motion";

import type { SceneRange } from "./types";

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function useSceneProgress(
  progress: MotionValue<number>,
  range: SceneRange,
) {
  return useTransform(progress, (value) => {
    const length =
      range.exitEnd - range.enterStart;

    if (length <= 0) {
      return 0;
    }

    return clamp(
      (value - range.enterStart) / length,
    );
  });
}