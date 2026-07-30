"use client";


import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  type FormEvent,
  useState,
} from "react";


import GlassButton from "@/components/ui/GlassButton";


import type { HomeSceneProps } from "./types";


const ease = [0.22, 1, 0.36, 1] as const;


const socialLinks = [
  {
    title: "Telegram",
    href: "https://t.me/eggrez",
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/ez.prdct",
  },
  {
    title: "Behance",
    href: "https://www.behance.net/eggrez",
  },
  {
    title: "Vimeo",
    href: "https://vimeo.com/eggrez",
  },
];


const fieldClass = [
  "w-full border-0 border-b",
  "border-black/[0.18]",
  "bg-transparent px-0 pb-3 pt-2",
  "text-[clamp(1rem,1.25vw,1.3rem)]",
  "leading-[1.45] tracking-[-0.025em]",
  "text-[var(--color-text)]",
  "outline-none",
  "transition-[border-color] duration-700",
  "ease-[cubic-bezier(0.22,1,0.36,1)]",
  "placeholder:text-[var(--color-text-secondary)]/45",
  "focus:border-black/70",
  "md:pb-4",
].join(" ");


const textareaClass = [
  "block w-full resize-none overflow-hidden",
  "border-0 border-b border-black/[0.18]",
  "bg-transparent px-0 pb-3 pt-2",
  "text-[clamp(1rem,1.25vw,1.3rem)]",
  "leading-[1.55] tracking-[-0.025em]",
  "text-[var(--color-text)]",
  "outline-none",
  "transition-[border-color] duration-700",
  "ease-[cubic-bezier(0.22,1,0.36,1)]",
  "placeholder:text-[var(--color-text-secondary)]/45",
  "focus:border-black/70",
  "md:pb-4",
].join(" ");


const socialLinkClass = [
  "relative isolate inline-flex items-center justify-center",
  "overflow-hidden",
  "rounded-full",
  "border border-white/70",
  "bg-white/30",
  "backdrop-blur-[18px] backdrop-saturate-150",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.06)]",
  "px-4 py-2",
  "text-[0.78rem]",
  "leading-none",
  "tracking-[-0.015em]",
  "text-[var(--color-text-secondary)]",
  "outline-none",
  "transition-[border-color,color,background-color,box-shadow]",
  "duration-700",
  "ease-[cubic-bezier(0.22,1,0.36,1)]",
  "hover:border-white/95",
  "hover:bg-white/55",
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06),0_12px_30px_rgba(0,0,0,0.1)]",
  "hover:text-[var(--color-text)]",
  "focus-visible:border-white",
  "focus-visible:bg-white/55",
  "focus-visible:ring-2 focus-visible:ring-black/10",
  "focus-visible:ring-offset-2",
  "focus-visible:text-[var(--color-text)]",
].join(" ");


