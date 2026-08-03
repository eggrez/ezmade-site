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
const layerKeepAliveOpacity = 0.012;


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
  "bg-transparent px-0 pb-2 pt-1",
  "[@media(max-height:720px)]:pb-1",
  "[@media(max-height:720px)]:pt-0",
  "text-[clamp(1rem,1.25vw,1.3rem)]",
  "leading-[1.45] tracking-[-0.025em]",
  "text-[var(--color-text)]",
  "outline-none",
  "transition-[border-color] duration-700",
  "ease-[cubic-bezier(0.22,1,0.36,1)]",
  "placeholder:text-[var(--color-text-secondary)]/45",
  "focus:border-black/70",
  "md:pb-3",
].join(" ");


const textareaClass = [
  "block w-full resize-none overflow-hidden",
  "border-0 border-b border-black/[0.18]",
  "bg-transparent px-0 pb-3 pt-2",
  "[@media(max-height:720px)]:pb-2",
"[@media(max-height:720px)]:pt-1",
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
  "ez-glass-control relative isolate inline-flex items-center justify-center",
  "overflow-hidden",
  "rounded-full",
  "border border-white/70",
  "bg-white/30",
  "backdrop-blur-[18px] backdrop-saturate-150",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.06)]",
  "px-4 py-2",
"text-[0.78rem]",
"[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:px-5",
"[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:py-2.5",
"[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:text-[0.9rem]",
"[@media(max-height:720px)]:px-3",
"[@media(max-height:720px)]:py-[7px]",
"[@media(max-height:720px)]:text-[0.7rem]",
"[@media(min-width:381px)_and_(max-width:430px)]:px-3",
"[@media(min-width:381px)_and_(max-width:430px)]:py-[7px]",
"[@media(min-width:381px)_and_(max-width:430px)]:text-[0.7rem]",
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
const [isSending, setIsSending] = useState(false);
const [submitError, setSubmitError] = useState("");


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
    [layerKeepAliveOpacity, 1],
  );


  const rightY = useTransform(
    progress,
    [0.07, 0.89],
    [18, 0],
  );


  const contactDetailsOpacity = useTransform(
    progress,
    [0.15, 0.97],
    [layerKeepAliveOpacity, 1],
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


  async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const project = String(formData.get("project") ?? "").trim();
  const companyFax = String(
  formData.get("companyFax") ?? "",
).trim();

  setIsSending(true);
  setSubmitError("");

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        project,
        companyFax,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Failed to send message.",
      );
    }

    form.reset();
    setIsSubmitted(true);
  } catch (error) {
    setSubmitError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    );
  } finally {
    setIsSending(false);
  }
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
        "pt-24",
"pb-4",
"[@media(width:414px)_and_(orientation:portrait)]:!pt-[5.25rem]",

"[@media(max-width:380px)_and_(max-height:700px)]:pt-[5rem]",
"[@media(max-width:380px)_and_(max-height:700px)]:pb-6",

"lg:py-[clamp(32px,4vw,72px)]",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto grid w-full max-w-[2200px] content-start",
"lg:h-full lg:content-stretch",
          "grid-cols-1 gap-8",
          "[@media(width:414px)_and_(orientation:portrait)]:!gap-5",
          "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
"[@media(min-width:900px)_and_(max-width:1100px)]:grid-cols-1",

"lg:gap-[clamp(80px,9vw,220px)]",
"[@media(min-width:900px)_and_(max-width:1100px)]:gap-6",

