"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import Section from "./Section";
import WideContainer from "./WideContainer";

type SplitSectionLayout =
  | "balanced"
  | "wide"
  | "extra-wide";

type SplitSectionProps = {
  id?: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  spacing?: "compact" | "default" | "generous";
  layout?: SplitSectionLayout;

  reveal?: boolean;
  revealAmount?: number;
  contentDelay?: number;
  revealTitle?: boolean;
  revealContent?: boolean;

  /**
   * Если true — отключает встроенный whileInView.
   * Компонент становится полностью управляемым извне.
   */
  controlled?: boolean;
};

const layoutClasses: Record<
  SplitSectionLayout,
  string
> = {
  balanced:
    "lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-[clamp(96px,7vw,180px)]",

  wide:
    "lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-[clamp(180px,10vw,280px)]",

  "extra-wide":
    "lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-[clamp(220px,13vw,380px)]",
};

const ease = [0.22, 1, 0.36, 1] as const;

export const splitSectionTitleClassName = [
  "text-[1.8rem]",
  "[font-family:var(--font-geist-sans)]",
  "font-medium leading-[0.95]",
  "tracking-[-0.04em]",
  "text-[var(--color-text-secondary)]",
  "md:text-[2.6rem]",
  "lg:text-[clamp(1.8rem,2.5vw,3.2rem)]",
  "[@media(min-width:768px)_and_(max-width:1180px)]:!text-[2.6rem]",
].join(" ");

export default function SplitSection({
  id,
  title,
  children,
  className = "",
  contentClassName = "",
  spacing = "default",
  layout = "balanced",

  reveal = false,
  revealAmount = 0.42,
  contentDelay = 0.18,
  revealTitle = true,
  revealContent = true,

  controlled = false,
}: SplitSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const animateTitle =
    !controlled &&
    reveal &&
    revealTitle &&
    !shouldReduceMotion;

  const animateContent =
    !controlled &&
    reveal &&
    revealContent &&
    !shouldReduceMotion;

  return (
    <Section
      id={id}
      className={className}
      spacing={spacing}
    >
      <WideContainer>
        <div
          className={`grid gap-8 lg:gap-12 ${layoutClasses[layout]}`}
        >
          {/* Left side */}
          <motion.div
            initial={
              controlled
                ? false
                : animateTitle
                  ? {
                      opacity: 0,
                      x: -18,
                      y: 14,
                      scale: 0.985,
                    }
                  : {
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                    }
            }
            whileInView={
              controlled
                ? undefined
                : {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }
            }
            viewport={
              controlled
                ? undefined
                : {
                    once: true,
                    amount: revealAmount,
                  }
            }
            transition={{
              duration: animateTitle ? 1.2 : 0,
              ease,
            }}
            className="lg:pt-4 lg:text-right"
          >
            <h2 className={splitSectionTitleClassName}>
              {title}
            </h2>
          </motion.div>

          {/* Right side */}
          <motion.div
            initial={
              controlled
                ? false
                : animateContent
                  ? {
                      opacity: 0,
                      x: 18,
                      y: 18,
                      scale: 0.99,
                    }
                  : {
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                    }
            }
            whileInView={
              controlled
                ? undefined
                : {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }
            }
            viewport={
              controlled
                ? undefined
                : {
                    once: true,
                    amount: revealAmount,
                  }
            }
            transition={{
              duration: animateContent ? 1.25 : 0,
              delay: animateContent
                ? contentDelay
                : 0,
              ease,
            }}
            className={[
  "min-w-0",
  "[@media(min-width:1024px)_and_(max-width:1180px)]:pr-1",
  contentClassName,
].join(" ")}
          >
            {children}
          </motion.div>
        </div>
      </WideContainer>
    </Section>
  );
}