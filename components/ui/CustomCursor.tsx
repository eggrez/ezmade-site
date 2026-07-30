"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import CursorLogo from "./CursorLogo";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "[data-cursor]",
].join(", ");

const NATIVE_CURSOR_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  ".ez-volume-slider",
].join(", ");

const ease = [0.22, 1, 0.36, 1] as const;

export default function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();

  /*
   * Начальные координаты находятся за пределами экрана.
   */
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);

  /*
   * Более мягкое следование.
   */
  const springX = useSpring(pointerX, {
    stiffness: shouldReduceMotion ? 1000 : 500,
    damping: shouldReduceMotion ? 100 : 42,
    mass: shouldReduceMotion ? 0.01 : 0.34,
  });

  const springY = useSpring(pointerY, {
    stiffness: shouldReduceMotion ? 1000 : 500,
    damping: shouldReduceMotion ? 100 : 42,
    mass: shouldReduceMotion ? 0.01 : 0.34,
  });

  const velocityX = useVelocity(springX);

  /*
   * Почти незаметный наклон во время движения.
   */
  const cursorRotate = useTransform(
    velocityX,
    [-2200, 0, 2200],
    [-1.4, 0, 1.4],
  );

  const logoScaleTarget = useMotionValue(1);

  const logoScale = useSpring(logoScaleTarget, {
    stiffness: shouldReduceMotion ? 1000 : 135,
    damping: shouldReduceMotion ? 100 : 22,
    mass: shouldReduceMotion ? 0.01 : 0.9,
  });

  const movementScaleTarget = useMotionValue(1);

  const movementScale = useSpring(
    movementScaleTarget,
    {
      stiffness: shouldReduceMotion ? 1000 : 115,
      damping: shouldReduceMotion ? 100 : 20,
      mass: shouldReduceMotion ? 0.01 : 0.95,
    },
  );

  const movementTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const [isEnabled, setIsEnabled] =
    useState(false);

  /*
   * Курсор не рендерится, пока мы не получили
   * первые настоящие координаты мыши.
   *
   * Это предотвращает вспышку в левом верхнем углу
   * во время первой отрисовки и гидратации.
   */
  const [isCursorReady, setIsCursorReady] =
    useState(false);

  const [isVisible, setIsVisible] =
    useState(false);

  const [isActive, setIsActive] =
    useState(false);

  const [isHidden, setIsHidden] =
    useState(false);

  const [isPressed, setIsPressed] =
    useState(false);

  const [isMoving, setIsMoving] =
    useState(false);

  const [label, setLabel] = useState<
    string | null
  >(null);

  useEffect(() => {
    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    if (!finePointerQuery.matches) {
      return;
    }

    setIsEnabled(true);

    document.documentElement.classList.add(
      "ez-custom-cursor-enabled",
    );

    function updateCursorTarget(
      target: EventTarget | null,
    ) {
      if (!(target instanceof Element)) {
        setIsActive(false);
        setIsHidden(false);
        setLabel(null);
        return;
      }

      const nativeCursorElement = target.closest(
        NATIVE_CURSOR_SELECTOR,
      );

      if (nativeCursorElement) {
        setIsHidden(true);
        setIsActive(false);
        setLabel(null);
        return;
      }

      setIsHidden(false);

      const interactiveElement = target.closest(
        INTERACTIVE_SELECTOR,
      );

      if (!interactiveElement) {
        setIsActive(false);
        setLabel(null);
        return;
      }

      setIsActive(true);

      const cursorLabel =
        interactiveElement.getAttribute(
          "data-cursor",
        );

      setLabel(cursorLabel || null);
    }

    function registerMovement() {
      setIsMoving(true);

      if (movementTimeoutRef.current) {
        clearTimeout(
          movementTimeoutRef.current,
        );
      }

      movementTimeoutRef.current = setTimeout(
        () => {
          setIsMoving(false);
        },
        110,
      );
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      if (
        event.pointerType &&
        event.pointerType !== "mouse"
      ) {
        return;
      }

      /*
       * Сначала задаём реальные координаты,
       * затем разрешаем отрисовку курсора.
       */
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);

      setIsCursorReady(true);
      setIsVisible(true);

      registerMovement();
      updateCursorTarget(event.target);
    }

    function handlePointerOver(
      event: PointerEvent,
    ) {
      updateCursorTarget(event.target);
    }

    function handlePointerOut(
      event: PointerEvent,
    ) {
      if (event.relatedTarget === null) {
        setIsVisible(false);
        setIsActive(false);
        setIsHidden(false);
        setIsMoving(false);
        setLabel(null);
        return;
      }

      updateCursorTarget(event.relatedTarget);
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        event.pointerType &&
        event.pointerType !== "mouse"
      ) {
        return;
      }

      setIsPressed(true);
    }

    function handlePointerUp() {
      setIsPressed(false);
    }

    function handleWindowBlur() {
      setIsVisible(false);
      setIsPressed(false);
      setIsMoving(false);
    }

    function handleMouseLeave() {
      setIsVisible(false);
      setIsPressed(false);
      setIsMoving(false);
    }

    /*
     * При возвращении мыши в окно не показываем курсор
     * до следующего pointermove. Так он никогда не возникает
     * со старыми или нулевыми координатами.
     */
    function handleMouseEnter() {
      setIsVisible(false);
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    document.addEventListener(
      "pointerover",
      handlePointerOver,
    );

    document.addEventListener(
      "pointerout",
      handlePointerOut,
    );

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    window.addEventListener(
      "blur",
      handleWindowBlur,
    );

    document.documentElement.addEventListener(
      "mouseleave",
      handleMouseLeave,
    );

    document.documentElement.addEventListener(
      "mouseenter",
      handleMouseEnter,
    );

    return () => {
      if (movementTimeoutRef.current) {
        clearTimeout(
          movementTimeoutRef.current,
        );
      }

      document.documentElement.classList.remove(
        "ez-custom-cursor-enabled",
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      document.removeEventListener(
        "pointerover",
        handlePointerOver,
      );

      document.removeEventListener(
        "pointerout",
        handlePointerOut,
      );

      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "pointerup",
        handlePointerUp,
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur,
      );

      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave,
      );

      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnter,
      );
    };
  }, [pointerX, pointerY]);

  /*
   * Плавная реакция на hover и click.
   */
  useEffect(() => {
    if (shouldReduceMotion) {
      logoScaleTarget.set(1);
      return;
    }

    if (isPressed) {
      logoScaleTarget.set(0.94);
      return;
    }

    if (isActive) {
      logoScaleTarget.set(1.045);
      return;
    }

    logoScaleTarget.set(1);
  }, [
    isActive,
    isPressed,
    logoScaleTarget,
    shouldReduceMotion,
  ]);

  /*
   * Во время движения знак увеличивается на 1.5%.
   */
  useEffect(() => {
    if (shouldReduceMotion) {
      movementScaleTarget.set(1);
      return;
    }

    movementScaleTarget.set(
      isMoving && !isPressed ? 1.015 : 1,
    );
  }, [
    isMoving,
    isPressed,
    movementScaleTarget,
    shouldReduceMotion,
  ]);

  /*
   * Пока нет первых реальных координат,
   * элемент курсора отсутствует в DOM.
   */
  if (!isEnabled || !isCursorReady) {
    return null;
  }

  const hasLabel = Boolean(label);
  const cursorSize = hasLabel ? 76 : 32;

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      className={[
        "pointer-events-none",
        "fixed left-0 top-0",
        "z-[9999]",
      ].join(" ")}
      style={{
        x: springX,
        y: springY,

        /*
         * Белый SVG инвертируется относительно
         * изображения или фона под курсором.
         */
        mixBlendMode: label
          ? "normal"
          : "difference",
      }}
      animate={{
        opacity:
          isVisible && !isHidden ? 1 : 0,
      }}
      transition={{
        opacity: {
          duration: shouldReduceMotion
            ? 0
            : 0.3,
          ease,
        },
      }}
    >
      <motion.div
        className={[
          "relative",
          "flex items-center justify-center",
        ].join(" ")}
        style={{
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          width: cursorSize,
          height: cursorSize,
        }}
        transition={{
          width: {
            duration: shouldReduceMotion
              ? 0
              : 0.65,
            ease,
          },

          height: {
            duration: shouldReduceMotion
              ? 0
              : 0.65,
            ease,
          },
        }}
      >
        <AnimatePresence
          initial={false}
          mode="wait"
        >
          {label ? (
            <motion.div
              key={`label-${label}`}
              initial={{
                opacity: 0,
                scale: 0.92,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(3px)",
              }}
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : 0.48,
                ease,
              }}
              className={[
                "flex h-full w-full",
                "items-center justify-center",
                "rounded-full",
                "bg-white/95",
                "px-3",
                "text-center",
                "text-[12px]",
                "font-medium",
                "leading-none",
                "tracking-[-0.025em]",
                "text-[#111111]",
                "shadow-[0_8px_28px_rgba(0,0,0,0.16)]",
                "ring-1 ring-black/70",
              ].join(" ")}
            >
              {label}
            </motion.div>
          ) : (
            <motion.div
              key="cursor-logo"
              initial={{
                opacity: 0,
                scale: 0.92,
                filter: "blur(3px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(3px)",
              }}
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : 0.42,
                ease,
              }}
              className="h-full w-full"
            >
              <motion.div
                className={[
                  "relative",
                  "h-full w-full",
                  "origin-center",
                  "text-white",
                ].join(" ")}
                style={{
                  scale: logoScale,
                  rotate: shouldReduceMotion
                    ? 0
                    : cursorRotate,
                }}
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    scale: movementScale,
                  }}
                >
                  <CursorLogo
                    className="h-full w-full"
                    isActive={isActive}
                    shouldReduceMotion={Boolean(
                      shouldReduceMotion,
                    )}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}