"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  type MouseEvent,
  type RefObject,
  useRef,
} from "react";

import ProjectImage from "@/components/media/ProjectImage";
import { useProjectTransition } from "@/components/transitions/ProjectTransitionProvider";
import { getProjectCover } from "@/lib/project-media";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
  variant?: "default" | "editorial";
  index?: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function ProjectCard({
  project,
  variant = "default",
  index = 0,
}: ProjectCardProps) {
  const shouldReduceMotion =
    useReducedMotion();

  const cardRef =
    useRef<HTMLAnchorElement | null>(
      null,
    );

  const {
    isTransitioning,
    startProjectTransition,
  } = useProjectTransition();

  /*
   * Не связываем hover с isTransitioning.
   *
   * Иначе при клике isTransitioning станет true,
   * карточка мгновенно вернётся из hover в rest,
   * что будет выглядеть как мигание.
   */
  const allowHover =
    !shouldReduceMotion;

  const cover = project.hasMedia
    ? getProjectCover(project.slug)
    : "";

  const href =
    `/projects/${project.slug}`;

  const isEditorial =
    variant === "editorial";

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;

    if (isModifiedClick) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (isTransitioning) {
      return;
    }

    const card = cardRef.current;

    if (!card) {
      window.location.assign(href);
      return;
    }

    const renderedImage =
      card.querySelector<HTMLImageElement>(
        "img",
      );

    const rect =
      card.getBoundingClientRect();

    startProjectTransition({
      slug: project.slug,
      image:
        renderedImage?.currentSrc ||
        renderedImage?.src ||
        cover,
      title: project.title,
      rect,
    });
  }

  if (isEditorial) {
    return (
      <EditorialProjectCard
        project={project}
        cover={cover}
        href={href}
        index={index}
        cardRef={cardRef}
        allowHover={allowHover}
        isTransitioning={
          isTransitioning
        }
        shouldReduceMotion={
          shouldReduceMotion
        }
        onClick={handleClick}
      />
    );
  }

  return (
    <a
      ref={cardRef}
      data-project-slug={
        project.slug
      }
      href={href}
      onClickCapture={handleClick}
      className={[
        "group block",
        "focus-visible:outline-none",
        isTransitioning
          ? "pointer-events-none"
          : "",
      ].join(" ")}
    >
      <motion.article
        initial="rest"
        animate="rest"
        whileHover={
          allowHover
            ? "hover"
            : "rest"
        }
        whileFocus={
          allowHover
            ? "hover"
            : "rest"
        }
        variants={{
          rest: {
            scale: 1,
          },
          hover: {
            scale: 1.008,
          },
        }}
        transition={{
          duration: 0.9,
          ease,
        }}
        className={[
          "relative aspect-[16/10]",
          "overflow-hidden rounded-sm",
          "bg-neutral-200",

          "shadow-[0_0_0_rgba(17,17,17,0)]",
          "transition-shadow duration-1000",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",

          !isTransitioning
            ? "group-hover:shadow-[0_18px_55px_rgba(17,17,17,0.10)]"
            : "",

          "group-focus-visible:ring-1",
          "group-focus-visible:ring-black/25",
          "group-focus-visible:ring-offset-4",
          "group-focus-visible:ring-offset-[var(--color-bg)]",
        ].join(" ")}
      >
        <ProjectImageLayer
          cover={cover}
          title={project.title}
          imageScale={1.035}
          priority={index === 0}
        />

        <CardEffects />

        <ProjectCardInformation
          project={project}
        />

        <InternalEdge />
      </motion.article>
    </a>
  );
}

