"use client";

import { motion } from "framer-motion";

type CursorLogoProps = {
  className?: string;
  isActive?: boolean;
  shouldReduceMotion?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function CursorLogo({
  className = "",
  isActive = false,
  shouldReduceMotion = false,
}: CursorLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="ez-cursor-logo-clip">
          <path d="M64 39.181V4C64 1.791 62.201 0 59.981 0H4.019C1.799 0 0 1.791 0 4V59.999C0 62.208 1.799 64 4.019 64H39.181L64 39.181Z" />

          <path d="M44.851 64H59.981C62.201 64 64 62.209 64 60V44.851L44.851 64Z" />
        </clipPath>

        <linearGradient
          id="ez-cursor-shine"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor="currentColor"
            stopOpacity="0"
          />

          <stop
            offset="48%"
            stopColor="currentColor"
            stopOpacity="0.06"
          />

          <stop
            offset="52%"
            stopColor="currentColor"
           stopOpacity="0.42"
          />

          <stop
            offset="100%"
            stopColor="currentColor"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {/* Основная часть знака */}
      <path
        d="M64 39.181V4C64 1.791 62.201 0 59.981 0H4.019C1.799 0 0 1.791 0 4V59.999C0 62.208 1.799 64 4.019 64H39.181L64 39.181Z"
        fill="currentColor"
      />

      {/* Нижний отделённый угол */}
      <motion.path
        d="M44.851 64H59.981C62.201 64 64 62.209 64 60V44.851L44.851 64Z"
        fill="currentColor"
        animate={{
          x:
            isActive && !shouldReduceMotion
              ? -1
              : 0,
          y:
            isActive && !shouldReduceMotion
              ? -1
              : 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.65,
          ease,
        }}
      />

      {/* Разделительная линия */}
      <motion.path
        d="M42.9 64L64 42.9"
        stroke="black"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        animate={{
          opacity: isActive ? 0.9 : 0.78,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.55,
          ease,
        }}
      />

      {/* Один проход блика при каждом новом hover */}
      {isActive && !shouldReduceMotion && (
        <motion.rect
          key="cursor-shine"
          x="-70"
          y="-28"
          width="34"
          height="125"
          rx="14"
          fill="url(#ez-cursor-shine)"
          clipPath="url(#ez-cursor-logo-clip)"
          initial={{
            x: -40,
            opacity: 0,
          }}
          animate={{
            x: 150,
            opacity: [0, 0.55, 0],
          }}
          transition={{
            duration: 1.15,
            ease,
            times: [0, 0.38, 1],
          }}
          transform="rotate(24 32 32)"
        />
      )}
    </svg>
  );
}