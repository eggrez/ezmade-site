"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useMemo,
  useState,
} from "react";

import ProjectCard from "@/components/projects/ProjectCard";
import type { Project } from "@/types/project";

type WorkPortfolioProps = {
  projects: Project[];
};

type FilterId =
  | "all"
  | "direction"
  | "color-grading"
  | "editing"
  | "sound-design"
  | "3d";

type WorkFilter = {
  id: FilterId;
  label: string;
  matches: (
    project: Project,
  ) => boolean;
};

type FilterMotion = {
  x: number;
  scale: number;
  opacity: number;
};

const ease = [
  0.22,
  1,
  0.36,
  1,
] as const;

const filters: WorkFilter[] = [
  {
    id: "all",
    label: "All",
    matches: () => true,
  },
  {
    id: "direction",
    label: "Direction",
    matches: (project) =>
      project.services.includes(
        "Direction",
      ),
  },
  {
    id: "color-grading",
    label: "Color Grading",
    matches: (project) =>
      project.services.includes(
        "Color Grading",
      ),
  },
  {
    id: "editing",
    label: "Editing",
    matches: (project) =>
      project.services.includes(
        "Editing",
      ),
  },
  {
    id: "sound-design",
    label: "Sound Design",
    matches: (project) =>
      project.services.includes(
        "Sound Design",
      ),
  },
  {
    id: "3d",
    label: "3D",
    matches: (project) =>
      project.services.includes(
        "3D",
      ),
  },
];

function shuffleProjects(
  projects: Project[],
  previousFirstSlug?: string,
): Project[] {
  const shuffled = [...projects];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  /*
   * Чистый random иногда оставляет ту же
   * первую карточку. Если в категории есть
   * другой проект, гарантированно меняем её,
   * не затрагивая исходный порядок All.
   */
  if (
    shuffled.length > 1 &&
    previousFirstSlug &&
    shuffled[0]?.slug === previousFirstSlug
  ) {
    const replacementIndex =
      shuffled.findIndex(
        (project) =>
          project.slug !==
          previousFirstSlug,
      );

    if (replacementIndex > 0) {
      [
        shuffled[0],
        shuffled[replacementIndex],
      ] = [
        shuffled[replacementIndex],
        shuffled[0],
      ];
    }
  }

  return shuffled;
}

function getFilterMotion(
  index: number,
  hoveredIndex: number | null,
): FilterMotion {
  if (hoveredIndex === null) {
    return {
      x: 0,
      scale: 1,
      opacity: 1,
    };
  }

  if (index === hoveredIndex) {
    return {
      x: 0,
      scale: 1.075,
      opacity: 1,
    };
  }

  const distance =
    Math.abs(
      index - hoveredIndex,
    );

  const direction =
    index < hoveredIndex
      ? -1
      : 1;

  const baseOffset =
    distance === 1
      ? 12
      : distance === 2
        ? 7
        : 3;

  return {
    x:
      direction *
      baseOffset,
    scale: 1,
    opacity:
      distance === 1
        ? 0.86
        : 0.72,
  };
}

