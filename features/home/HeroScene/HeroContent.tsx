"use client";

import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

type HeroContentProps = {
  progress: MotionValue<number>;
  rawProgress: MotionValue<number>;
};

const HERO_VIDEO_SRC = "https://media.ezmade.pro/videos/hero-web.mp4";
const EZ_LOGO_SRC = "/images/ez-wordmark-glass-mask.svg";

export default function HeroContent({
  progress,
  rawProgress,
}: HeroContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const glassVideoRef = useRef<HTMLVideoElement>(null);
  const mobileViewportTargetY = useMotionValue(0);
  const mobileViewportY = useSpring(mobileViewportTargetY, {
    stiffness: 180,
    damping: 26,
    mass: 0.4,
  });

  /*
   * iOS Safari grows the visible viewport in small steps while its bottom
   * toolbar collapses. Read that change during scrolling, then spring only
   * the mark by half of the height delta so it remains visually centred
   * without inheriting the browser's stepped 100dvh updates.
   */
  useEffect(() => {
    const mobilePortrait = window.matchMedia(
      "(max-width: 767px) and (orientation: portrait)",
    );
    const viewport = window.visualViewport;

    let baselineHeight = viewport?.height ?? window.innerHeight;
    let previousWidth = viewport?.width ?? window.innerWidth;
    let frameId: number | null = null;

    const resetBaseline = () => {
      baselineHeight = viewport?.height ?? window.innerHeight;
      previousWidth = viewport?.width ?? window.innerWidth;
      mobileViewportTargetY.jump(0);
    };

    const updatePosition = () => {
      frameId = null;

      if (!mobilePortrait.matches) {
        mobileViewportTargetY.set(0);
        return;
      }

      const currentHeight = viewport?.height ?? window.innerHeight;
      const currentWidth = viewport?.width ?? window.innerWidth;

      /* A material width change is an orientation/resize, not toolbar motion. */
      if (Math.abs(currentWidth - previousWidth) > 24) {
        resetBaseline();
        return;
      }

      previousWidth = currentWidth;

      const centredOffset = (currentHeight - baselineHeight) / 2;
      const safeOffset = Math.max(-64, Math.min(64, centredOffset));

      mobileViewportTargetY.set(safeOffset);
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updatePosition);
    };

    const handleViewportModeChange = () => {
      resetBaseline();
      scheduleUpdate();
    };

    viewport?.addEventListener("resize", scheduleUpdate, { passive: true });
    viewport?.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    mobilePortrait.addEventListener("change", handleViewportModeChange);

    resetBaseline();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      viewport?.removeEventListener("resize", scheduleUpdate);
      viewport?.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      mobilePortrait.removeEventListener("change", handleViewportModeChange);
    };
  }, [mobileViewportTargetY]);

  useEffect(() => {
    const backgroundVideo = backgroundVideoRef.current;
    const glassVideo = glassVideoRef.current;

    if (!backgroundVideo || !glassVideo) {
      return;
    }

    let shouldPlayGlassVideo = true;

    const ensureBackgroundPlayback = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      backgroundVideo.muted = true;

      void backgroundVideo.play().catch(() => undefined);
    };

    const syncGlassVideo = () => {
      if (
        !shouldPlayGlassVideo ||
        backgroundVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        glassVideo.readyState < HTMLMediaElement.HAVE_METADATA
      ) {
        return;
      }

      const duration = glassVideo.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const targetTime = (backgroundVideo.currentTime + 0.42) % duration;

      if (Math.abs(glassVideo.currentTime - targetTime) > 0.14) {
        glassVideo.currentTime = targetTime;
      }

      glassVideo.playbackRate = 1.02;

      if (!backgroundVideo.paused && glassVideo.paused) {
        void glassVideo.play().catch(() => undefined);
      }
    };

    const handlePause = () => glassVideo.pause();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ensureBackgroundPlayback();
        syncGlassVideo();
      }
    };

    const updateGlassPlayback = (value: number) => {
      shouldPlayGlassVideo = value <= 0.74;

      if (!shouldPlayGlassVideo) {
        glassVideo.pause();
        return;
      }

      syncGlassVideo();
    };

    const intervalId = window.setInterval(syncGlassVideo, 800);
    const unsubscribeProgress = progress.on("change", updateGlassPlayback);

    backgroundVideo.addEventListener("play", syncGlassVideo);
    backgroundVideo.addEventListener("playing", syncGlassVideo);
    backgroundVideo.addEventListener("pause", handlePause);
    backgroundVideo.addEventListener("seeked", syncGlassVideo);
    backgroundVideo.addEventListener("loadeddata", ensureBackgroundPlayback);
    backgroundVideo.addEventListener("canplay", ensureBackgroundPlayback);
    glassVideo.addEventListener("loadedmetadata", syncGlassVideo);
    glassVideo.addEventListener("canplay", syncGlassVideo);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    updateGlassPlayback(progress.get());
    ensureBackgroundPlayback();

    return () => {
      window.clearInterval(intervalId);
      unsubscribeProgress();
      backgroundVideo.removeEventListener("play", syncGlassVideo);
      backgroundVideo.removeEventListener("playing", syncGlassVideo);
      backgroundVideo.removeEventListener("pause", handlePause);
      backgroundVideo.removeEventListener("seeked", syncGlassVideo);
      backgroundVideo.removeEventListener("loadeddata", ensureBackgroundPlayback);
      backgroundVideo.removeEventListener("canplay", ensureBackgroundPlayback);
      glassVideo.removeEventListener("loadedmetadata", syncGlassVideo);
      glassVideo.removeEventListener("canplay", syncGlassVideo);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [progress]);

  const introMarkOpacity = useTransform(
    progress,
    [0, 0.14, 0.22, 0.33],
    [1, 1, 0.78, 0],
  );

  const introMarkBlur = useTransform(
    progress,
    [0, 0.16, 0.25, 0.33],
    [0, 0, 1.5, 8],
  );

  const introMarkSceneY = useTransform(
    progress,
    [0, 0.16, 0.33],
    [0, 0, -4],
  );

  const introMarkY = useTransform(
    () => introMarkSceneY.get() + mobileViewportY.get(),
  );

  const introMarkFilter = useMotionTemplate`blur(${introMarkBlur}px)`;

  const wordmarkOpacity = useTransform(
    progress,
    [0, 0.32, 0.4, 0.53, 0.61, 0.69],
    [0, 0, 0.12, 1, 1, 0],
  );

  const wordmarkScale = useTransform(
    progress,
    [0.32, 0.53, 0.69],
    [0.992, 1, 1.006],
  );

  const wordmarkY = useTransform(
    progress,
    [0.32, 0.53, 0.69],
    [5, 0, -3],
  );

  const wordmarkBlur = useTransform(
    progress,
    [0, 0.32, 0.4, 0.53, 0.61, 0.69],
    [18, 18, 8, 0, 0, 12],
  );

  const wordmarkBrightness = useTransform(
    progress,
    [0.2, 0.3, 0.38, 0.52, 0.62],
    [0.98, 1.04, 1.1, 1.04, 0.98],
  );

  const wordmarkFilter =
    useMotionTemplate`blur(${wordmarkBlur}px) brightness(${wordmarkBrightness})`;

  const innerCloudX = useTransform(
    progress,
    [0.2, 0.36, 0.62],
    ["-49.2%", "-50.5%", "-51.2%"],
  );

  const innerCloudY = useTransform(
    progress,
    [0.2, 0.36, 0.62],
    ["-50.8%", "-49.6%", "-48.8%"],
  );

  const shimmerX = useTransform(
    progress,
    [0.25, 0.74],
    ["-240%", "280%"],
  );

  const shimmerOpacity = useTransform(
    progress,
    [0.24, 0.34, 0.60, 0.74],
    [0, 0.16, 0.28, 0],
  );

  const videoScale = useTransform(
    progress,
    [0, 0.12, 0.34, 0.54, 0.68],
    [1.18, 1.16, 1.09, 1.025, 1],
  );

  const videoY = useTransform(
    progress,
    [0, 0.34, 0.54, 0.68],
    [18, 9, 0, -2],
  );

  const openingVeilOpacity = useTransform(
    progress,
    [0, 0.1, 0.2, 0.34],
    [1, 1, 0.68, 0],
  );

  const transitionGlowOpacity = useTransform(
    progress,
    [0.46, 0.52, 0.61, 0.7],
    [0, 0.07, 0.52, 1],
  );

  const transitionGlowScale = useTransform(
    progress,
    [0.46, 0.58, 0.7],
    [0.72, 0.92, 1.18],
  );

  const transitionGlowY = useTransform(
    progress,
    [0.46, 0.58, 0.7],
    [150, 76, -10],
  );

  const atmosphereOpacity = useTransform(
    progress,
    [0.5, 0.57, 0.64, 0.7],
    [0, 0.06, 0.48, 1],
  );

  const finalVeilOpacity = useTransform(
    rawProgress,
    [0.56, 0.62, 0.67, 0.71],
    [0, 0.04, 0.62, 1],
  );

  const heroOpacity = useTransform(progress, [0.69, 0.74], [1, 0]);

  const logoMaskStyle = {
    WebkitMaskImage: `url("${EZ_LOGO_SRC}")`,
    maskImage: `url("${EZ_LOGO_SRC}")`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  } as const;

  return (
    <motion.div
      aria-label="EZ introduction"
      style={{ opacity: shouldReduceMotion ? 0 : heroOpacity }}
      className={[
        "pointer-events-none",
        "absolute inset-0 z-10",
        "overflow-hidden",
        "bg-[var(--color-bg)]",
        "will-change-opacity",
      ].join(" ")}
    >
      <motion.div
        aria-hidden="true"
        style={
          shouldReduceMotion
            ? undefined
            : {
                scale: videoScale,
                y: videoY,
              }
        }
        className={[
          "absolute -inset-[6%]",
          "transform-gpu",
          "will-change-transform",
        ].join(" ")}
      >
        <video
          ref={backgroundVideoRef}
          className={[
            "h-full w-full object-cover",
            "brightness-[0.92] contrast-[1.02] saturate-[0.9]",
          ].join(" ")}
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion ? 1 : openingVeilOpacity,
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-[4px] z-10",
          "bg-[var(--color-bg)]",
          "will-change-opacity",
        ].join(" ")}
      />

      <div
        className={[
          "ez-hero-intro-mark-viewport",
          "pointer-events-none",
          "absolute inset-0 z-20",
          "flex items-center justify-center",
          "px-6",
        ].join(" ")}
      >
        <motion.div
          initial={false}
          style={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: introMarkOpacity,
                  filter: introMarkFilter,
                  y: introMarkY,
                }
          }
          className={[
            "relative shrink-0",
            "h-[clamp(4.8rem,6.4vw,6.8rem)]",
            "w-[clamp(4.8rem,6.4vw,6.8rem)]",
            "transform-gpu",
            "will-change-[transform,opacity,filter]",
          ].join(" ")}
        >
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    filter: "blur(18px)",
                    scale: 0.998,
                  }
            }
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }}
            transition={{
              opacity: {
                duration: 1.9,
                ease: [0.22, 1, 0.36, 1],
              },
              filter: {
                duration: 2.35,
                ease: [0.16, 1, 0.3, 1],
              },
              scale: {
                duration: 2.35,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            className={[
              "h-full w-full",
              "transform-gpu",
              "will-change-[opacity,filter,transform]",
            ].join(" ")}
          >
            <img
              src="/images/logo-mark.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="block h-full w-full"
            />
          </motion.div>
        </motion.div>
      </div>

      <div
        aria-label="EZ"
        className={[
          "pointer-events-none",
          "absolute inset-0 z-20",
          "flex items-center justify-center",
          "overflow-hidden",
          "px-[clamp(1rem,4vw,4rem)]",
        ].join(" ")}
      >
        <motion.div
          style={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: wordmarkOpacity,
                  scale: wordmarkScale,
                  y: wordmarkY,
                  filter: wordmarkFilter,
                }
          }
          className={[
            "relative",
            "aspect-[2.37037/1]",
            "w-[min(88vw,1680px)]",
            "transform-gpu",
            "will-change-[transform,opacity,filter]",
          ].join(" ")}
        >
          {/* Реальная заблюренная копия фона внутри формы букв */}
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden"
            style={logoMaskStyle}
          >
            <motion.video
              ref={glassVideoRef}
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                x: innerCloudX,
                y: innerCloudY,
              }}
              className={[
                "absolute",
                "left-1/2 top-1/2",
                "h-[132%] w-[132%]",
                "max-w-none",
                "object-cover",
                "scale-[1.04]",
                "blur-[3px]",
                "brightness-[1.04]",
                "contrast-[1.01]",
                "saturate-[0.90]",
                "opacity-[0.52]",
                "transform-gpu",
              ].join(" ")}
            />

            {/* Лёгкая молочная дымка, но не белая заливка */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.014) 50%, rgba(210,224,223,0.022) 100%)",
              }}
            />

            {/*
             * iOS Safari composites two synchronised video layers with less
             * separation than Chromium/Firefox. This stable wash restores the
             * milky glass body without delaying or restarting the inner video.
             */}
            <div
              aria-hidden="true"
              className="ez-hero-glass-safari-wash absolute inset-0"
            />

            {/* Внутренние свет и тень создают толщину */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.025) 28%, transparent 58%, rgba(4,15,17,0.095) 100%)",
                mixBlendMode: "soft-light",
              }}
            />
          </div>

          {/* Едва заметная кромка, без явной обводки */}
          <div
            aria-hidden="true"
            className={[
              "absolute inset-0",
              "opacity-[0.32]",
              "[filter:drop-shadow(0_0_1.5px_rgba(255,255,255,0.18))_drop-shadow(0_1px_1px_rgba(0,0,0,0.10))]",
            ].join(" ")}
            style={{
              ...logoMaskStyle,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.018) 34%, transparent 60%, rgba(255,255,255,0.035) 100%)",
              mixBlendMode: "screen",
            }}
          />

          {/* Короткий мягкий блик */}
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden"
            style={logoMaskStyle}
          >
            <motion.div
              style={{
                x: shimmerX,
                opacity: shimmerOpacity,
              }}
              className={[
                "absolute -inset-y-[14%]",
                "left-1/2",
                "w-[22%]",
                "-translate-x-1/2",
                "rotate-[13deg]",
                "blur-[7px]",
                "will-change-transform",
              ].join(" ")}
            >
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.09) 20%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.09) 80%, rgba(255,255,255,0) 100%)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion ? 1 : transitionGlowOpacity,
          scale: shouldReduceMotion ? 1 : transitionGlowScale,
          y: shouldReduceMotion ? 0 : transitionGlowY,
          background:
            "radial-gradient(ellipse 105% 82% at 50% 105%, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 98%, transparent) 22%, color-mix(in srgb, var(--color-bg) 78%, transparent) 46%, color-mix(in srgb, var(--color-bg) 34%, transparent) 72%, transparent 100%)",
        }}
        className={[
          "pointer-events-none",
          "absolute",
          "-inset-x-[35%]",
          "-bottom-[45%]",
          "z-30",
          "h-[160svh]",
          "origin-bottom",
          "blur-[7px]",
          "will-change-[transform,opacity]",
        ].join(" ")}
      />

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion ? 1 : transitionGlowOpacity,
          scale: shouldReduceMotion ? 1 : transitionGlowScale,
          background:
            "radial-gradient(ellipse 130% 105% at 50% 112%, color-mix(in srgb, var(--color-bg) 72%, transparent) 0%, color-mix(in srgb, var(--color-bg) 30%, transparent) 52%, transparent 100%)",
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-x-[48%] -bottom-[55%] z-30",
          "h-[190svh]",
          "origin-bottom",
          "blur-[18px]",
          "will-change-[transform,opacity]",
        ].join(" ")}
      />

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion ? 1 : atmosphereOpacity,
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-[6px] z-35",
          "bg-[var(--color-bg)]",
          "will-change-opacity",
        ].join(" ")}
      />

      <motion.div
        aria-hidden="true"
        style={{
          opacity: shouldReduceMotion ? 1 : finalVeilOpacity,
        }}
        className={[
          "pointer-events-none",
          "absolute -inset-[8px] z-40",
          "bg-[var(--color-bg)]",
          "will-change-opacity",
        ].join(" ")}
      />
    </motion.div>
  );
}