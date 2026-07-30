"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type ScrollChapterProps = {
  children: ReactNode;
  className?: string;
  isFinal?: boolean;
};

export default function ScrollChapter({
  children,
  className = "",
  isFinal = false,
}: ScrollChapterProps) {
  const chapterRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px)",
    );

    function updateViewport() {
      setIsDesktop(mediaQuery.matches);
    }

    updateViewport();

    mediaQuery.addEventListener(
      "change",
      updateViewport,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateViewport,
      );
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    isFinal
      ? [0.88, 1, 1, 1]
      : [0.86, 1, 1, 0.93],
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    isFinal
      ? [34, 0, 0, 0]
      : [34, 0, 0, -22],
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    isFinal
      ? [0.994, 1, 1, 1]
      : [0.994, 1, 1, 0.997],
  );

  const blur = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    isFinal
      ? [4, 0, 0, 0]
      : [4, 0, 0, 1.5],
  );

  const filter = useMotionTemplate`blur(${blur}px)`;

  const enableMotion =
    isDesktop && !shouldReduceMotion;

  return (
    <motion.div
      ref={chapterRef}
      style={
        enableMotion
          ? {
              opacity,
              y,
              scale,
              filter,
              transformOrigin: "center center",
            }
          : undefined
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}