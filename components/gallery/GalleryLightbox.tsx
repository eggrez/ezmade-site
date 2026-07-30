"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  type MouseEvent,
  type ReactNode,
  type WheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type GalleryLightboxProps = {
  images: string[];
  initialIndex: number | null;
  title: string;
  onClose: () => void;
};

type IconProps = {
  className?: string;
};

type GlassIconButtonProps = {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type Position = {
  x: number;
  y: number;
};

type SlideAnimationData = {
  direction: number;
  isInitialReveal: boolean;
};

type ImageSlideProps = {
  src: string;
  alt: string;
  direction: number;
  scale: number;
  position: Position;
  isInitialReveal: boolean;
  shouldReduceMotion: boolean | null;
  onPrevious: () => void;
  onNext: () => void;
  onZoomToggle: () => void;
  onPositionChange: (
    position: Position,
  ) => void;
};

const ease = [
  0.22,
  1,
  0.36,
  1,
] as const;

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;
const SWIPE_THRESHOLD = 70;

const slideVariants = {
  enter: ({
    direction,
    isInitialReveal,
  }: SlideAnimationData) => {
    if (isInitialReveal) {
      return {
        opacity: 0,
        x: 0,
        y: 26,
        scale: 0.94,
        filter: "blur(10px)",
      };
    }

    return {
      opacity: 0,
      x:
        direction >= 0
          ? 28
          : -28,
      y: 0,
      scale: 1.012,
      filter: "blur(3px)",
    };
  },

  center: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },

  exit: ({
    direction,
    isInitialReveal,
  }: SlideAnimationData) => {
    if (isInitialReveal) {
      return {
        opacity: 0,
        x: 0,
        y: 14,
        scale: 0.975,
        filter: "blur(5px)",
      };
    }

    return {
      opacity: 0,
      x:
        direction >= 0
          ? -28
          : 28,
      y: 0,
      scale: 0.988,
      filter: "blur(3px)",
    };
  },
};

