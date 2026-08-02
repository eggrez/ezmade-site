"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  type MouseEvent,
  useRef,
  useState,
} from "react";

import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import ProjectImage from "@/components/media/ProjectImage";
import ProjectVideo from "@/components/media/ProjectVideo";
import Navbar from "@/components/navigation/Navbar";
import ProjectGallery from "@/components/projects/ProjectGallery";
import { useProjectTransition } from "@/components/transitions/ProjectTransitionProvider";
import type {
  ProjectGalleryItem,
  ProjectVideoItem,
} from "@/lib/project-media";
import type { Project } from "@/types/project";
import TransitionLink from "@/components/transitions/TransitionLink";

type ProjectPageViewProps = {
  project: Project;

  cover: string;
 videos: ProjectVideoItem[];

  gallery: string[];
  galleryItems: ProjectGalleryItem[];

  previousProject?: Project;
  previousProjectCover?: string;

  nextProject?: Project;
  nextProjectCover?: string;
};

type ProjectNavigationCardProps = {
  label: string;
  project: Project;
  cover: string;
  direction: "previous" | "next";
  shouldReduceMotion: boolean | null;
};


const ease = [0.22, 1, 0.36, 1] as const;
const projectIntroHidden = {
  opacity: 0,
  y: 18,
  filter: "blur(12px)",
};

const projectIntroVisible = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
};