export default function ContactContent({
  progress,
}: HomeSceneProps) {
  const shouldReduceMotion = useReducedMotion();


  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSocialIndex, setActiveSocialIndex] =
    useState<number | null>(null);


  /*
   * Последовательность повторяет About, но диапазоны
   * пересчитаны под более короткую финальную сцену.
   * Поэтому в реальном scroll-timeline каждый элемент
   * проявляется с той же скоростью, что и в About.
   *
   * Только opacity + y.
   * Без горизонтального движения, blur и scale.
   */


  const titleOpacity = useTransform(
    progress,
    [0.02, 0.84],
    [0, 1],
  );


  const titleY = useTransform(
    progress,
    [0.02, 0.84],
    [24, 0],
  );


  const rightOpacity = useTransform(
    progress,
    [0.07, 0.89],
    [0, 1],
  );


  const rightY = useTransform(
    progress,
    [0.07, 0.89],
    [18, 0],
  );


  const contactDetailsOpacity = useTransform(
    progress,
    [0.15, 0.97],
    [0, 1],
  );


  const contactDetailsY = useTransform(
    progress,
    [0.15, 0.97],
    [12, 0],
  );


  function handleTextareaInput(
    event: FormEvent<HTMLTextAreaElement>,
  ) {
    const textarea = event.currentTarget;


    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    const formData = new FormData(event.currentTarget);


   const name = String(formData.get("name") ?? "");
const email = String(formData.get("email") ?? "");
const project = String(formData.get("project") ?? "");

    const subject = encodeURIComponent(
      `New project enquiry from ${name}`,
    );


   const body = encodeURIComponent(
  [
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Project:",
    project,
  ].join("\n"),
);


    setIsSubmitted(true);


    window.location.href =
  `mailto:eggrezgrigorev@gmail.com?subject=${subject}&body=${body}`;
  }
  function getSocialOffset(index: number) {
    if (
      shouldReduceMotion ||
      activeSocialIndex === null ||
      index === activeSocialIndex
    ) {
      return 0;
    }


    return index < activeSocialIndex ? -10 : 10;
  }


  return (
    <section
      id="contact"
      className={[
        "h-full w-full",
        "overflow-hidden",
        "bg-[var(--color-bg)]",
        "px-[clamp(24px,4vw,72px)]",
        "py-[clamp(32px,4vw,72px)]",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto grid h-full w-full max-w-[2200px]",
          "grid-cols-1 gap-16",
          "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
          "lg:gap-[clamp(80px,9vw,220px)]",
          "xl:gap-[clamp(120px,10vw,240px)]",
        ].join(" ")}
      >
        {/* Left side */}


        <div className="flex min-w-0 flex-col">
          <div className="flex flex-1 items-center">
            <motion.h2
              style={{
                opacity: shouldReduceMotion
                  ? 1
                  : titleOpacity,
                y: shouldReduceMotion ? 0 : titleY,
              }}
              className={[
                "max-w-[900px]",
                "text-[clamp(4rem,16vw,9rem)]",
                "font-medium",
                "leading-[0.88]",
                "tracking-[-0.075em]",
                "text-[var(--color-text)]",
                "sm:text-[clamp(5rem,13vw,9rem)]",
                "lg:text-[clamp(5rem,8vw,9rem)]",
              ].join(" ")}
            >
              Let&apos;s make
              <br />
              something
              <br />
              great.
            </motion.h2>
          </div>


          <motion.div
            style={{
              opacity: shouldReduceMotion
                ? 1
                : contactDetailsOpacity,
              y: shouldReduceMotion
                ? 0
                : contactDetailsY,
            }}
            className="shrink-0 pt-8"
          >
            <a
              href="mailto:eggrezgrigorev@gmail.com"
              className={[
                "inline-block max-w-full break-words",
                "text-[clamp(1.25rem,5.8vw,2.5rem)]",
                "tracking-[-0.045em]",
                "text-[var(--color-text)]",
                "transition-opacity duration-700",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",
                "hover:opacity-45",
                "sm:text-[clamp(1.5rem,4vw,2.5rem)]",
                "lg:text-[clamp(1.35rem,2.2vw,2.5rem)]",
              ].join(" ")}
            >
              eggrezgrigorev@gmail.com
            </a>


            <div className="mt-7 flex flex-wrap items-center gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.title}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className={socialLinkClass}
                  animate={{
                    x: getSocialOffset(index),
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.035,
                        }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: 0,
                          scale: 0.98,
                        }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.55,
                    ease,
                  }}
                  onHoverStart={() => setActiveSocialIndex(index)}
                  onHoverEnd={() => setActiveSocialIndex(null)}
                  onFocus={() => setActiveSocialIndex(index)}
                  onBlur={() => setActiveSocialIndex(null)}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white/70 to-white/0 opacity-80"
                  />
                  <span className="relative z-10">
                    {social.title}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>


        {/* Right side */}


        <div
          className={[
            "flex min-w-0 flex-col justify-center",
            "lg:pt-[clamp(48px,7vh,88px)]",
          ].join(" ")}
        >
          <motion.div
            style={{
              opacity: shouldReduceMotion
                ? 1
                : rightOpacity,
              y: shouldReduceMotion ? 0 : rightY,
            }}
            className="min-w-0"
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="contact-form"
                  initial={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={
                    shouldReduceMotion
                      ? {
                          opacity: 0,
                        }
                      : {
                          opacity: 0,
                          y: -12,
                        }
                  }
                  transition={{
                    duration: shouldReduceMotion
                      ? 0
                      : 0.85,
                    ease,
                  }}
                  className="min-w-0"
                >
                  <div className="mb-16 sm:mb-20 md:mb-24">
                    <p
                      className={[
                        "-ml-[0.025em]",
                        "text-[clamp(2.3rem,10vw,4rem)]",
                        "font-medium",
                        "leading-[0.98]",
                        "tracking-[-0.06em]",
                        "text-[var(--color-text)]",
                        "sm:text-[clamp(3rem,7vw,4.5rem)]",
                        "lg:text-[clamp(2.7rem,3.6vw,4.5rem)]",
                      ].join(" ")}
                    >
                      What are we making?
                    </p>
                  </div>


                  <form
                    onSubmit={handleSubmit}
                    className="w-full min-w-0"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="text-sm text-[var(--color-text-secondary)]"
                      >
                        Your name
                      </label>


                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className={fieldClass}
                      />
                    </div>


                    <div className="mt-10 sm:mt-12">
  <div>
    <label
      htmlFor="email"
      className="text-sm text-[var(--color-text-secondary)]"
    >
      Email
    </label>

    <input
      id="email"
      name="email"
      type="email"
      autoComplete="email"
      required
      className={fieldClass}
    />
  </div>
</div>


                    <div className="mt-10 sm:mt-12">
                      <label
                        htmlFor="project"
                        className="sr-only"
                      >
                        Tell us about your project
                      </label>


                      <textarea
                        id="project"
                        name="project"
                        rows={1}
                        required
                        placeholder="Tell us about your project"
                        onInput={handleTextareaInput}
                        className={textareaClass}
                      />
                    </div>


                    <div
                      className={[
                        "mt-12 flex flex-col gap-8",
                        "sm:mt-14",
                        "md:flex-row",
                        "md:items-center",
                        "md:justify-between",
                      ].join(" ")}
                    >
                      <p className="max-w-[440px] text-[13px] leading-[1.55] text-[var(--color-text-secondary)] sm:text-sm">
  We&apos;ll only use your email to reply to your message.
</p>


                      <GlassButton
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        className="sm:w-auto"
                      >
                        Send
                      </GlassButton>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="contact-success"
                  initial={
                    shouldReduceMotion
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                          y: 18,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: shouldReduceMotion
                      ? 0
                      : 1.1,
                    ease,
                  }}
                  className="flex min-h-[360px] items-center sm:min-h-[440px] lg:min-h-[520px]"
                >
                  <p className="text-[clamp(3rem,14vw,7rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[var(--color-text)] sm:text-[clamp(4rem,10vw,7rem)] lg:text-[clamp(3rem,6vw,7rem)]">
                    We&apos;ll be
                    <br />
                    in touch.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}