"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:h-full",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!grid-cols-[0.85fr_1.15fr]",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:content-center",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!gap-12",
          "xl:gap-[clamp(120px,10vw,240px)]",
        ].join(" ")}
      >
        {/* Left side */}


        <div className="flex min-w-0 flex-col">
          <div className="flex flex-none items-start lg:flex-1 lg:items-center">
            <motion.h2
              style={{
                opacity: shouldReduceMotion
                  ? 1
                  : titleOpacity,
                y: shouldReduceMotion ? 0 : titleY,
              }}
              className={[
                "max-w-[900px]",
                "text-[3.1rem]",
"[@media(max-height:720px)]:text-[2.45rem]",
                "font-medium",
                "leading-[0.88]",
                "tracking-[-0.075em]",
                "text-[var(--color-text)]",
                "sm:text-[clamp(5rem,13vw,9rem)]",
                "[@media(min-width:700px)_and_(max-width:900px)]:text-[5rem]",
                "lg:text-[clamp(5rem,8vw,9rem)]",
                "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!text-[3.8rem]",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!leading-[0.88]",
                "[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:!text-[6.2rem]",
                "[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:!leading-[0.9]",
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
          className={[
  "transform-gpu [backface-visibility:hidden]",
  "will-change-[transform,opacity]",
  "shrink-0 pt-8",

  "[@media(max-width:380px)_and_(max-height:700px)]:pt-5",

  "[@media(min-width:700px)_and_(max-width:900px)]:pt-5",

  "[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:pt-4",

  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!pt-5",
].join(" ")}
          >
            <a
              href="mailto:eggrezgrigorev@gmail.com"
              className={[
                "inline-block max-w-full break-words",
                "text-[1.08rem]",
"min-[390px]:text-[1.25rem]",
                "tracking-[-0.045em]",
                "text-[var(--color-text)]",
                "transition-opacity duration-700",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",
                "hover:opacity-45",
                "sm:text-[clamp(1.5rem,4vw,2.5rem)]",
                "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!text-[1.15rem]",
                "[@media(min-width:1024px)_and_(max-width:1100px)_and_(min-height:900px)]:!text-[1.7rem]",
              ].join(" ")}
            >
              eggrezgrigorev@gmail.com
            </a>


            <div className="mt-7 flex flex-wrap items-center gap-2 [@media(max-height:720px)]:mt-5 [@media(max-height:720px)]:flex-nowrap [@media(max-height:720px)]:gap-1 [@media(max-width:380px)_and_(max-height:700px)]:!mt-3 [@media(min-width:381px)_and_(max-width:430px)]:!mt-5 [@media(min-width:381px)_and_(max-width:430px)]:flex-nowrap [@media(min-width:381px)_and_(max-width:430px)]:gap-1 [@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mt-5">
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

  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!pt-0",
].join(" ")}
        >
          <motion.div
            style={{
              opacity: shouldReduceMotion
                ? 1
                : rightOpacity,
              y: shouldReduceMotion ? 0 : rightY,
            }}
            className="min-w-0 transform-gpu [backface-visibility:hidden] will-change-[transform,opacity]"
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
                <div
 className={[
  "mt-3 mb-4",
  "[@media(width:414px)_and_(orientation:portrait)]:!mt-3",
"[@media(width:414px)_and_(orientation:portrait)]:!mb-5",

  "[@media(max-width:380px)_and_(max-height:700px)]:!mt-2",
  "[@media(max-width:380px)_and_(max-height:700px)]:!mb-2",

  "min-[390px]:mt-6",
  "min-[390px]:mb-8",

  "sm:mt-0 sm:mb-16",
  "md:mb-24",

  "[@media(min-width:700px)_and_(max-width:900px)]:!mb-10",

  "[@media(max-height:720px)]:mt-3",
  "[@media(max-height:720px)]:mb-4",
].join(" ")}
>
                    <p
                      className={[
                        "-ml-[0.025em]",
                        "text-[2rem]",
"leading-[0.96]",
"min-[390px]:text-[2.3rem]",
                        "font-medium",
                     
                        "tracking-[-0.06em]",
                        "text-[var(--color-text)]",
                        "sm:text-[clamp(3rem,7vw,4.5rem)]",
                        "lg:text-[clamp(2.7rem,3.6vw,4.5rem)]",
                        "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!text-[2rem]",
                      ].join(" ")}
                    >
                      What are we making?
                    </p>
                  </div>


                  <form
                    onSubmit={handleSubmit}
                    className="w-full min-w-0"
                  >
                    <input
  name="companyFax"
  type="text"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
/>
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
  maxLength={100}
  required
  className={fieldClass}
/>
                    </div>


                    <div className="mt-5 [@media(max-width:380px)_and_(max-height:700px)]:mt-3 sm:mt-10 [@media(min-width:700px)_and_(max-width:900px)]:!mt-7 [@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mt-4">
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
  maxLength={320}
  required
  className={fieldClass}
/>
  </div>
</div>


                   <div className="mt-7 [@media(width:414px)_and_(orientation:portrait)]:!mt-5 [@media(max-width:380px)_and_(max-height:700px)]:mt-4 sm:mt-12 [@media(min-width:700px)_and_(max-width:900px)]:!mt-8 [@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mt-5">
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
  maxLength={5000}
  required
  placeholder="Tell us about your project"
  onInput={handleTextareaInput}
  className={textareaClass}
/>
                    </div>


                    <div
  className={[
  "mt-5 flex flex-col gap-3",

  "[@media(max-width:380px)_and_(max-height:700px)]:!mt-2",
  "[@media(max-width:380px)_and_(max-height:700px)]:!gap-1.5",
  "[@media(min-width:381px)_and_(max-width:430px)]:!mt-4",
"[@media(min-width:381px)_and_(max-width:430px)]:!gap-2",

  "[@media(min-width:500px)_and_(max-width:600px)]:mt-2",
  "[@media(max-height:720px)]:mt-4",
  "min-[390px]:mt-7",

  "sm:mt-14",
  "[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!mt-5",
"[@media(min-width:900px)_and_(max-width:1100px)_and_(max-height:700px)]:!gap-2",
  "[@media(min-width:700px)_and_(max-width:900px)]:!mt-8",
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
  disabled={isSending}
  className={[
    "sm:w-auto",
    "[@media(max-width:380px)_and_(max-height:700px)]:!min-h-[42px]",
    "[@media(max-width:380px)_and_(max-height:700px)]:!py-2.5",
  ].join(" ")}
>
  {isSending ? "Sending..." : "Send"}
</GlassButton>
                    </div>
                  </form>
                  {submitError && (
  <p
    role="alert"
    className="mt-4 text-sm text-red-500"
  >
    {submitError}
  </p>
)}
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