export default function WorkPortfolio({
  projects,
}: WorkPortfolioProps) {
  const shouldReduceMotion =
    useReducedMotion();

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<FilterId>("all");

  const [
    hoveredFilterIndex,
    setHoveredFilterIndex,
  ] = useState<
    number | null
  >(null);

  const [
    projectOrder,
    setProjectOrder,
  ] = useState<string[] | null>(
    null,
  );

  const [
    gridRevision,
    setGridRevision,
  ] = useState(0);

  const visibleProjects =
    useMemo(() => {
      const selectedFilter =
        filters.find(
          (filter) =>
            filter.id ===
            activeFilter,
        );

      if (!selectedFilter) {
        return projects;
      }

      const filteredProjects =
        projects.filter(
        selectedFilter.matches,
      );

      if (!projectOrder) {
        return filteredProjects;
      }

      const orderBySlug = new Map(
        projectOrder.map(
          (slug, index) => [
            slug,
            index,
          ],
        ),
      );

      return [
        ...filteredProjects,
      ].sort(
        (firstProject, secondProject) =>
          (orderBySlug.get(
            firstProject.slug,
          ) ??
            Number.MAX_SAFE_INTEGER) -
          (orderBySlug.get(
            secondProject.slug,
          ) ??
            Number.MAX_SAFE_INTEGER),
      );
    }, [
      activeFilter,
      projectOrder,
      projects,
    ]);

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }
          : {
              opacity: 0,
              filter: "blur(22px)",
              scale: 1.006,
            }
      }
      animate={
        shouldReduceMotion
          ? {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }
          : {
              opacity: [0, 0.56, 1],
              filter: [
                "blur(22px)",
                "blur(7px)",
                "blur(0px)",
              ],
              scale: [1.006, 1.002, 1],
            }
      }
      transition={
        shouldReduceMotion
          ? {
              duration: 0,
            }
          : {
              duration: 1.35,
              ease,
              times: [0, 0.52, 1],
            }
      }
    >
      {/* Hero and filters */}
      <section
        className={[
          "px-[clamp(24px,3vw,56px)]",
          "pb-20 pt-36",
          "sm:pb-24 sm:pt-40",
          "md:pb-28 md:pt-48",
          "xl:pb-36 xl:pt-56",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-[2200px]">
          <motion.h1
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
                    y: 22,
                    scale: 0.992,
                    filter:
                      "blur(6px)",
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter:
                "blur(0px)",
            }}
            transition={{
              duration:
                shouldReduceMotion
                  ? 0
                  : 1.35,
              ease,
            }}
            className={[
              "mx-auto",
              "max-w-[1800px]",
              "text-center",
              "text-[clamp(3.5rem,8vw,10rem)]",
              "font-medium leading-[0.86]",
              "tracking-[-0.078em]",
              "text-[var(--color-text)]",
            ].join(" ")}
          >
            What are you looking for?
          </motion.h1>

          <motion.div
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
                    y: 14,
                    filter:
                      "blur(4px)",
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              filter:
                "blur(0px)",
            }}
            transition={{
              duration:
                shouldReduceMotion
                  ? 0
                  : 1.1,
              delay:
                shouldReduceMotion
                  ? 0
                  : 0.18,
              ease,
            }}
            className="mt-[clamp(56px,7vw,104px)]"
          >
            <div
              className={[
                "-mx-[clamp(24px,3vw,56px)]",
                "overflow-x-auto",
                "px-[clamp(24px,3vw,56px)]",
                "pb-4",
                "[scrollbar-width:none]",
                "[&::-webkit-scrollbar]:hidden",
              ].join(" ")}
            >
              <div
                role="tablist"
                aria-label="Project disciplines"
                onMouseLeave={() => {
                  setHoveredFilterIndex(
                    null,
                  );
                }}
                className={[
                  "mx-auto flex min-w-max",
                  "items-center justify-center",
                  "gap-7",
                  "sm:gap-9",
                  "md:gap-11",
                  "xl:gap-14",
                ].join(" ")}
              >
                {filters.map(
                  (
                    filter,
                    index,
                  ) => {
                    const isActive =
                      activeFilter ===
                      filter.id;

                    const filterMotion =
                      getFilterMotion(
                        index,
                        hoveredFilterIndex,
                      );

                    return (
                      <motion.button
                        key={
                          filter.id
                        }
                        type="button"
                        role="tab"
                        aria-selected={
                          isActive
                        }
                        onClick={() => {
                          if (
                            filter.id ===
                            "all"
                          ) {
                            setProjectOrder(
                              null,
                            );

                            setActiveFilter(
                              filter.id,
                            );

                            setGridRevision(
                              (revision) =>
                                revision + 1,
                            );

                            return;
                          }

                          const matchingProjects =
                            projects.filter(
                              filter.matches,
                            );

                          const shuffledProjects =
                            shuffleProjects(
                              matchingProjects,
                              visibleProjects[0]
                                ?.slug,
                            );

                          setProjectOrder(
                            shuffledProjects.map(
                              (project) =>
                                project.slug,
                            ),
                          );

                          setActiveFilter(
                            filter.id,
                          );

                          setGridRevision(
                            (revision) =>
                              revision + 1,
                          );
                        }}
                        onMouseEnter={() => {
                          setHoveredFilterIndex(
                            index,
                          );
                        }}
                        onFocus={() => {
                          setHoveredFilterIndex(
                            index,
                          );
                        }}
                        onBlur={() => {
                          setHoveredFilterIndex(
                            null,
                          );
                        }}
                        initial={false}
                        animate={
                          shouldReduceMotion
                            ? {
                                x: 0,
                                scale: 1,
                                opacity: 1,
                              }
                            : {
                                x:
                                  filterMotion.x,
                                scale:
                                  filterMotion.scale,
                                opacity:
                                  filterMotion.opacity,
                              }
                        }
                        transition={{
                          duration:
                            shouldReduceMotion
                              ? 0
                              : 0.9,
                          ease,
                        }}
                        className={[
                          "group/filter relative isolate",
                          "overflow-hidden",
                          "py-2",
                          "text-[15px]",
                          "font-normal leading-none",
                          "tracking-[-0.025em]",
                          "sm:text-base",
                          "md:text-[17px]",

                          "transition-colors",
                          "duration-700",
                          "ease-[cubic-bezier(0.22,1,0.36,1)]",

                          isActive
                            ? "text-[var(--color-text)]"
                            : [
                                "text-[var(--color-text-secondary)]",
                                "hover:text-[var(--color-text)]",
                                "focus-visible:text-[var(--color-text)]",
                              ].join(
                                " ",
                              ),

                          "focus-visible:outline-none",
                        ].join(" ")}
                      >
                        <span className="relative z-10">
                          {
                            filter.label
                          }
                        </span>

                        {/* Hover shine */}
                        <span
                          aria-hidden="true"
                          className={[
                            "pointer-events-none absolute",
                            "-left-[68%] top-[-170%]",
                            "h-[440%] w-[60%]",
                            "rotate-[18deg]",

                            "bg-gradient-to-r",
                            "from-transparent",
                            "via-white/85",
                            "to-transparent",

                            "blur-sm",

                            "translate-x-0",
                            "opacity-0",

                            "transition-[transform,opacity]",
                            "duration-[1450ms]",
                            "ease-[cubic-bezier(0.22,1,0.36,1)]",

                            "group-hover/filter:translate-x-[360%]",
                            "group-hover/filter:opacity-100",

                            "group-focus-visible/filter:translate-x-[360%]",
                            "group-focus-visible/filter:opacity-100",
                          ].join(" ")}
                        />

                        {/* Active breathing shine */}
                        {isActive && (
                          <motion.span
                            key={`active-shine-${filter.id}`}
                            aria-hidden="true"
                            initial={{
                              x:
                                "-180%",
                              opacity: 0,
                            }}
                            animate={{
                              x: "260%",
                              opacity: [
                                0,
                                0.62,
                                0.24,
                                0,
                              ],
                            }}
                            transition={{
                              duration:
                                shouldReduceMotion
                                  ? 0
                                  : 1.4,
                              times: [
                                0,
                                0.16,
                                0.8,
                                1,
                              ],
                              ease,
                            }}
                            className={[
                              "pointer-events-none absolute",
                              "-left-[55%] top-[-170%]",
                              "h-[440%] w-[55%]",
                              "rotate-[18deg]",
                              "bg-gradient-to-r",
                              "from-transparent",
                              "via-white/80",
                              "to-transparent",
                              "blur-sm",
                            ].join(" ")}
                          />
                        )}
                      </motion.button>
                    );
                  },
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project grid */}
      <section
        className={[
          "px-[clamp(24px,3vw,56px)]",
          "pb-32",
          "md:pb-44",
          "xl:pb-56",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-[2200px]">
          <AnimatePresence
            mode="wait"
          >
            <motion.div
              key={`project-grid-${gridRevision}`}
              initial={
                shouldReduceMotion
                  ? {
                      opacity: 1,
                      filter:
                        "blur(0px)",
                      scale: 1,
                    }
                  : gridRevision === 0
                    ? false
                  : {
                      opacity: 0,
                      filter:
                        "blur(22px)",
                      scale: 1.006,
                    }
              }
              animate={
                shouldReduceMotion
                  ? {
                      opacity: 1,
                      filter:
                        "blur(0px)",
                      scale: 1,
                    }
                  : {
                      opacity: [
                        0,
                        0.56,
                        1,
                      ],
                      filter: [
                        "blur(22px)",
                        "blur(7px)",
                        "blur(0px)",
                      ],
                      scale: [
                        1.006,
                        1.002,
                        1,
                      ],
                    }
              }
              exit={
                shouldReduceMotion
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 0,
                      filter:
                        "blur(20px)",
                      scale: 0.994,
                      transition: {
                        duration: 0.5,
                        ease,
                      },
                    }
              }
              transition={
                shouldReduceMotion
                  ? {
                      duration: 0,
                    }
                  : {
                      duration: 1.35,
                      ease,
                      times: [
                        0,
                        0.52,
                        1,
                      ],
                    }
              }
              className={[
                "grid grid-cols-1",
                "gap-x-8 gap-y-14",
                "md:grid-cols-2",
                "md:gap-x-8 md:gap-y-20",
                "xl:gap-x-10 xl:gap-y-28",
              ].join(" ")}
            >
              {visibleProjects.map(
                (project, index) => {
                  const isFirstRow =
                    index < 2;

                  const visibleState = {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter:
                      "blur(0px)",
                  };

                  return (
                    <motion.div
                      key={
                        project.slug
                      }
                      initial={
                        shouldReduceMotion
                          ? visibleState
                          : {
                              opacity: 0,
                              y: 14,
                              scale: 1.004,
                              filter:
                                "blur(14px)",
                            }
                      }
                      animate={
                        isFirstRow ||
                        shouldReduceMotion
                          ? visibleState
                          : undefined
                      }
                      whileInView={
                        !isFirstRow &&
                        !shouldReduceMotion
                          ? visibleState
                          : undefined
                      }
                      viewport={{
                        once: true,
                        amount: 0.16,
                        margin:
                          "0px 0px -4% 0px",
                      }}
                      transition={{
                        duration:
                          shouldReduceMotion
                            ? 0
                            : 1.45,
                        delay:
                          shouldReduceMotion
                            ? 0
                            : isFirstRow
                              ? index %
                                  2 ===
                                0
                                ? 0.08
                                : 0.32
                              : index %
                                    2 ===
                                  0
                                ? 0
                                : 0.24,
                        ease,
                      }}
                    >
                      <ProjectCard
                        project={
                          project
                        }
                      />
                    </motion.div>
                  );
                },
              )}

              {visibleProjects.length ===
                0 && (
                <p className="py-24 text-center text-sm text-[var(--color-text-secondary)] md:col-span-2">
                  Projects in this
                  category will be
                  added soon.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}