export default function GalleryLightbox({
  images,
  initialIndex,
  title,
  onClose,
}: GalleryLightboxProps) {
  const shouldReduceMotion =
    useReducedMotion();

  const interfaceTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const [isMounted, setIsMounted] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(initialIndex ?? 0);

  const [direction, setDirection] =
    useState(0);

  const [
    isInitialReveal,
    setIsInitialReveal,
  ] = useState(true);

  const [scale, setScale] =
    useState(1);

  const [position, setPosition] =
    useState<Position>({
      x: 0,
      y: 0,
    });

  const [
    isInterfaceVisible,
    setIsInterfaceVisible,
  ] = useState(true);

  const isOpen =
    initialIndex !== null &&
    images.length > 0;

  const activeImage =
    images[activeIndex] ?? "";

  const hasMultipleImages =
    images.length > 1;

  const visibleImageNumber =
    activeIndex + 1;

  const clearInterfaceTimer =
    useCallback(() => {
      if (
        interfaceTimerRef.current ===
        null
      ) {
        return;
      }

      clearTimeout(
        interfaceTimerRef.current,
      );

      interfaceTimerRef.current =
        null;
    }, []);

  const scheduleInterfaceHide =
    useCallback(() => {
      clearInterfaceTimer();

      interfaceTimerRef.current =
        setTimeout(() => {
          setIsInterfaceVisible(
            false,
          );
        }, 2600);
    }, [clearInterfaceTimer]);

  const showInterface =
    useCallback(() => {
      setIsInterfaceVisible(true);
      scheduleInterfaceHide();
    }, [scheduleInterfaceHide]);

  const resetTransform =
    useCallback(() => {
      setScale(1);

      setPosition({
        x: 0,
        y: 0,
      });
    }, []);

  const closeLightbox =
    useCallback(() => {
      resetTransform();
      onClose();
    }, [
      onClose,
      resetTransform,
    ]);

  const goToImage = useCallback(
    (
      nextIndex: number,
      nextDirection: number,
    ) => {
      if (
        images.length === 0 ||
        scale > 1
      ) {
        return;
      }

      const normalizedIndex =
        (nextIndex +
          images.length) %
        images.length;

      /*
       * После первого открытия все следующие
       * изображения используют навигационную
       * анимацию enter → center → exit.
       */
      setIsInitialReveal(false);
      setDirection(nextDirection);
      setActiveIndex(
        normalizedIndex,
      );

      resetTransform();
      showInterface();
    },
    [
      images.length,
      resetTransform,
      scale,
      showInterface,
    ],
  );

  const showPrevious =
    useCallback(() => {
      goToImage(
        activeIndex - 1,
        -1,
      );
    }, [
      activeIndex,
      goToImage,
    ]);

  const showNext =
    useCallback(() => {
      goToImage(
        activeIndex + 1,
        1,
      );
    }, [
      activeIndex,
      goToImage,
    ]);

  const changeScale =
    useCallback(
      (nextScale: number) => {
        const normalizedScale =
          Math.min(
            Math.max(
              nextScale,
              MIN_SCALE,
            ),
            MAX_SCALE,
          );

        setScale(
          normalizedScale,
        );

        if (
          normalizedScale ===
          MIN_SCALE
        ) {
          setPosition({
            x: 0,
            y: 0,
          });
        }

        showInterface();
      },
      [showInterface],
    );

  function handleWheel(
    event: WheelEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const delta =
      event.deltaY > 0
        ? -SCALE_STEP
        : SCALE_STEP;

    changeScale(
      scale + delta,
    );
  }

  function handleBackdropClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      closeLightbox();
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /*
   * Каждый новый запуск lightbox снова получает
   * полноценную анимацию первого открытия.
   */
  useEffect(() => {
    if (
      initialIndex === null
    ) {
      return;
    }

    setActiveIndex(
      initialIndex,
    );

    setDirection(0);
    setIsInitialReveal(true);

    resetTransform();
  }, [
    initialIndex,
    resetTransform,
  ]);

  /*
   * Предзагрузка всей галереи убирает задержку
   * при первом перелистывании.
   */
  useEffect(() => {
    if (
      !isOpen ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    images.forEach(
      (imageSource) => {
        const image =
          new window.Image();

        image.decoding =
          "async";

        image.src =
          imageSource;
      },
    );
  }, [
    images,
    isOpen,
  ]);

  /*
   * Отдельно повышаем приоритет соседних кадров.
   */
  useEffect(() => {
    if (
      !isOpen ||
      images.length < 2 ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const previousIndex =
      (activeIndex -
        1 +
        images.length) %
      images.length;

    const nextIndex =
      (activeIndex + 1) %
      images.length;

    const nearbyImages = [
      images[previousIndex],
      images[nextIndex],
    ];

    nearbyImages.forEach(
      (imageSource) => {
        if (!imageSource) {
          return;
        }

        const image =
          new window.Image();

        image.fetchPriority =
          "high";

        image.src =
          imageSource;
      },
    );
  }, [
    activeIndex,
    images,
    isOpen,
  ]);

  /*
   * Блокировка скролла страницы.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const html =
      document.documentElement;

    const body =
      document.body;

    const previousHtmlOverflow =
      html.style.overflow;

    const previousBodyOverflow =
      body.style.overflow;

    html.style.overflow =
      "hidden";

    body.style.overflow =
      "hidden";

    return () => {
      html.style.overflow =
        previousHtmlOverflow;

      body.style.overflow =
        previousBodyOverflow;
    };
  }, [isOpen]);

  /*
   * Управление клавиатурой.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        closeLightbox();
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPrevious();
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNext();
        return;
      }

      if (
        event.key === "+" ||
        event.key === "="
      ) {
        changeScale(
          scale +
            SCALE_STEP,
        );

        return;
      }

      if (
        event.key === "-"
      ) {
        changeScale(
          scale -
            SCALE_STEP,
        );

        return;
      }

      if (
        event.key === "0"
      ) {
        resetTransform();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    changeScale,
    closeLightbox,
    isOpen,
    resetTransform,
    scale,
    showNext,
    showPrevious,
  ]);

  useEffect(() => {
    if (!isOpen) {
      clearInterfaceTimer();
      return;
    }

    scheduleInterfaceHide();

    return () => {
      clearInterfaceTimer();
    };
  }, [
    clearInterfaceTimer,
    isOpen,
    scheduleInterfaceHide,
  ]);

  if (!isMounted) {
    return null;
  }

  const lightbox = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration:
              shouldReduceMotion
                ? 0
                : 0.5,
            ease,
          }}
          onClick={
            handleBackdropClick
          }
          onMouseMove={
            showInterface
          }
          className={[
            "fixed inset-0",
            "z-[2147483646]",
            "overflow-hidden",
            "bg-black/[0.96]",
            "select-none",
          ].join(" ")}
        >
          {/* Image stage */}
          <div
            onWheel={
              handleWheel
            }
            onClick={
              handleBackdropClick
            }
            className={[
              "absolute inset-0",
              "overflow-hidden",
              "px-4 py-20",
              "sm:px-8 sm:py-24",
              "md:px-20 md:py-24",
              "xl:px-28 xl:py-28",
            ].join(" ")}
          >
            <div className="relative h-full w-full">
              {/*
               * Здесь намеренно нет initial={false}.
               * Каждый новый key обязан проиграть enter.
               */}
              <AnimatePresence
                custom={{
                  direction,
                  isInitialReveal,
                }}
                mode="sync"
              >
                <ImageSlide
                  key={`${activeIndex}-${activeImage}`}
                  src={activeImage}
                  alt={`${title} frame ${visibleImageNumber}`}
                  direction={direction}
                  scale={scale}
                  position={position}
                  isInitialReveal={
                    isInitialReveal
                  }
                  shouldReduceMotion={
                    shouldReduceMotion
                  }
                  onPrevious={
                    showPrevious
                  }
                  onNext={showNext}
                  onZoomToggle={() => {
                    changeScale(
                      scale > 1
                        ? 1
                        : 2,
                    );
                  }}
                  onPositionChange={
                    setPosition
                  }
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity:
                isInterfaceVisible
                  ? 1
                  : 0,

              y:
                isInterfaceVisible
                  ? 0
                  : -10,

              pointerEvents:
                isInterfaceVisible
                  ? "auto"
                  : "none",
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration:
                shouldReduceMotion
                  ? 0
                  : 0.45,

              delay:
                shouldReduceMotion
                  ? 0
                  : 0.18,

              ease,
            }}
            className={[
              "absolute inset-x-0 top-0",
              "z-30",
              "flex items-center justify-between",
              "px-4 py-4",
              "sm:px-6 sm:py-6",
              "md:px-8",
            ].join(" ")}
          >
            <div
              className={[
                "rounded-full",
                "border border-white/15",
                "bg-black/25",
                "px-4 py-2",
                "text-xs tabular-nums",
                "text-white/65",
                "backdrop-blur-xl",
              ].join(" ")}
            >
              {visibleImageNumber}

              <span className="mx-1.5 text-white/30">
                /
              </span>

              {images.length}
            </div>

            <GlassIconButton
              label="Close gallery"
              onClick={
                closeLightbox
              }
            >
              <CloseIcon className="h-5 w-5" />
            </GlassIconButton>
          </motion.div>

          {/* Previous */}
          {hasMultipleImages && (
            <motion.div
              initial={{
                opacity: 0,
                x: -8,
              }}
              animate={{
                opacity:
                  isInterfaceVisible &&
                  scale === 1
                    ? 1
                    : 0,

                x:
                  isInterfaceVisible
                    ? 0
                    : -8,

                pointerEvents:
                  isInterfaceVisible &&
                  scale === 1
                    ? "auto"
                    : "none",
              }}
              exit={{
                opacity: 0,
                x: -8,
              }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0
                    : 0.42,

                delay:
                  shouldReduceMotion
                    ? 0
                    : 0.22,

                ease,
              }}
              className={[
                "absolute left-4 top-1/2",
                "z-30 -translate-y-1/2",
                "sm:left-6",
                "md:left-8",
              ].join(" ")}
            >
              <GlassIconButton
                label="Previous image"
                onClick={
                  showPrevious
                }
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </GlassIconButton>
            </motion.div>
          )}

          {/* Next */}
          {hasMultipleImages && (
            <motion.div
              initial={{
                opacity: 0,
                x: 8,
              }}
              animate={{
                opacity:
                  isInterfaceVisible &&
                  scale === 1
                    ? 1
                    : 0,

                x:
                  isInterfaceVisible
                    ? 0
                    : 8,

                pointerEvents:
                  isInterfaceVisible &&
                  scale === 1
                    ? "auto"
                    : "none",
              }}
              exit={{
                opacity: 0,
                x: 8,
              }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0
                    : 0.42,

                delay:
                  shouldReduceMotion
                    ? 0
                    : 0.22,

                ease,
              }}
              className={[
                "absolute right-4 top-1/2",
                "z-30 -translate-y-1/2",
                "sm:right-6",
                "md:right-8",
              ].join(" ")}
            >
              <GlassIconButton
                label="Next image"
                onClick={
                  showNext
                }
              >
                <ChevronRightIcon className="h-5 w-5" />
              </GlassIconButton>
            </motion.div>
          )}

          {/* Zoom controls */}
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity:
                isInterfaceVisible
                  ? 1
                  : 0,

              y:
                isInterfaceVisible
                  ? 0
                  : 10,

              pointerEvents:
                isInterfaceVisible
                  ? "auto"
                  : "none",
            }}
            exit={{
              opacity: 0,
              y: 10,
            }}
            transition={{
              duration:
                shouldReduceMotion
                  ? 0
                  : 0.44,

              delay:
                shouldReduceMotion
                  ? 0
                  : 0.22,

              ease,
            }}
            className={[
              "absolute bottom-4 left-1/2",
              "z-30 -translate-x-1/2",
              "flex items-center gap-2",
              "sm:bottom-6",
            ].join(" ")}
          >
            <GlassIconButton
              label="Zoom out"
              onClick={() => {
                changeScale(
                  scale -
                    SCALE_STEP,
                );
              }}
              disabled={
                scale <= MIN_SCALE
              }
            >
              <MinusIcon className="h-4 w-4" />
            </GlassIconButton>

            <button
              type="button"
              onClick={
                resetTransform
              }
              className={[
                "h-11 min-w-[72px]",
                "rounded-full",
                "border border-white/15",
                "bg-black/25",
                "px-4",
                "text-xs tabular-nums",
                "text-white/70",
                "backdrop-blur-xl",

                "transition-[background-color,border-color,transform]",
                "duration-500",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",

                "hover:scale-[1.035]",
                "hover:border-white/30",
                "hover:bg-white/10",

                "focus-visible:outline-none",
                "focus-visible:ring-1",
                "focus-visible:ring-white/70",
              ].join(" ")}
            >
              {Math.round(
                scale * 100,
              )}
              %
            </button>

            <GlassIconButton
              label="Zoom in"
              onClick={() => {
                changeScale(
                  scale +
                    SCALE_STEP,
                );
              }}
              disabled={
                scale >= MAX_SCALE
              }
            >
              <PlusIcon className="h-4 w-4" />
            </GlassIconButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(
    lightbox,
    document.body,
  );
}