export default function ProjectPageView({
  project,
  cover,
  videos,
  gallery,
  galleryItems,
  previousProject,
  previousProjectCover = "",
  nextProject,
  nextProjectCover = "",
}: ProjectPageViewProps) {
  const shouldReduceMotion =
    useReducedMotion();

    const { isTransitioning } =
  useProjectTransition();

  const [
    lightboxIndex,
    setLightboxIndex,
  ] = useState<number | null>(null);

 const revealInitial =
  shouldReduceMotion ||
  isTransitioning
    ? {
        opacity: 1,
        y: 0,
      }
    : {
        opacity: 0,
        y: 10,
      };

  const descriptionParagraphs =
  project.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

      const isYandexBrowser =
  project.slug === "yandex-browser";

  return (
    <main className="min-h-screen overflow-clip bg-white">
      <Navbar variant="project" />

      {/* Project title */}
      <section
       className={[
  "px-[clamp(24px,3vw,56px)]",
  "pb-8 pt-32",
  "sm:pb-10 sm:pt-36",
  "md:pb-12 md:pt-44",
].join(" ")}
      >
        <div className="mx-auto w-full max-w-[2200px]">
          <motion.div
  initial={
    shouldReduceMotion
      ? projectIntroVisible
      : projectIntroHidden
  }
  animate={
    shouldReduceMotion ||
    !isTransitioning
      ? projectIntroVisible
      : projectIntroHidden
  }
  transition={{
    duration: shouldReduceMotion
      ? 0
      : 1.25,
    delay:
      shouldReduceMotion ||
      isTransitioning
        ? 0
        : 0.08,
    ease,
  }}
>
            <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
              Selected project
            </p>

            <h1
              className={[
                "max-w-[1800px]",
                "text-[clamp(4rem,10vw,10rem)]",
                "font-medium leading-[0.84]",
                "tracking-[-0.08em]",
                "text-[var(--color-text)]",
              ].join(" ")}
            >
              {project.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Project videos */}
{videos.length > 0 && (
  <motion.section
    initial={
      shouldReduceMotion
        ? projectIntroVisible
        : projectIntroHidden
    }
    animate={
      shouldReduceMotion ||
      !isTransitioning
        ? projectIntroVisible
        : projectIntroHidden
    }
    transition={{
      duration:
        shouldReduceMotion ||
        isTransitioning
          ? 0
          : 1.3,
      ease,
    }}
    className={[
  "px-[clamp(24px,3vw,56px)]",
].join(" ")}
  >
    <div className="mx-auto w-full max-w-[2200px]">
      <div
        className={
          isYandexBrowser
            ? [
                "grid grid-cols-1",
                "gap-6",
                "md:grid-cols-2",
                "md:gap-8",
                "xl:gap-10",
              ].join(" ")
            : [
                "space-y-6",
                "md:space-y-8",
                "xl:space-y-10",
              ].join(" ")
        }
      >
        {videos.map((video, index) => {
          const isHeroVideo =
            isYandexBrowser &&
            index === 0;
 const isYandexBrowserGridVideo =
    isYandexBrowser && index > 0;
    
          return (
            <motion.div
              key={video.src}
              initial={
                index === 0
                  ? undefined
                  : shouldReduceMotion ||
                      isTransitioning
                    ? {
                        opacity: 1,
                        y: 0,
                      }
                    : {
                        opacity: 0,
                        y: 10,
                      }
              }
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.18,
              }}
              transition={{
                duration:
                  shouldReduceMotion ||
                  isTransitioning
                    ? 0
                    : 1.15,
                delay:
                  shouldReduceMotion ||
                  isTransitioning
                    ? 0
                    : index * 0.08,
                ease,
              }}
              className={
  isHeroVideo && isYandexBrowser
    ? "md:col-span-2"
    : ""
}
            >
              <motion.div
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
                    scale: 1,
                    y: 0,
                    boxShadow:
                      "0 0 0 rgba(17,17,17,0)",
                  },

                  hover: {
                    scale: 1.008,
                    y: 0,
                    boxShadow:
                      "0 24px 70px rgba(17,17,17,0.11)",
                  },
                }}
                transition={{
                  duration: 1.1,
                  ease,
                }}
                className={[
  "relative w-full",
  "overflow-hidden",
  "rounded-sm",
  "bg-neutral-200",

  isYandexBrowserGridVideo
    ? "aspect-video"
    : [
        "aspect-video",
        "xl:aspect-[21/9]",
      ].join(" "),
].join(" ")}
              >
                <ProjectVideo
  src={video.src}
  poster={video.poster || cover}
  title={
    video.label
      ? `${project.title} — ${video.label}`
      : videos.length > 1
        ? `${project.title} — Film ${index + 1}`
        : project.title
  }
  hideCenterPlay={
    isYandexBrowser && index > 0
  }
/>
                

                <motion.div
                  aria-hidden="true"
                  className={[
                    "pointer-events-none",
                    "absolute inset-[1px]",
                    "rounded-[1px]",
                    "border border-white/30",
                  ].join(" ")}
                  variants={{
                    rest: {
                      opacity: 0,
                    },

                    hover: {
                      opacity: 0.7,
                    },
                  }}
                  transition={{
                    duration: 0.8,
                    ease,
                  }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </motion.section>
)}

      {/* Project information */}
      <motion.section
        initial={revealInitial}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: shouldReduceMotion
            ? 0
            : 1.25,
          ease,
        }}
       className={[
  "flex items-center",
  "px-[clamp(24px,3vw,56px)]",
  "pt-16 pb-32",
  "md:py-44",
  "xl:py-56",
].join(" ")}
      >
        <div className="mx-auto w-full max-w-[2200px]">
          <div
            className={[
              "grid grid-cols-1",
              "gap-14",

              "lg:grid-cols-[240px_minmax(0,1fr)]",
              "lg:gap-[clamp(72px,8vw,180px)]",

              "xl:grid-cols-[280px_minmax(0,1fr)]",

              "2xl:grid-cols-[320px_minmax(0,1fr)]",
              "2xl:gap-[clamp(120px,9vw,220px)]",
            ].join(" ")}
          >
            {/* Client */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 0,
                      y: 12,
                    }
              }
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.5,
              }}
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : 1,
                ease,
              }}
              className="lg:pt-2"
            >
              <p className="text-sm text-[var(--color-text-secondary)]">
                Client
              </p>

              <p
  className={[
    "mt-4",
    "text-[clamp(1.35rem,1.7vw,2rem)]",
    "font-medium leading-[1.05]",
    "tracking-[-0.045em]",
    "text-[var(--color-text)]",
  ].join(" ")}
>
  {project.slug === "yandex-browser"
    ? "Yandex"
    : project.title}
