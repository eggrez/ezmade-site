"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import ProjectImage from "@/components/media/ProjectImage";
import type { ProjectGalleryItem } from "@/lib/project-media";

type ProjectGalleryProps = {
  projectSlug: string;
  projectTitle: string;
  items: ProjectGalleryItem[];
  onOpen: (index: number) => void;
};

type GalleryRow =
  | {
      type: "wide";
      item: ProjectGalleryItem;
      index: number;
    }
  | {
      type: "pair";
      items: Array<{
        item: ProjectGalleryItem;
        index: number;
      }>;
    };

type GalleryFrameProps = {
  src: string;
  alt: string;
  layout: "wide" | "half";
  onOpen: () => void;
  shouldReduceMotion: boolean | null;
};

const ease = [0.22, 1, 0.36, 1] as const;

function createGalleryRows(
  items: ProjectGalleryItem[],
): GalleryRow[] {
  const rows: GalleryRow[] = [];

  let index = 0;

  while (index < items.length) {
    const item = items[index];

    if (!item) {
      break;
    }

    if (item.layout === "wide") {
      rows.push({
        type: "wide",
        item,
        index,
      });

      index += 1;
      continue;
    }

    const pair: Array<{
      item: ProjectGalleryItem;
      index: number;
    }> = [
      {
        item,
        index,
      },
    ];

    const nextItem =
      items[index + 1];

    if (
      nextItem?.layout === "half"
    ) {
      pair.push({
        item: nextItem,
        index: index + 1,
      });

      index += 2;
    } else {
      index += 1;
    }

    rows.push({
      type: "pair",
      items: pair,
    });
  }

  return rows;
}