type EditorialProjectCardProps = {
  project: Project;
  cover: string;
  href: string;
  index: number;

  cardRef:
    RefObject<HTMLAnchorElement | null>;

  allowHover: boolean;
  isTransitioning: boolean;

  shouldReduceMotion:
    | boolean
    | null;

  onClick: (
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
};

function EditorialProjectCard({
  project,
  cover,
  href,
  index,
  cardRef,
  allowHover,
  isTransitioning,
  shouldReduceMotion,
  onClick,
}: EditorialProjectCardProps) {
  const isEven =
    index % 2 === 0;

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }
          : {
              opacity: 0,
              y: 40,
              filter: "blur(7px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.14,
      }}
      transition={{
        duration:
          shouldReduceMotion
            ? 0
            : 1.25,

        delay:
          shouldReduceMotion
            ? 0
            : Math.min(
                index * 0.04,
                0.2,
              ),

        ease,
      }}
      className={[
        "w-full",

        isEven
          ? "lg:pr-[8vw]"
          : "lg:pl-[8vw]",

        index % 3 === 2
          ? "xl:px-[5vw]"
          : "",
      ].join(" ")}
    >
      <a
        ref={cardRef}
        data-project-slug={
          project.slug
        }
        href={href}
        onClickCapture={onClick}
        className={[
          "group block",
          "focus-visible:outline-none",

          isTransitioning
            ? "pointer-events-none"
            : "",
        ].join(" ")}
      >
        <motion.article
          initial="rest"
          animate="rest"
          whileHover={
            allowHover
              ? "hover"
              : "rest"
          }
          whileFocus={
            allowHover
              ? "hover"
              : "rest"
          }
          variants={{
            rest: {
              y: 0,
              scale: 1,
            },

            hover: {
              y: -5,
              scale: 1.003,
            },
          }}
          transition={{
            duration: 0.95,
            ease,
          }}
        >
          <div
            className={[
              "mb-5 flex items-end",
              "justify-between gap-6",
              "md:mb-7",
            ].join(" ")}
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] md:text-xs">
                {String(
                  index + 1,
                ).padStart(
                  2,
                  "0",
                )}
              </p>

              <motion.h2
                variants={{
                  rest: {
                    x: 0,
                  },

                  hover: {
                    x: isEven
                      ? 8
                      : -8,
                  },
                }}
                transition={{
                  duration: 0.9,
                  ease,
                }}
                className={[
                  "mt-3",
                  "text-[clamp(2.4rem,5vw,6.5rem)]",
                  "font-medium leading-[0.88]",
                  "tracking-[-0.07em]",
                  "text-[var(--color-text)]",
                ].join(" ")}
              >
                {project.title}
              </motion.h2>
            </div>

            <div className="hidden max-w-[300px] text-right md:block">
              <p className="text-sm leading-[1.4] text-[var(--color-text-secondary)]">
                {project.services.join(
                  " · ",
                )}
              </p>

              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {project.category}

                <span className="mx-2 opacity-40">
                  /
                </span>

                {project.year}
              </p>
            </div>
          </div>

          <motion.div
            variants={{
              rest: {
                boxShadow:
                  "0 0 0 rgba(17,17,17,0)",
              },

              hover: {
                boxShadow:
                  "0 30px 90px rgba(17,17,17,0.12)",
              },
            }}
            transition={{
              duration: 1,
              ease,
            }}
            className={[
              "relative",
              "aspect-[16/10]",
              "overflow-hidden",
              "rounded-sm",
              "bg-neutral-200",

              "md:aspect-[16/9]",
              "xl:aspect-[2/1]",
            ].join(" ")}
          >
            <ProjectImageLayer
              cover={cover}
              title={project.title}
              imageScale={1.045}
              priority={index === 0}
            />

            <CardEffects />

            <motion.div
              aria-hidden="true"
              variants={{
                rest: {
                  opacity: 0,
                  scale: 0.88,
                  y: 8,
                },

                hover: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                },
              }}
              transition={{
                duration: 0.65,
                ease,
              }}
              className={[
                "pointer-events-none",
                "absolute bottom-5 right-5",
                "flex h-12 w-12",
                "items-center justify-center",
                "overflow-hidden rounded-full",

                "border border-white/25",
                "bg-black/25",
                "text-white",

                "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_36px_rgba(0,0,0,0.20)]",
                "backdrop-blur-xl",

                "md:bottom-7 md:right-7",
                "md:h-14 md:w-14",
              ].join(" ")}
            >
              <OpenIcon className="h-5 w-5" />
            </motion.div>

            <InternalEdge />
          </motion.div>

          <div className="mt-5 md:hidden">
            <p className="text-sm leading-[1.45] text-[var(--color-text-secondary)]">
              {project.services.join(
                " · ",
              )}
            </p>

            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              {project.category}

              <span className="mx-2 opacity-40">
                /
              </span>

              {project.year}
            </p>
          </div>
        </motion.article>
      </a>
    </motion.div>
  );
}

type ProjectImageLayerProps = {
  cover: string;
  title: string;
  imageScale: number;
  priority?: boolean;
};

