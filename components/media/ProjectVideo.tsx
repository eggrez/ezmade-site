"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProjectImage from "@/components/media/ProjectImage";

type ProjectVideoProps = {
  src: string;
  poster?: string;
  title: string;

  /**
   * Скрывает большую центральную кнопку Play.
   * Нижние элементы управления при этом остаются.
   */
  hideCenterPlay?: boolean;

  /*
   * Можно передать отдельный путь вручную.
   * Если проп не передан, компонент сам попробует
   * заменить video.mp4 на video-4k.mp4.
   */
  highQualitySrc?: string;
  isActive?: boolean;
  autoPlayRequest?: number;
  onPlay?: () => void;
  onEnded?: () => void;
};

type IconProps = {
  className?: string;
};

type IconControlProps = {
  label: string;
  className: string;
  children: ReactNode;
  onClick: () => void;
};

type PendingSourceSwitch = {
  time: number;
  shouldResume: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(
    seconds % 60,
  );

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function deriveHighQualitySource(
  src: string,
) {
  if (!src) {
    return "";
  }

  if (/video\.mp4$/i.test(src)) {
    return src.replace(
      /video\.mp4$/i,
      "video-4k.mp4",
    );
  }

  return "";
}

export default function ProjectVideo({
  src,
  poster = "",
  title,
  hideCenterPlay = false,
  highQualitySrc,
  isActive = true,
  autoPlayRequest = 0,
  onPlay,
  onEnded,
}: ProjectVideoProps) {
  const shouldReduceMotion =
    useReducedMotion();

  const resolvedHighQualitySrc =
    useMemo(
      () =>
        highQualitySrc ||
        deriveHighQualitySource(src),
      [highQualitySrc, src],
    );

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const controlsTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const isPlayingRef = useRef(false);
  const previousVolumeRef = useRef(1);

  const pendingSourceSwitchRef =
    useRef<PendingSourceSwitch | null>(
      null,
    );

  const attemptedHighQualityRef =
    useRef(false);

  const [activeSource, setActiveSource] =
    useState(src);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [volume, setVolume] =
    useState(1);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [
    isControlsVisible,
    setIsControlsVisible,
  ] = useState(true);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [isReady, setIsReady] =
    useState(false);

  const [showPoster, setShowPoster] =
    useState(true);

  const [
    isSwitchingQuality,
    setIsSwitchingQuality,
  ] = useState(false);

  const progress =
    duration > 0
      ? Math.min(
          Math.max(
            currentTime / duration,
            0,
          ),
          1,
        )
      : 0;

  const visibleVolume = isMuted
    ? 0
    : volume;

  const isUsingHighQuality = Boolean(
    resolvedHighQualitySrc &&
      activeSource ===
        resolvedHighQualitySrc,
  );

  const clearControlsTimer =
    useCallback(() => {
      if (!controlsTimerRef.current) {
        return;
      }

      clearTimeout(
        controlsTimerRef.current,
      );

      controlsTimerRef.current = null;
    }, []);

  const scheduleControlsHide =
    useCallback(() => {
      clearControlsTimer();

      if (!isPlayingRef.current) {
        return;
      }

      controlsTimerRef.current =
        setTimeout(() => {
          setIsControlsVisible(false);
        }, 2200);
    }, [clearControlsTimer]);

  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const switchVideoSource = useCallback(
    (nextSource: string) => {
      const element = videoRef.current;

      if (
        !element ||
        !nextSource ||
        nextSource === activeSource
      ) {
        return;
      }

      pendingSourceSwitchRef.current = {
        time: element.currentTime,
        shouldResume: !element.paused,
      };

      setIsSwitchingQuality(true);
      setIsReady(false);

      element.pause();
      setActiveSource(nextSource);
    },
    [activeSource],
  );

  const togglePlayback =
    useCallback(() => {
      const element = videoRef.current;

      if (!element) {
        return;
      }

      if (element.paused) {
        element.muted = isMuted;
        element.volume = volume;

        void element
          .play()
          .catch(() => {
            isPlayingRef.current =
              false;

            setIsPlaying(false);
          });
      } else {
        element.pause();
      }
    }, [isMuted, volume]);

  const toggleMute = useCallback(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (
      element.muted ||
      element.volume === 0
    ) {
      const restoredVolume =
        previousVolumeRef.current > 0
          ? previousVolumeRef.current
          : 1;

      element.muted = false;
      element.volume = restoredVolume;

      setIsMuted(false);
      setVolume(restoredVolume);
    } else {
      previousVolumeRef.current =
        element.volume;

      element.muted = true;
      setIsMuted(true);
    }

    showControls();
  }, [showControls]);

  const handleVolumeChange =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>,
      ) => {
        const element =
          videoRef.current;

        if (!element) {
          return;
        }

        const nextVolume = Math.min(
          Math.max(
            Number(
              event.currentTarget.value,
            ),
            0,
          ),
          1,
        );

        element.volume = nextVolume;
        element.muted =
          nextVolume === 0;

        if (nextVolume > 0) {
          previousVolumeRef.current =
            nextVolume;
        }

        setVolume(nextVolume);
        setIsMuted(nextVolume === 0);
        showControls();
      },
      [showControls],
    );

  const toggleFullscreen =
    useCallback(async () => {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();
          return;
        }

        if (
          container.requestFullscreen
        ) {
          await container.requestFullscreen();
          return;
        }

        const webkitContainer =
          container as HTMLDivElement & {
            webkitRequestFullscreen?: () => void;
          };

        webkitContainer.webkitRequestFullscreen?.();
      } catch {
        // Fullscreen может быть заблокирован
        // браузером или системой.
      }
    }, []);

  function handleProgressClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    event.stopPropagation();

    const element = videoRef.current;

    if (!element || duration <= 0) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const ratio =
      (event.clientX - rect.left) /
      rect.width;

    const nextTime =
      Math.min(
        Math.max(ratio, 0),
        1,
      ) * duration;

    element.currentTime = nextTime;
    setCurrentTime(nextTime);
    showControls();
  }

  /*
   * Когда React меняет activeSource,
   * принудительно перезагружаем video.
   */
  useEffect(() => {
    const element = videoRef.current;

    if (!element || !activeSource) {
      return;
    }

    element.load();
  }, [activeSource]);

  useEffect(() => {
    const currentVideo =
      videoRef.current;

    if (currentVideo === null) {
      return;
    }

    const element: HTMLVideoElement =
      currentVideo;

    element.muted = false;
    element.volume = 1;

    previousVolumeRef.current = 1;

    setIsMuted(false);
    setVolume(1);

    function restoreAfterSourceSwitch() {
      const pending =
        pendingSourceSwitchRef.current;

      if (!pending) {
        setIsSwitchingQuality(false);
        return;
      }

      const safeDuration =
        Number.isFinite(
          element.duration,
        )
          ? element.duration
          : pending.time;

      const restoredTime = Math.min(
        pending.time,
        Math.max(
          safeDuration - 0.05,
          0,
        ),
      );

      try {
        element.currentTime =
          Math.max(restoredTime, 0);

        requestAnimationFrame(() => {
          element.currentTime =
            Math.max(
              restoredTime,
              0,
            );
        });
      } catch {
        // Некоторые браузеры запрещают seek
        // до готовности файла.
      }

      pendingSourceSwitchRef.current =
        null;

      setIsSwitchingQuality(false);

      if (pending.shouldResume) {
        void element
          .play()
          .catch(() => {
            isPlayingRef.current =
              false;

            setIsPlaying(false);
          });
      }
    }

    function handlePlay() {
      isPlayingRef.current = true;

      setIsPlaying(true);
      setShowPoster(false);

      scheduleControlsHide();
      onPlay?.();
    }

    function handlePause() {
      isPlayingRef.current = false;

      setIsPlaying(false);
      setIsControlsVisible(true);

      clearControlsTimer();
    }

    function handleTimeUpdate() {
      setCurrentTime(
        element.currentTime,
      );
    }

    function handleDurationChange() {
      const nextDuration =
        element.duration;

      setDuration(
        Number.isFinite(nextDuration)
          ? nextDuration
          : 0,
      );
    }

    function handleNativeVolumeChange() {
      const nextVolume =
        element.volume;

      const nextMuted =
        element.muted ||
        nextVolume === 0;

      setVolume(nextVolume);
      setIsMuted(nextMuted);

      if (
        nextVolume > 0 &&
        !element.muted
      ) {
        previousVolumeRef.current =
          nextVolume;
      }
    }

    function handleLoadedMetadata() {
      handleDurationChange();
    }

    function handleLoadedData() {
      setIsReady(true);
      handleDurationChange();
      setIsSwitchingQuality(false);
    }

    function handleCanPlay() {
      setIsReady(true);

      if (
        pendingSourceSwitchRef.current
      ) {
        restoreAfterSourceSwitch();
        return;
      }

      setIsSwitchingQuality(false);
    }

    function handleVideoError() {
      /*
       * Если 4K-файл отсутствует или браузер
       * не смог его декодировать, возвращаемся
       * к основной версии.
       */
      if (
        activeSource ===
          resolvedHighQualitySrc &&
        src &&
        activeSource !== src
      ) {
        switchVideoSource(src);
        return;
      }

      setIsSwitchingQuality(false);
    }

    function handleEnded() {
      isPlayingRef.current = false;

      setIsPlaying(false);
      setIsControlsVisible(true);
      setShowPoster(true);
      setCurrentTime(0);

      clearControlsTimer();

      try {
        element.currentTime = 0;
      } catch {
        // В редких случаях браузер не разрешает seek
        // сразу внутри события ended.
      }

      onEnded?.();
    }

    element.addEventListener(
      "play",
      handlePlay,
    );

    element.addEventListener(
      "pause",
      handlePause,
    );

    element.addEventListener(
      "timeupdate",
      handleTimeUpdate,
    );

    element.addEventListener(
      "durationchange",
      handleDurationChange,
    );

    element.addEventListener(
      "volumechange",
      handleNativeVolumeChange,
    );

    element.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

    element.addEventListener(
      "loadeddata",
      handleLoadedData,
    );

    element.addEventListener(
      "canplay",
      handleCanPlay,
    );

    element.addEventListener(
      "error",
      handleVideoError,
    );

    element.addEventListener(
      "ended",
      handleEnded,
    );

    return () => {
      element.removeEventListener(
        "play",
        handlePlay,
      );

      element.removeEventListener(
        "pause",
        handlePause,
      );

      element.removeEventListener(
        "timeupdate",
        handleTimeUpdate,
      );

      element.removeEventListener(
        "durationchange",
        handleDurationChange,
      );

      element.removeEventListener(
        "volumechange",
        handleNativeVolumeChange,
      );

      element.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );

      element.removeEventListener(
        "loadeddata",
        handleLoadedData,
      );

      element.removeEventListener(
        "canplay",
        handleCanPlay,
      );

      element.removeEventListener(
        "error",
        handleVideoError,
      );

      element.removeEventListener(
        "ended",
        handleEnded,
      );
    };
  }, [
    activeSource,
    clearControlsTimer,
    resolvedHighQualitySrc,
    scheduleControlsHide,
    src,
    switchVideoSource,
    onEnded,
    onPlay,
  ]);

  useEffect(() => {
    function handleFullscreenChange() {
      const fullscreenActive =
        document.fullscreenElement ===
        containerRef.current;

      setIsFullscreen(
        fullscreenActive,
      );

      setIsControlsVisible(true);
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    setActiveSource(src);
  }, [src]);

  useEffect(() => {
    return () => {
      clearControlsTimer();
    };
  }, [clearControlsTimer]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element || isActive) {
      return;
    }

    element.pause();
  }, [isActive]);

  useEffect(() => {
    const element = videoRef.current;

    if (
      !element ||
      !isActive ||
      autoPlayRequest <= 0
    ) {
      return;
    }

    setIsControlsVisible(true);

    void element
      .play()
      .catch(() => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      });
  }, [autoPlayRequest, isActive]);

  if (!src) {
    return (
      <ProjectImage
  src={poster}
  alt={title}
  className="h-full w-full object-cover"
  sizes="100vw"
/>
    );
  }

  const iconButtonClass = [
    "group/control relative isolate",
    "inline-flex h-10 w-10",
    "shrink-0 items-center justify-center",

    "overflow-hidden rounded-full",
    "border border-white/[0.24]",
    "bg-black/[0.25]",
    "text-white",

    "shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_8px_28px_rgba(0,0,0,0.17)]",
    "backdrop-blur-xl",

    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-500",
    "ease-[cubic-bezier(0.22,1,0.36,1)]",

    "hover:scale-[1.05]",
    "hover:border-white/[0.48]",
    "hover:bg-white/[0.15]",
    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_12px_34px_rgba(0,0,0,0.22)]",

    "focus-visible:outline-none",
    "focus-visible:ring-1",
    "focus-visible:ring-white/80",
  ].join(" ");

  return (
    <div
      ref={containerRef}
      className={[
        "group/player relative",
        "h-full w-full overflow-hidden",
        "bg-black",

        isFullscreen
          ? "flex items-center justify-center"
          : "",
      ].join(" ")}
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onMouseLeave={() => {
        if (isPlayingRef.current) {
          setIsControlsVisible(false);
        }
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        void toggleFullscreen();
      }}
    >
      <video
        ref={videoRef}
        src={activeSource}
        poster={poster}
        muted={isMuted}
        playsInline
        preload="metadata"
        className={[
          "pointer-events-none",
          "h-full w-full",

          isFullscreen
            ? "object-contain"
            : "object-cover",

          isReady
            ? "opacity-100"
            : "opacity-0",

          "transition-opacity duration-700",
        ].join(" ")}
      />

      {/* Reliable interaction surface above inline video */}
      <button
        type="button"
        aria-label={
          isPlaying
            ? `Pause ${title}`
            : `Play ${title}`
        }
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          togglePlayback();
        }}
        className={[
          "absolute inset-0 z-20",
          "cursor-pointer touch-manipulation",
          "border-0 bg-transparent p-0",
          "focus-visible:outline-none",
        ].join(" ")}
        style={{
          WebkitTapHighlightColor:
            "transparent",
          touchAction: "manipulation",
        }}
      />

      {(showPoster || !isReady) &&
        poster && (
          <div className="pointer-events-none absolute inset-0">
            <ProjectImage
  src={poster}
  alt={title}
  className="h-full w-full object-cover"
  sizes="100vw"
/>
          </div>
        )}

      {/* Quality switch indicator */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: isSwitchingQuality
            ? 1
            : 0,

          scale: isSwitchingQuality
            ? 1
            : 0.94,

          pointerEvents: "none",
        }}
        transition={{
          duration: shouldReduceMotion
            ? 0
            : 0.45,
          ease,
        }}
        className={[
          "absolute right-5 top-5 z-40",
          "rounded-full",
          "border border-white/20",
          "bg-black/25",
          "px-3 py-2",
          "text-[10px] uppercase",
          "tracking-[0.16em]",
          "text-white/70",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        Loading{" "}
        {isFullscreen ? "4K" : "HD"}
      </motion.div>

      {/* Paused-state tonal layer */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: isPlaying
            ? 0
            : 0.1,
        }}
        transition={{
          duration: shouldReduceMotion
            ? 0
            : 0.6,
          ease,
        }}
        className="pointer-events-none absolute inset-0 bg-black"
      />

      {/* Slow highlight over video */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-left-[58%] top-[-90%] z-10",
          "h-[290%] w-[38%]",
          "rotate-[18deg]",

          "bg-gradient-to-r",
          "from-transparent",
          "via-white/24",
          "to-transparent",

          "blur-2xl",
          "mix-blend-screen",

          "translate-x-0 opacity-0",

          "transition-[transform,opacity]",
          "duration-[3200ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",

          "group-hover/player:translate-x-[445%]",
          "group-hover/player:opacity-100",
        ].join(" ")}
      />

      {/* Central Play */}
      {!hideCenterPlay && (
        <div
          className={[
            "pointer-events-none absolute left-1/2 top-1/2 z-40",
            "-translate-x-1/2 -translate-y-1/2",
          ].join(" ")}
        >
          <motion.button
            type="button"
            aria-label={
              isPlaying
                ? `Pause ${title}`
                : `Play ${title}`
            }
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              togglePlayback();
            }}
            initial={false}
            animate={{
              opacity: isPlaying
                ? 0
                : 1,

              scale: isPlaying
                ? 0.9
                : 1,

              filter: isPlaying
                ? "blur(4px)"
                : "blur(0px)",

              pointerEvents: isPlaying
                ? "none"
                : "auto",
            }}
            transition={{
              duration:
                shouldReduceMotion
                  ? 0
                  : 0.65,

              ease,
            }}
            className={[
              "group/play pointer-events-auto touch-manipulation",
              "relative isolate",

              "flex h-16 w-16",
              "sm:h-20 sm:w-20",
              "lg:h-24 lg:w-24",
              "items-center justify-center",

              "overflow-hidden rounded-full",
              "border border-white/[0.34]",
              "bg-black/[0.24]",
              "text-white",

              "shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_18px_55px_rgba(0,0,0,0.22)]",
              "backdrop-blur-xl",

              "transition-[background-color,border-color,box-shadow]",
              "duration-500",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",

              "hover:border-white/[0.62]",
              "hover:bg-white/[0.16]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_22px_65px_rgba(0,0,0,0.27)]",

              "focus-visible:outline-none",
              "focus-visible:ring-1",
              "focus-visible:ring-white/85",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute",
                "-left-[74%] top-[-120%]",
                "h-[340%] w-[80%]",
                "rotate-[22deg]",

                "bg-gradient-to-r",
                "from-transparent",
                "via-white/68",
                "to-transparent",

                "blur-md",
                "translate-x-0",

                "transition-transform",
                "duration-[1750ms]",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",

                "group-hover/play:translate-x-[250%]",
              ].join(" ")}
            />

            <PlayIcon
              className={[
                "relative z-10",
                "h-5 w-5",
                "translate-x-[1.5px]",
                "sm:h-6 sm:w-6",
                "lg:h-7 lg:w-7",
                "lg:translate-x-[2px]",
              ].join(" ")}
            />
          </motion.button>
        </div>
      )}

      {/* Bottom controls */}
      <motion.div
        initial={false}
        animate={{
          opacity:
            isControlsVisible ||
            !isPlaying
              ? 1
              : 0,

          y:
            isControlsVisible ||
            !isPlaying
              ? 0
              : 10,

          pointerEvents:
            isControlsVisible ||
            !isPlaying
              ? "auto"
              : "none",
        }}
        transition={{
          duration: shouldReduceMotion
            ? 0
            : 0.45,
          ease,
        }}
        className={[
          "absolute inset-x-0 bottom-0 z-30",
          "bg-gradient-to-t",
          "from-black/65 via-black/20 to-transparent",

          "px-4 pb-4 pt-20",
          "sm:px-5 sm:pb-5",
          "md:px-6 md:pb-6",
        ].join(" ")}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Progress */}
        <div
          role="slider"
          aria-label={`${title} progress`}
          aria-valuemin={0}
          aria-valuemax={Math.round(
            duration,
          )}
          aria-valuenow={Math.round(
            currentTime,
          )}
          tabIndex={0}
          onClick={handleProgressClick}
          onKeyDown={(event) => {
            const element =
              videoRef.current;

            if (!element) {
              return;
            }

            if (
              event.key ===
              "ArrowRight"
            ) {
              event.preventDefault();

              const nextTime =
                Math.min(
                  element.currentTime +
                    5,
                  duration,
                );

              element.currentTime =
                nextTime;

              setCurrentTime(nextTime);
            }

            if (
              event.key ===
              "ArrowLeft"
            ) {
              event.preventDefault();

              const nextTime =
                Math.max(
                  element.currentTime -
                    5,
                  0,
                );

              element.currentTime =
                nextTime;

              setCurrentTime(nextTime);
            }
          }}
          className={[
            "group/progress relative",
            "h-4 w-full cursor-pointer",
            "focus-visible:outline-none",
          ].join(" ")}
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/30">
            <div
              className="h-full origin-left bg-white"
              style={{
                transform: `scaleX(${progress})`,
              }}
            />
          </div>

          <div
            className={[
              "absolute top-1/2",
              "h-2.5 w-2.5",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full bg-white",

              "opacity-0",
              "shadow-[0_2px_8px_rgba(0,0,0,0.28)]",

              "transition-opacity duration-300",

              "group-hover/progress:opacity-100",
              "group-focus-visible/progress:opacity-100",
            ].join(" ")}
            style={{
              left: `${
                progress * 100
              }%`,
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <IconControl
              label={
                isPlaying
                  ? "Pause"
                  : "Play"
              }
              onClick={togglePlayback}
              className={
                iconButtonClass
              }
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4 translate-x-px" />
              )}
            </IconControl>

            <div className="flex min-w-0 items-center">
              <IconControl
                label={
                  isMuted
                    ? "Enable sound"
                    : "Mute sound"
                }
                onClick={toggleMute}
                className={
                  iconButtonClass
                }
              >
                {isMuted ||
                visibleVolume === 0 ? (
                  <VolumeOffIcon className="h-[18px] w-[18px]" />
                ) : visibleVolume <
                  0.5 ? (
                  <VolumeLowIcon className="h-[18px] w-[18px]" />
                ) : (
                  <VolumeOnIcon className="h-[18px] w-[18px]" />
                )}
              </IconControl>

              <div className="ml-2 flex h-10 w-[70px] items-center sm:w-[88px]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={visibleVolume}
                  aria-label="Video volume"
                  onChange={
                    handleVolumeChange
                  }
                  className="ez-volume-slider"
                  style={{
                    background: `linear-gradient(
                      to right,
                      rgba(255,255,255,0.96) 0%,
                      rgba(255,255,255,0.96) ${
                        visibleVolume *
                        100
                      }%,
                      rgba(255,255,255,0.28) ${
                        visibleVolume *
                        100
                      }%,
                      rgba(255,255,255,0.28) 100%
                    )`,
                  }}
                />
              </div>
            </div>

            <span className="ml-1 hidden whitespace-nowrap text-[11px] tabular-nums text-white/60 sm:inline">
              {formatTime(
                currentTime,
              )}

              <span className="mx-1 text-white/30">
                /
              </span>

              {formatTime(duration)}
            </span>

            {isUsingHighQuality && (
              <span className="hidden rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/55 md:inline">
                4K
              </span>
            )}
          </div>

          <IconControl
            label={
              isFullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
            }
            onClick={() => {
              void toggleFullscreen();
            }}
            className={
              iconButtonClass
            }
          >
            {isFullscreen ? (
              <FullscreenExitIcon className="h-[18px] w-[18px]" />
            ) : (
              <FullscreenIcon className="h-[18px] w-[18px]" />
            )}
          </IconControl>
        </div>
      </motion.div>
    </div>
  );
}

