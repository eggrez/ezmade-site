import type { MotionValue } from "framer-motion";
import type { ReactNode } from "react";

export type SceneName =
  | "hero"
  | "what"
  | "featured"
  | "about"
  | "contact";

export type SceneRange = {
  enterStart: number;
  enterEnd: number;
  holdEnd: number;
  exitEnd: number;
};

export type HomeTimeline = Record<
  SceneName,
  SceneRange
>;

export type SceneMotionPreset = {
  enterY: number;
  exitY: number;

  enterScale: number;
  exitScale: number;

  enterBlur: number;
  exitBlur: number;
};

export type SceneLayerProps = {
  progress: MotionValue<number>;
  range: SceneRange;
  children: ReactNode;

  className?: string;
  contentClassName?: string;

  preset?: Partial<SceneMotionPreset>;
  managePointerEvents?: boolean;
};

export type HomeSceneProps = {
  progress: MotionValue<number>;
};