function ProjectImageLayer({
  cover,
  title,
  imageScale,
  priority = false,
}: ProjectImageLayerProps) {
  return (
    <motion.div
      className="absolute inset-0"
      variants={{
        rest: {
          scale: 1,
        },

        hover: {
          scale: imageScale,
        },
      }}
      transition={{
        duration: 1.4,
        ease,
      }}
    >
      <ProjectImage
        src={cover}
        alt={title}
        priority={priority}
        className="h-full w-full object-cover"
        sizes="
          (max-width: 767px) calc(100vw - 48px),
          (max-width: 1535px) 50vw,
          1100px
        "
      />
    </motion.div>
  );
}

function CardEffects() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black"
        variants={{
          rest: {
            opacity: 0,
          },

          hover: {
            opacity: 0.07,
          },
        }}
        transition={{
          duration: 0.9,
          ease,
        }}
      />

      <motion.div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-left-[65%] top-[-75%]",
          "h-[260%] w-[42%]",
          "rotate-[18deg]",

          "bg-gradient-to-r",
          "from-transparent",
          "via-white/45",
          "to-transparent",

          "blur-xl",
          "mix-blend-screen",
        ].join(" ")}
        variants={{
          rest: {
            x: "-20%",
            opacity: 0,
          },

          hover: {
            x: "430%",
            opacity: [
              0,
              0.7,
              0.5,
              0,
            ],
          },
        }}
        transition={{
          x: {
            duration: 2.8,
            ease,
          },

          opacity: {
            duration: 2.8,
            times: [
              0,
              0.12,
              0.82,
              1,
            ],
            ease,
          },
        }}
      />
    </>
  );
}

type ProjectCardInformationProps = {
  project: Project;
};

function ProjectCardInformation({
  project,
}: ProjectCardInformationProps) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className={[
          "pointer-events-none",
          "absolute inset-0",
          "bg-gradient-to-t",
          "from-black/80",
          "via-black/12",
          "to-transparent",
        ].join(" ")}
        variants={{
          rest: {
            opacity: 0.55,
          },

          hover: {
            opacity: 0.9,
          },
        }}
        transition={{
          duration: 0.9,
          ease,
        }}
      />

      <motion.div
        className={[
          "pointer-events-none",
          "absolute inset-x-5 bottom-7",
          "md:inset-x-6 md:bottom-9",
        ].join(" ")}
        variants={{
          rest: {
            opacity: 0.92,
            y: 4,
          },

          hover: {
            opacity: 1,
            y: 0,
          },
        }}
        transition={{
          duration: 0.7,
          ease,
        }}
      >
        <motion.p
          variants={{
            rest: {
              opacity: 0.9,
            },

            hover: {
              opacity: 1,
            },
          }}
          transition={{
            duration: 0.45,
            ease,
          }}
          className={[
            "text-[clamp(1.35rem,1.8vw,2.15rem)]",
            "font-normal leading-none",
            "tracking-[-0.045em]",
            "text-white",
          ].join(" ")}
        >
          {project.title}
        </motion.p>

        <motion.p
          variants={{
            rest: {
              opacity: 0.62,
            },

            hover: {
              opacity: 0.82,
            },
          }}
          transition={{
            duration: 0.45,
            ease,
          }}
          className={[
            "mt-3",
            "text-[12px]",
            "leading-[1.4]",
            "tracking-[-0.01em]",
            "text-white",
            "md:text-[13px]",
          ].join(" ")}
        >
          {project.services.join(" · ")}
        </motion.p>
      </motion.div>
    </>
  );
}

function InternalEdge() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-[1px] rounded-[1px] border border-white/30"
      variants={{
        rest: {
          opacity: 0,
        },

        hover: {
          opacity: 0.7,
        },
      }}
      transition={{
        duration: 0.9,
        ease,
      }}
    />
  );
}

type IconProps = {
  className?: string;
};

function OpenIcon({
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
      <path d="M8 5H5v3" />
      <path d="m5 5 5 5" />

      <path d="M16 5h3v3" />
      <path d="m19 5-5 5" />

      <path d="M8 19H5v-3" />
      <path d="m5 19 5-5" />

      <path d="M16 19h3v-3" />
      <path d="m19 19-5-5" />
    </svg>
  );
}