function IconControl({
  label,
  className,
  children,
  onClick,
}: IconControlProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={className}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-left-[76%] top-[-115%]",
          "h-[350%] w-[84%]",
          "rotate-[22deg]",

          "bg-gradient-to-r",
          "from-transparent",
          "via-white/62",
          "to-transparent",

          "blur-md",
          "translate-x-0",

          "transition-transform",
          "duration-[1500ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",

          "group-hover/control:translate-x-[255%]",
        ].join(" ")}
      />

      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}

function PlayIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M7.5 5.25v13.5L18.5 12 7.5 5.25Z" />
    </svg>
  );
}

function PauseIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M7 5.5h3.5v13H7v-13Zm6.5 0H17v13h-3.5v-13Z" />
    </svg>
  );
}

function VolumeOnIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10v4h3l4 3.5v-11L8 10H5Z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
      <path d="M18 6.5a7.6 7.6 0 0 1 0 11" />
    </svg>
  );
}

function VolumeLowIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10v4h3l4 3.5v-11L8 10H5Z" />
      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
    </svg>
  );
}

function VolumeOffIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10v4h3l4 3.5v-11L8 10H5Z" />
      <path d="m16 9 5 6" />
      <path d="m21 9-5 6" />
    </svg>
  );
}

function FullscreenIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 4.5h-4v4" />
      <path d="m4.5 8.5 4-4" />
      <path d="M15.5 4.5h4v4" />
      <path d="m19.5 8.5-4-4" />
      <path d="M8.5 19.5h-4v-4" />
      <path d="m4.5 15.5 4 4" />
      <path d="M15.5 19.5h4v-4" />
      <path d="m19.5 15.5-4 4" />
    </svg>
  );
}

function FullscreenExitIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 8.5h-4v-4" />
      <path d="m4.5 4.5 4 4" />
      <path d="M15.5 8.5h4v-4" />
      <path d="m19.5 4.5-4 4" />
      <path d="M8.5 15.5h-4v4" />
      <path d="m4.5 19.5 4-4" />
      <path d="M15.5 15.5h4v4" />
      <path d="m19.5 19.5-4-4" />
    </svg>
  );
}