export default function ProjectGallery({
  projectSlug,
  projectTitle,
  items,
  onOpen,
}: ProjectGalleryProps) {
  const shouldReduceMotion =
    useReducedMotion();

  const rows =
    createGalleryRows(items);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="px-[clamp(24px,3vw,56px)]">
      <div className="mx-auto w-full max-w-[2200px]">
        <div className="space-y-6 md:space-y-8 xl:space-y-10">
          {rows.map(
            (row, rowIndex) => {
              if (
                row.type === "wide"
              ) {
                return (
                  <GalleryFrame
                    key={`${projectSlug}-wide-${row.index}`}
                    src={row.item.src}
                    alt={`${projectTitle} frame ${
                      row.index + 1
                    }`}
                    layout="wide"
                    shouldReduceMotion={
                      shouldReduceMotion
                    }
                    onOpen={() => {
                      onOpen(row.index);
                    }}
                  />
                );
              }

              return (
                <div
                  key={`${projectSlug}-pair-${rowIndex}`}
                  className={[
                    "grid grid-cols-1",
                    "gap-6",
                    "md:grid-cols-2",
                    "md:gap-8",
                    "xl:gap-10",
                  ].join(" ")}
                >
                  {row.items.map(
                    ({
                      item,
                      index,
                    }) => (
                      <GalleryFrame
                        key={`${projectSlug}-half-${index}`}
                        src={item.src}
                        alt={`${projectTitle} frame ${
                          index + 1
                        }`}
                        layout="half"
                        shouldReduceMotion={
                          shouldReduceMotion
                        }
                        onOpen={() => {
                          onOpen(index);
                        }}
                      />
                    ),
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

function GalleryFrame({
  src,
  alt,
  layout,
  onOpen,
  shouldReduceMotion,
}: GalleryFrameProps) {
  const ratioClass =
    layout === "wide"
      ? "aspect-[16/9] xl:aspect-[21/9]"
      : "aspect-[16/10]";

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter:
                "blur(0px)",
            }
          : {
              opacity: 0,
              y: 20,
              scale: 0.994,
              filter:
                "blur(4px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter:
          "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration:
          shouldReduceMotion
            ? 0
            : 1.2,
        ease,
      }}
      className={ratioClass}
    >
      <motion.button
        type="button"
        aria-label={`Open ${alt}`}
        onClick={onOpen}
        initial="rest"
        animate="rest"
        whileHover={
          shouldReduceMotion
            ? "rest"
            : "hover"
        }
        whileFocus={
          shouldReduceMotion
            ? "rest"
            : "hover"
        }
        variants={{
          rest: {
            y: 0,
            scale: 1,
            boxShadow:
              "0 0 0 rgba(17,17,17,0)",
          },

          hover: {
            y: -3,
            scale: 1.004,
            boxShadow:
              "0 20px 55px rgba(17,17,17,0.10)",
          },
        }}
        transition={{
          duration: 0.9,
          ease,
        }}
        className={[
          "group/frame relative",
          "h-full w-full",
          "cursor-zoom-in",
          "overflow-hidden rounded-sm",
          "bg-neutral-200",
          "text-left",

          "focus-visible:outline-none",
          "focus-visible:ring-1",
          "focus-visible:ring-black/30",
          "focus-visible:ring-offset-4",
          "focus-visible:ring-offset-[var(--color-bg)]",
        ].join(" ")}
      >
        {/* Image */}
        <motion.div
          className="absolute inset-0"
          variants={{
            rest: {
              scale: 1,
            },

            hover: {
              scale: 1.025,
            },
          }}
          transition={{
            duration: 1.15,
            ease,
          }}
          style={{
            filter: "none",
            opacity: 1,
            mixBlendMode: "normal",
          }}
        >
          <ProjectImage
  src={src}
  alt={alt}
  sizes={
    layout === "wide"
      ? "(max-width: 2247px) calc(100vw - clamp(48px, 6vw, 112px)), 2200px"
      : "(max-width: 767px) calc(100vw - 48px), (max-width: 2247px) calc((100vw - clamp(48px, 6vw, 112px) - 32px) / 2), 1080px"
  }
/>
        </motion.div>

        {/* Delicate tonal shift */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          variants={{
            rest: {
              opacity: 0,
            },

            hover: {
              opacity: 0.025,
            },
          }}
          transition={{
            duration: 0.9,
            ease,
          }}
        />

        {/* Polished highlight */}
        <motion.div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute",
            "-left-[62%] top-[-85%]",
            "h-[280%] w-[38%]",
            "rotate-[18deg]",

            "bg-gradient-to-r",
            "from-transparent",
            "via-white/34",
            "to-transparent",

            "blur-2xl",
            "mix-blend-screen",
          ].join(" ")}
          variants={{
            rest: {
              x: "-20%",
              opacity: 0,
            },

            hover: {
              x: "450%",
              opacity: [
                0,
                0.5,
                0.28,
                0,
              ],
            },
          }}
          transition={{
            x: {
              duration: 3.2,
              ease,
            },

            opacity: {
              duration: 3.2,
              times: [
                0,
                0.12,
                0.84,
                1,
              ],
              ease,
            },
          }}
        />

        {/* Open indicator */}
        <motion.div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute",
            "bottom-5 right-5",
            "flex h-11 w-11",
            "items-center justify-center",
            "overflow-hidden rounded-full",

            "border border-white/25",
            "bg-black/25",
            "text-white",

            "shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_30px_rgba(0,0,0,0.18)]",
            "backdrop-blur-xl",
          ].join(" ")}
          variants={{
            rest: {
              opacity: 0,
              scale: 0.88,
              y: 7,
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
        >
          <ExpandIcon className="h-[18px] w-[18px]" />
        </motion.div>

        {/* Delicate internal edge */}
        <motion.div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute",
            "inset-[1px]",
            "rounded-[1px]",
            "border border-white/25",
          ].join(" ")}
          variants={{
            rest: {
              opacity: 0,
            },

            hover: {
              opacity: 0.5,
            },
          }}
          transition={{
            duration: 0.75,
            ease,
          }}
        />
      </motion.button>
    </motion.div>
  );
}

function ExpandIcon({
  className = "",
}: {
  className?: string;
}) {
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
      <path d="M9 5H5v4" />
      <path d="M5 5l5 5" />

      <path d="M15 5h4v4" />
      <path d="M19 5l-5 5" />

      <path d="M9 19H5v-4" />
      <path d="M5 19l5-5" />

      <path d="M15 19h4v-4" />
      <path d="M19 19l-5-5" />
    </svg>
  );
}