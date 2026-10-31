"use client";

import { motion, useReducedMotion } from "framer-motion";

const introHidden = { opacity: 0, filter: "blur(14px)" };
const introVisible = { opacity: 1, filter: "blur(0px)" };
const introEase = [0.4, 0, 0.2, 1] as const;

export default function CompactIntro({ ready }: { ready: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      data-home-scene="hero"
      data-intro-ready={ready ? "true" : "false"}
      aria-label="EZ — made easy with us."
      className="relative flex h-svh min-h-[320px] items-center justify-center bg-[var(--color-bg)] px-6"
    >
      <motion.span
        aria-hidden="true"
        initial={shouldReduceMotion ? introVisible : introHidden}
        animate={shouldReduceMotion || ready ? introVisible : introHidden}
        transition={{ duration: shouldReduceMotion ? 0 : 1.15, ease: introEase }}
        className="h-[clamp(4.8rem,6.4vw,6.8rem)] w-[clamp(4.8rem,6.4vw,6.8rem)] bg-black"
        style={{
          mask: 'url("/images/logo-mark.svg") center / contain no-repeat',
          WebkitMask: 'url("/images/logo-mark.svg") center / contain no-repeat',
        }}
      />
      <motion.h1
        initial={shouldReduceMotion ? introVisible : introHidden}
        animate={shouldReduceMotion || ready ? introVisible : introHidden}
        transition={{ duration: shouldReduceMotion ? 0 : 1.15, delay: shouldReduceMotion ? 0 : 0.08, ease: introEase }}
        className="absolute left-1/2 bottom-[max(5.5rem,env(safe-area-inset-bottom))] flex w-max max-w-[calc(100%-48px)] -translate-x-1/2 items-baseline justify-center gap-[7px] whitespace-nowrap text-[14px] font-normal leading-[20px] tracking-normal text-[var(--color-text-secondary)]"
        style={{ WebkitTextSizeAdjust: "100%", textSizeAdjust: "100%" }}
      >
        <span
          role="img"
          aria-label="EZ"
          className="inline-block h-[10px] w-[27px] shrink-0 bg-current"
          style={{
            mask: 'url("/images/ez-wordmark-tight.svg") center / contain no-repeat',
            WebkitMask: 'url("/images/ez-wordmark-tight.svg") center / contain no-repeat',
          }}
        />
        <span>—</span>
        <span>made easy with us.</span>
      </motion.h1>
    </section>
  );
}