</p>
            </motion.div>

            {/* Description */}
            <div
              className={[
                "w-full",
                "lg:max-w-[980px]",
                "xl:max-w-[1120px]",
                "2xl:max-w-[1320px]",
              ].join(" ")}
            >
              {descriptionParagraphs.map(
                (paragraph, index) => (
                  <motion.p
                    key={`${project.slug}-description-${index}`}
                    initial={
                      shouldReduceMotion
                        ? {
                            opacity: 1,
                            y: 0,
                            filter:
                              "blur(0px)",
                          }
                        : {
                            opacity: 0,
                            y: 16,
                            filter:
                              "blur(4px)",
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter:
                        "blur(0px)",
                    }}
                    viewport={{
                      once: true,
                      amount: 0.35,
                    }}
                    transition={{
                      duration:
                        shouldReduceMotion
                          ? 0
                          : 1.15,

                      delay:
                        shouldReduceMotion
                          ? 0
                          : index * 0.1,

                      ease,
                    }}
                    className={[
                      index > 0
                        ? "mt-8 md:mt-10 xl:mt-12"
                        : "",

                      "text-[1.35rem]",
                      "leading-[1.28]",
                      "sm:text-[1.5rem]",
                      "sm:leading-[1.24]",
                      "lg:text-[clamp(1.6rem,2.25vw,2.85rem)]",
                      "lg:leading-[1.18]",
                      "tracking-[-0.045em]",
                      "text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {paragraph}
                  </motion.p>
                ),
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Universal editorial gallery */}
      <ProjectGallery
        projectSlug={project.slug}
        projectTitle={project.title}
        items={galleryItems}
        onOpen={(index) => {
          setLightboxIndex(index);
        }}
      />

<motion.section
  initial={
    shouldReduceMotion
      ? projectIntroVisible
      : projectIntroHidden
  }
  animate={
    shouldReduceMotion ||
    !isTransitioning
      ? projectIntroVisible
      : projectIntroHidden
  }
  transition={{
    duration: shouldReduceMotion
      ? 0
      : 1.35,
    delay:
      shouldReduceMotion ||
      isTransitioning
        ? 0
        : 0.18,
    ease,
  }}
 className={[
  "px-[clamp(24px,3vw,56px)]",
  "pt-20",
  "pb-32",
  "md:pt-24",
  "md:pb-40",
  "xl:pt-28",
  "xl:pb-48",
].join(" ")}
>
  <div className="mx-auto flex w-full max-w-[2200px] justify-center">
    <TransitionLink
  href="/work"
  scroll
  className={[
    "group relative isolate",
    "inline-flex min-w-[240px]",
    "items-center justify-center",
    "overflow-hidden rounded-full",

    "border border-black/[0.10]",
    "bg-white/[0.24]",

    "px-10 py-3.5",
    "sm:min-w-[270px]",
    "sm:px-12 sm:py-4",

    "text-sm font-normal leading-none",
    "text-[var(--color-text)]",

    "shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_30px_rgba(17,17,17,0.04)]",
    "backdrop-blur-xl",

    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-[1800ms]",
    "ease-[cubic-bezier(0.16,1,0.3,1)]",
    "will-change-transform",

    "hover:scale-[1.018]",
    "hover:border-transparent",
    "hover:shadow-[0_14px_38px_rgba(17,17,17,0.14)]",

    "focus-visible:outline-none",
    "focus-visible:ring-1",
    "focus-visible:ring-black/20",
  ].join(" ")}
>
    
      {/* Dark hover fill */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none",
          "absolute inset-0 -z-20",
          "bg-black/[0.84]",
          "opacity-0",
          "transition-opacity duration-700",
          "group-hover:opacity-100",
          "group-focus-visible:opacity-100",
        ].join(" ")}
      />

      {/* Reflection */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none",
          "absolute",
          "-left-[45%]",
          "top-[-130%]",
          "-z-10",
          "h-[360%]",
          "w-[72%]",
          "rotate-[22deg]",
          "bg-gradient-to-r",
          "from-transparent",
          "via-white/45",
          "to-transparent",
          "blur-md",
          "transition-transform",
          "duration-[2200ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:translate-x-[240%]",
          "group-focus-visible:translate-x-[240%]",
        ].join(" ")}
      />

      <span
        className={[
          "relative z-10",
          "transition-colors duration-700",
          "group-hover:text-white",
          "group-focus-visible:text-white",
        ].join(" ")}
      >
        Back to All Projects
      </span>
    </TransitionLink>
  </div>
</motion.section>

    

     {/* Previous / next */}
{(previousProject || nextProject) && (
  <section
    className={[
      "border-t border-[var(--color-border)]",
      "px-[clamp(24px,3vw,56px)]",
      "py-24",
      "md:py-32",
      "xl:py-40",
      "2xl:py-44",
    ].join(" ")}
  >
    <div className="mx-auto w-full max-w-[2200px]">
      <div
        className={[
          "grid grid-cols-1",
          "gap-20",
          "lg:grid-cols-2",
          "lg:gap-10",
          "2xl:gap-14",
        ].join(" ")}
      >
        {previousProject && (
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
                    y: 34,
                    filter: "blur(9px)",
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
              amount: 0.22,
            }}
            transition={{
              duration: shouldReduceMotion
                ? 0
                : 1.25,
              delay: 0,
              ease,
            }}
          >
            <ProjectNavigationCard
              label="Previous project"
              project={previousProject}
              cover={previousProjectCover}
              direction="previous"
              shouldReduceMotion={shouldReduceMotion}
            />
          </motion.div>
        )}

        {nextProject && (
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
                    y: 34,
                    filter: "blur(9px)",
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
              amount: 0.22,
            }}
            transition={{
              duration: shouldReduceMotion
                ? 0
                : 1.25,
              delay: shouldReduceMotion
                ? 0
                : 0.18,
              ease,
            }}
          >
            <ProjectNavigationCard
              label="Next project"
              project={nextProject}
              cover={nextProjectCover}
              direction="next"
              shouldReduceMotion={shouldReduceMotion}
            />
          </motion.div>
        )}
      </div>
    </div>
  </section>
)}

      <GalleryLightbox
        images={gallery}
        initialIndex={lightboxIndex}
        title={project.title}
        onClose={() => {
          setLightboxIndex(null);
        }}
      />
    </main>
  );
}