function ImageSlide({
  src,
  alt,
  direction,
  scale,
  position,
  isInitialReveal,
  shouldReduceMotion,
  onPrevious,
  onNext,
  onZoomToggle,
  onPositionChange,
}: ImageSlideProps) {
  const animationData: SlideAnimationData = {
    direction,
    isInitialReveal,
  };

  return (
    <motion.div
      custom={animationData}
      variants={
        shouldReduceMotion
          ? undefined
          : slideVariants
      }
      /*
       * Теперь enter вызывается у каждого
       * нового изображения, а не только у первого.
       */
      initial={
        shouldReduceMotion
          ? {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter:
                "blur(0px)",
            }
          : "enter"
      }
      animate={
        shouldReduceMotion
          ? {
              opacity: 1,
              x: position.x,
              y: position.y,
              scale,
              filter:
                "blur(0px)",
            }
          : {
              opacity: 1,
              x: position.x,
              y: position.y,
              scale,
              filter:
                "blur(0px)",
            }
      }
      exit={
        shouldReduceMotion
          ? {
              opacity: 0,
            }
          : "exit"
      }
      transition={{
        opacity: {
          duration:
            shouldReduceMotion
              ? 0
              : isInitialReveal
                ? 0.68
                : 0.42,
          ease,
        },

        x: {
          duration:
            shouldReduceMotion
              ? 0
              : isInitialReveal
                ? 0.7
                : 0.58,
          ease,
        },

        y: {
          duration:
            shouldReduceMotion
              ? 0
              : isInitialReveal
                ? 0.88
                : 0.58,
          ease,
        },

        scale: {
          duration:
            shouldReduceMotion
              ? 0
              : isInitialReveal
                ? 0.92
                : 0.62,
          ease,
        },

        filter: {
          duration:
            shouldReduceMotion
              ? 0
              : isInitialReveal
                ? 0.7
                : 0.42,
          ease,
        },
      }}
      drag={
        scale > 1
          ? true
          : "x"
      }
      dragMomentum={false}
      dragElastic={
        scale > 1
          ? 0.05
          : 0.1
      }
      dragConstraints={
        scale > 1
          ? {
              left: -900,
              right: 900,
              top: -700,
              bottom: 700,
            }
          : {
              left: 0,
              right: 0,
            }
      }
      onDragEnd={(
        _event,
        info,
      ) => {
        if (scale > 1) {
          onPositionChange({
            x:
              position.x +
              info.offset.x,

            y:
              position.y +
              info.offset.y,
          });

          return;
        }

        if (
          info.offset.x >
          SWIPE_THRESHOLD
        ) {
          onPrevious();
          return;
        }

        if (
          info.offset.x <
          -SWIPE_THRESHOLD
        ) {
          onNext();
        }
      }}
      onDoubleClick={
        onZoomToggle
      }
      className={[
        "absolute inset-0",
        "flex items-center justify-center",

        scale > 1
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-zoom-in",
      ].join(" ")}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        loading="eager"
        fetchPriority="high"
        style={{
          width: "auto",
          height: "auto",

          maxWidth: "100%",
          maxHeight: "100%",

          objectFit: "contain",

          filter: "none",
          opacity: 1,
          mixBlendMode: "normal",
          imageRendering: "auto",

          userSelect: "none",
        }}
        className="block"
      />
    </motion.div>
  );
}

