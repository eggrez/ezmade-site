"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  type FormEvent,
  useState,
} from "react";

import GlassButton from "@/components/ui/GlassButton";

const ease = [0.22, 1, 0.36, 1] as const;

const socialLinks = [
  {
    title: "Telegram",
    href: "https://t.me/",
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/",
  },
  {
    title: "Vimeo",
    href: "https://vimeo.com/",
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

export default function Contact() {
  const shouldReduceMotion = useReducedMotion();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSocialIndex, setActiveSocialIndex] =
    useState<number | null>(null);

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
    const phone = String(formData.get("phone") ?? "");
    const email = String(formData.get("email") ?? "");
    const project = String(formData.get("project") ?? "");

    const subject = encodeURIComponent(
      `New project enquiry from ${name}`,
    );

    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        "",
        "Project:",
        project,
      ].join("\n"),
    );

    setIsSubmitted(true);

    window.location.href =
      `mailto:hello@ezprdct.com?subject=${subject}&body=${body}`;
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
    <motion.section
      id="contact"
      initial={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }
          : {
              opacity: 0,
              y: 16,
              scale: 0.994,
              filter: "blur(5px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.16,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 1.35,
        ease,
      }}
      className={[
        "scroll-mt-24 overflow-hidden",
        "bg-[var(--color-bg)]",
        "px-[clamp(24px,4vw,72px)]",
        "pb-16 pt-24",
        "sm:pb-20 sm:pt-28",
        "md:pb-28 md:pt-40",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto grid w-full max-w-[2200px]",
          "grid-cols-1 gap-24",
          "lg:min-h-[78vh]",
          "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
          "lg:gap-[clamp(80px,9vw,220px)]",
          "xl:gap-[clamp(120px,10vw,240px)]",
        ].join(" ")}
      >
        {/* Left side */}
        <motion.div
          initial={
            shouldReduceMotion
              ? {
                  opacity: 1,
                  x: 0,
                  y: 0,
                }
              : {
                  opacity: 0,
                  x: -14,
                  y: 10,
                }
          }
          whileInView={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.28,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.25,
            ease,
          }}
          className="flex min-w-0 flex-col justify-between"
        >
          <h2
            className={[
              "max-w-[900px]",
              "text-[clamp(4rem,16vw,9rem)]",
              "font-medium leading-[0.88]",
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
          </h2>

          <div className="mt-20 sm:mt-24 lg:mt-32">
            <a
              href="mailto:hello@ezprdct.com"
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
              hello@ezprdct.com
            </a>

            <div
              className="mt-7 flex flex-wrap items-center gap-2"
              onMouseLeave={() =>
                setActiveSocialIndex(null)
              }
            >
              {socialLinks.map((social, index) => {
                const isActive =
                  activeSocialIndex === index;

                return (
                  <motion.div
                    key={social.title}
                    animate={{
                      x: getSocialOffset(index),
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={{
                      duration: shouldReduceMotion
                        ? 0
                        : 0.9,
                      ease,
                    }}
                    onMouseEnter={() =>
                      setActiveSocialIndex(index)
                    }
                    onFocusCapture={() =>
                      setActiveSocialIndex(index)
                    }
                    onBlurCapture={() =>
                      setActiveSocialIndex(null)
                    }
                    className="relative"
                    style={{
                      zIndex: isActive ? 2 : 1,
                    }}
                  >
                    <GlassButton
                      href={social.href}
                      variant="quiet"
                      size="small"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {social.title}
                    </GlassButton>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right side */}
        <motion.div
          initial={
            shouldReduceMotion
              ? {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                  x: 18,
                  y: 14,
                  filter: "blur(4px)",
                }
          }
          whileInView={{
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.22,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.35,
            delay: shouldReduceMotion ? 0 : 0.16,
            ease,
          }}
          className={[
            "flex min-w-0 flex-col justify-center",
            "lg:-translate-y-5",
            "xl:-translate-y-7",
          ].join(" ")}
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="contact-form"
                initial={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={
                  shouldReduceMotion
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 0,
                        y: -14,
                        filter: "blur(6px)",
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.85,
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

                  <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-12 sm:grid-cols-2 sm:gap-8">
                    <div>
                      <label
                        htmlFor="phone"
                        className="text-sm text-[var(--color-text-secondary)]"
                      >
                        Phone
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        className={fieldClass}
                      />
                    </div>

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
                      "md:flex-row md:items-center md:justify-between",
                    ].join(" ")}
                  >
                    <p className="max-w-[440px] text-[13px] leading-[1.55] text-[var(--color-text-secondary)] sm:text-sm">
                      By sending this form, you agree that we may use
                      your information to reply to your request.
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
                        y: 20,
                        scale: 0.985,
                        filter: "blur(8px)",
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.25,
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
    </motion.section>
  );
}