function ProjectNavigationCard({
  label,
  project,
  cover,
  direction,
  shouldReduceMotion,
}: ProjectNavigationCardProps) {
  const isPrevious =
    direction === "previous";

  const imageRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const {
    isTransitioning,
    startProjectNavigation,
  } = useProjectTransition();

  const href =
    `/projects/${project.slug}`;

    const allowHover =
  !shouldReduceMotion;

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

    const imageElement =
      imageRef.current;

    if (!imageElement) {
      window.location.assign(href);
      return;
    }

    const renderedImage =
  imageElement.querySelector<HTMLImageElement>(
    "img",
  );

startProjectNavigation({
  slug: project.slug,
  image:
    renderedImage?.currentSrc ||
    renderedImage?.src ||
    cover,
  title: project.title,
  rect:
    imageElement.getBoundingClientRect(),
});
  }

  return (
    <Link
      href={href}
      onClickCapture={handleClick}
      aria-disabled={isTransitioning}
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
            scale: 1.006,
          },
        }}
        transition={{
          duration: 0.95,
          ease,
        }}
        className="relative"
      >
        {/* Image */}
        <div
          ref={imageRef}
          className={[
            "relative",
            "aspect-[16/10]",
            "overflow-hidden rounded-sm",
            "bg-neutral-200",

            "md:aspect-[16/9]",
            "2xl:aspect-[2/1]",
          ].join(" ")}
        >
          <motion.div
            className="absolute inset-0"
            variants={{
              rest: {
                scale: 1,
              },

              hover: {
                scale: 1.045,
              },
            }}
            transition={{
              duration: 1.45,
              ease,
            }}
          >
            <ProjectImage
              src={cover}
              alt={`${project.title} preview`}
              sizes="(max-width: 1023px) 100vw, 50vw"
            />
          </motion.div>

          {/* Soft tonal shift */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black"
            variants={{
              rest: {
                opacity: 0,
              },

              hover: {
                opacity: 0.055,
              },
            }}
            transition={{
              duration: 0.9,
              ease,
            }}
          />

          {/* Main image reflection */}
          <motion.div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute",
              "-left-[65%] top-[-85%]",
              "h-[280%] w-[40%]",
              "rotate-[18deg]",

              "bg-gradient-to-r",
              "from-transparent",
              "via-white/40",
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
                  0.58,
                  0.34,
                  0,
                ],
              },
            }}
            transition={{
              x: {
                duration: 3,
                ease,
              },

              opacity: {
                duration: 3,
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

         

          {/* Fine image edge */}
          <motion.div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute",
              "inset-[1px]",
              "rounded-[1px]",
              "border border-white/30",
            ].join(" ")}
            variants={{
              rest: {
                opacity: 0,
              },

              hover: {
                opacity: 0.65,
              },
            }}
            transition={{
              duration: 0.9,
              ease,
            }}
          />
        </div>

        {/* Information */}
       <div
  className={[
    "mt-7 flex",
    "items-end",
    "gap-6",

            isPrevious
              ? "text-left"
              : "lg:flex-row-reverse lg:text-right",
          ].join(" ")}
        >
          <div
            className={[
              "flex min-w-0 flex-col",

              isPrevious
                ? "items-start"
                : "items-start lg:items-end",
            ].join(" ")}
          >
            <p className="text-sm text-[var(--color-text-secondary)]">
              {label}
            </p>

            <motion.h2
              variants={{
                rest: {
                  x: 0,
                },

                hover: {
                  x: isPrevious
                    ? -7
                    : 7,
                },
              }}
              transition={{
                duration: 0.9,
                ease,
              }}
              className={[
                "mt-4",
                "text-[clamp(2.4rem,4.5vw,5.25rem)]",
                "font-medium leading-[0.9]",
                "tracking-[-0.065em]",
                "text-[var(--color-text)]",
              ].join(" ")}
            >
              {project.title}
            </motion.h2>
          </div>

         
        </div>
      </motion.article>
    </Link>
  );
}