function GlassIconButton({
  label,
  children,
  onClick,
  disabled = false,
}: GlassIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={[
        "group/control relative isolate",
        "flex h-11 w-11",
        "items-center justify-center",
        "overflow-hidden rounded-full",

        "border border-white/15",
        "bg-black/25",
        "text-white",

        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_35px_rgba(0,0,0,0.22)]",
        "backdrop-blur-xl",

        "transition-[background-color,border-color,box-shadow,transform,opacity]",
        "duration-500",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",

        "hover:scale-[1.055]",
        "hover:border-white/35",
        "hover:bg-white/12",

        "disabled:pointer-events-none",
        "disabled:opacity-25",

        "focus-visible:outline-none",
        "focus-visible:ring-1",
        "focus-visible:ring-white/75",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-left-[78%] top-[-120%]",
          "h-[350%] w-[86%]",
          "rotate-[22deg]",

          "bg-gradient-to-r",
          "from-transparent",
          "via-white/55",
          "to-transparent",

          "blur-md",

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

function CloseIcon({
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
    >
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ChevronLeftIcon({
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
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function ChevronRightIcon({
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
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function PlusIcon({
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
    >
      <path d="M12 6v12" />
      <path d="M6 12h12" />
    </svg>
  );
}

function MinusIcon({
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
    >
      <path d="M6 12h12" />
    </svg>
  );
}