"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createPortal,
  flushSync,
} from "react-dom";
import {
  usePathname,
  useRouter,
} from "next/navigation";

type StartProjectTransitionOptions = {
  slug: string;
  image: string;
  title: string;
  rect: DOMRect;
};

type StartProjectReturnOptions = {
  href?: string;
  image?: string;
  title?: string;
  scrollTop?: number;
  useOriginHref?: boolean;
};

type StoredRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ProjectOrigin = {
  slug: string;
  image: string;
  title: string;
  sourceHref: string;
  sourcePathname: string;
  sourceScrollY: number;
};

type OverlayMode =
  | "forward"
  | "reverse";

type OverlayPhase =
  | "forward-expanding"
  | "forward-leaving"
  | "reverse-covering"
  | "reverse-routing"
  | "reverse-leaving";

type OverlayState = {
  mode: OverlayMode;
  phase: OverlayPhase;

  mobileLight: boolean;

  slug: string;
  image: string;
  title: string;

  rect: StoredRect;

  expanded: boolean;
  visible: boolean;

  targetHref?: string;
  targetPathname?: string;
  targetScrollTop?: number;
};

type ProjectTransitionContextValue = {
  isTransitioning: boolean;

  startProjectTransition: (
    options: StartProjectTransitionOptions,
  ) => void;

  startProjectNavigation: (
    options: StartProjectTransitionOptions,
  ) => void;

  startProjectReturn: (
    fallbackHref: string,
    options?: StartProjectReturnOptions,
  ) => boolean;
};

type ProjectTransitionProviderProps = {
  children: ReactNode;
};

const ProjectTransitionContext =
  createContext<ProjectTransitionContextValue | null>(
    null,
  );

const STORAGE_KEY =
  "ez-project-origin";

const FORWARD_EXPAND_DURATION =
  1100;

const FORWARD_EXIT_DURATION =
  750;

const MOBILE_FORWARD_ROUTE_DURATION =
  2550;

const MOBILE_FORWARD_EXIT_DURATION =
  1850;

const REVERSE_COVER_DURATION =
  900;

const REVERSE_ROUTE_WAIT =
  180;

const REVERSE_EXIT_DURATION =
  1100;

export function useProjectTransition() {
  const context = useContext(
    ProjectTransitionContext,
  );

  if (!context) {
    throw new Error(
      "useProjectTransition must be used inside ProjectTransitionProvider",
    );
  }

  return context;
}

function getCurrentHref() {
  return [
    window.location.pathname,
    window.location.search,
    window.location.hash,
  ].join("");
}

function setInstantScroll(
  top: number,
) {
  const html =
    document.documentElement;

  const body =
    document.body;

  const previousHtmlBehavior =
    html.style.scrollBehavior;

  const previousBodyBehavior =
    body.style.scrollBehavior;

  html.style.scrollBehavior =
    "auto";

  body.style.scrollBehavior =
    "auto";

  window.scrollTo({
    top,
    left: 0,
    behavior: "auto",
  });

  requestAnimationFrame(() => {
    html.style.scrollBehavior =
      previousHtmlBehavior;

    body.style.scrollBehavior =
      previousBodyBehavior;
  });
}

export default function ProjectTransitionProvider({
  children,
}: ProjectTransitionProviderProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    isMounted,
    setIsMounted,
  ] = useState(false);

  const [
    origin,
    setOrigin,
  ] = useState<ProjectOrigin | null>(
    null,
  );

  const [
    overlay,
    setOverlay,
  ] = useState<OverlayState | null>(
    null,
  );

  const overlayRef =
    useRef<OverlayState | null>(
      null,
    );

  const routeTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const finishTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const routeWaitTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const frameRef =
    useRef<number | null>(
      null,
    );

  const secondFrameRef =
    useRef<number | null>(
      null,
    );

  useEffect(() => {
    overlayRef.current =
      overlay;
  }, [overlay]);

  useEffect(() => {
    setIsMounted(true);

    try {
      const storedOrigin =
        window.sessionStorage.getItem(
          STORAGE_KEY,
        );

      if (storedOrigin) {
        setOrigin(
          JSON.parse(
            storedOrigin,
          ) as ProjectOrigin,
        );
      }
    } catch {
      window.sessionStorage.removeItem(
        STORAGE_KEY,
      );
    }
  }, []);

  useEffect(() => {
    const previousRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration =
      "manual";

    return () => {
      window.history.scrollRestoration =
        previousRestoration;
    };
  }, []);

  const clearTimers =
    useCallback(() => {
      if (routeTimerRef.current) {
        clearTimeout(
          routeTimerRef.current,
        );

        routeTimerRef.current =
          null;
      }

      if (finishTimerRef.current) {
        clearTimeout(
          finishTimerRef.current,
        );

        finishTimerRef.current =
          null;
      }

      if (
        routeWaitTimerRef.current
      ) {
        clearTimeout(
          routeWaitTimerRef.current,
        );

        routeWaitTimerRef.current =
          null;
      }

      if (
        frameRef.current !== null
      ) {
        cancelAnimationFrame(
          frameRef.current,
        );

        frameRef.current =
          null;
      }

      if (
        secondFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          secondFrameRef.current,
        );

        secondFrameRef.current =
          null;
      }
    }, []);

  const saveOrigin =
    useCallback(
      (
        nextOrigin: ProjectOrigin,
      ) => {
        setOrigin(nextOrigin);

        try {
          window.sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              nextOrigin,
            ),
          );
        } catch {
          // Transition still works
          // in the mounted session.
        }
      },
      [],
    );

  const clearOrigin =
    useCallback(() => {
      setOrigin(null);

      try {
        window.sessionStorage.removeItem(
          STORAGE_KEY,
        );
      } catch {
        // Ignore unavailable storage.
      }
    }, []);

  /*
   * Forward transition:
   * card -> fullscreen -> project route.
   */
  const startProjectTransition =
    useCallback(
      ({
        slug,
        image,
        title,
        rect,
      }: StartProjectTransitionOptions) => {
        /*
         * Ref защищает от двойного клика
         * ещё до следующего React-render.
         */
        if (overlayRef.current) {
          return;
        }

         clearTimers();

        const mobileLight =
          window.matchMedia(
            "(max-width: 767px)",
          ).matches;

        const nextOrigin: ProjectOrigin =
          {
            slug,
            image,
            title,
            sourceHref:
              getCurrentHref(),
            sourcePathname:
              pathname,
            sourceScrollY:
              window.scrollY,
          };

        saveOrigin(nextOrigin);

        const nextOverlay: OverlayState =
          {
            mode: "forward",
             phase:
              "forward-expanding",

            mobileLight,

            slug,
            image,
            title,

            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },

            expanded: false,
            visible: true,
          };

        /*
         * Монтируем overlay синхронно,
         * пока исходная карточка всё ещё
         * находится в том же состоянии.
         */
        flushSync(() => {
          overlayRef.current =
            nextOverlay;

          setOverlay(
            nextOverlay,
          );
        });

        /*
         * Один кадр нужен браузеру,
         * чтобы зафиксировать начальную
         * геометрию overlay.
         */
        frameRef.current =
          requestAnimationFrame(() => {
            setOverlay(
              (current) => {
                if (
                  !current ||
                  current.mode !==
                    "forward"
                ) {
                  return current;
                }

                const next = {
                  ...current,
                  expanded: true,
                };

                overlayRef.current =
                  next;

                return next;
              },
            );
          });

        routeTimerRef.current =
          setTimeout(() => {
            router.push(
              `/projects/${slug}`,
              {
                scroll: false,
              },
            );
       }, mobileLight
            ? MOBILE_FORWARD_ROUTE_DURATION
            : FORWARD_EXPAND_DURATION);
      },
      [
        clearTimers,
        pathname,
        router,
        saveOrigin,
      ],
    );

  /*
   * Reverse transition:
   * project -> fullscreen overlay ->
   * destination route -> fade out.
   */
  const startProjectReturn =
    useCallback(
      (
        fallbackHref: string,
        options: StartProjectReturnOptions = {},
      ) => {
        if (overlayRef.current) {
          return true;
        }

        clearTimers();

        const targetHref =
          options.useOriginHref &&
          origin?.sourceHref
            ? origin.sourceHref
            : options.href ||
              fallbackHref;

        const targetUrl =
          new URL(
            targetHref,
            window.location.origin,
          );

        const transitionImage =
          options.image ||
          origin?.image ||
          "";

        const transitionTitle =
          options.title ||
          origin?.title ||
          "";

        const transitionSlug =
          origin?.slug ||
          pathname
            .split("/")
            .filter(Boolean)
            .at(-1) ||
          "project";

        const nextOverlay: OverlayState =
          {
            mode: "reverse",
                        phase:
              "reverse-covering",

            mobileLight: false,

            slug:
              transitionSlug,

            image:
              transitionImage,

            title:
              transitionTitle,

            rect: {
              top: 0,
              left: 0,
              width:
                window.innerWidth,
              height:
                window.innerHeight,
            },

            expanded: true,
            visible: false,

            targetHref,

            targetPathname:
              targetUrl.pathname,

            targetScrollTop:
              options.scrollTop ??
              (options.useOriginHref
                ? origin?.sourceScrollY ??
                  0
                : 0),
          };

        flushSync(() => {
          overlayRef.current =
            nextOverlay;

          setOverlay(
            nextOverlay,
          );
        });

        frameRef.current =
          requestAnimationFrame(() => {
            setOverlay(
              (current) => {
                if (
                  !current ||
                  current.mode !==
                    "reverse"
                ) {
                  return current;
                }

                const next = {
                  ...current,
                  visible: true,
                };

                overlayRef.current =
                  next;

                return next;
              },
            );
          });

        routeTimerRef.current =
          setTimeout(() => {
            setOverlay(
              (current) => {
                if (
                  !current ||
                  current.mode !==
                    "reverse"
                ) {
                  return current;
                }

                const next = {
                  ...current,
                  phase:
                    "reverse-routing" as const,
                };

                overlayRef.current =
                  next;

                return next;
              },
            );

            router.push(
              targetHref,
              {
                scroll: false,
              },
            );
          }, REVERSE_COVER_DURATION);

        return true;
      },
      [
        clearTimers,
        origin,
        pathname,
        router,
      ],
    );

  /*
   * Project route mounted underneath
   * the fullscreen forward overlay.
   */
  useEffect(() => {
    if (
      !overlay ||
      overlay.mode !== "forward" ||
      overlay.phase !==
        "forward-expanding"
    ) {
      return;
    }

    const targetPath =
      `/projects/${overlay.slug}`;

    if (pathname !== targetPath) {
      return;
    }

    setInstantScroll(0);

    frameRef.current =
      requestAnimationFrame(() => {
        setInstantScroll(0);

        secondFrameRef.current =
          requestAnimationFrame(() => {
            setInstantScroll(0);

            setOverlay(
              (current) => {
                if (
                  !current ||
                  current.mode !==
                    "forward"
                ) {
                  return current;
                }

                const next = {
                  ...current,
                  phase:
                    "forward-leaving" as const,
                  visible: false,
                };

                overlayRef.current =
                  next;

                return next;
              },
            );

            finishTimerRef.current =
              setTimeout(() => {
                overlayRef.current =
                  null;

                setOverlay(null);
                }, overlay.mobileLight
                ? MOBILE_FORWARD_EXIT_DURATION
                : FORWARD_EXIT_DURATION);
          });
      });
  }, [
    overlay,
    pathname,
  ]);

  /*
   * Destination route mounted underneath
   * the reverse overlay.
   */
  useEffect(() => {
    if (
      !overlay ||
      overlay.mode !== "reverse" ||
      overlay.phase !==
        "reverse-routing"
    ) {
      return;
    }

    const targetPathname =
      overlay.targetPathname ||
      origin?.sourcePathname ||
      "/";

    if (
      pathname !== targetPathname
    ) {
      return;
    }

    const targetScrollTop =
      overlay.targetScrollTop ??
      0;

    const restoreDestinationPosition =
      () => {
        setInstantScroll(
          targetScrollTop,
        );
      };

    restoreDestinationPosition();

    frameRef.current =
      requestAnimationFrame(() => {
        restoreDestinationPosition();

        secondFrameRef.current =
          requestAnimationFrame(() => {
            restoreDestinationPosition();

            routeWaitTimerRef.current =
              setTimeout(() => {
                restoreDestinationPosition();

                setOverlay(
                  (current) => {
                    if (
                      !current ||
                      current.mode !==
                        "reverse"
                    ) {
                      return current;
                    }

                    const next = {
                      ...current,
                      phase:
                        "reverse-leaving" as const,
                      visible: false,
                    };

                    overlayRef.current =
                      next;

                    return next;
                  },
                );

                finishTimerRef.current =
                  setTimeout(() => {
                    overlayRef.current =
                      null;

                    setOverlay(null);
                    clearOrigin();
                  }, REVERSE_EXIT_DURATION);
              }, REVERSE_ROUTE_WAIT);
          });
      });
  }, [
    clearOrigin,
    origin?.sourcePathname,
    overlay,
    pathname,
  ]);

  /*
   * Lock page scroll while transition
   * is active.
   */
  useEffect(() => {
    if (!overlay) {
      return;
    }

    const html =
      document.documentElement;

    const body =
      document.body;

    const previousHtmlOverflow =
      html.style.overflow;

    const previousBodyOverflow =
      body.style.overflow;

    const previousHtmlBehavior =
      html.style.scrollBehavior;

    const previousBodyBehavior =
      body.style.scrollBehavior;

    const previousBodyPaddingRight =
      body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    const computedPaddingRight =
      Number.parseFloat(
        window
          .getComputedStyle(body)
          .paddingRight,
      ) || 0;

    html.style.setProperty(
      "--scrollbar-compensation",
      `${scrollbarWidth}px`,
    );

    html.style.overflow =
      "hidden";

    body.style.overflow =
      "hidden";

    html.style.scrollBehavior =
      "auto";

    body.style.scrollBehavior =
      "auto";

    if (scrollbarWidth > 0) {
      body.style.paddingRight =
        `${
          computedPaddingRight +
          scrollbarWidth
        }px`;
    }

    return () => {
      html.style.overflow =
        previousHtmlOverflow;

      body.style.overflow =
        previousBodyOverflow;

      html.style.scrollBehavior =
        previousHtmlBehavior;

      body.style.scrollBehavior =
        previousBodyBehavior;

      body.style.paddingRight =
        previousBodyPaddingRight;

      html.style.removeProperty(
        "--scrollbar-compensation",
      );
    };
  }, [overlay]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const overlayElement =
    isMounted && overlay
      ? createPortal(
    <>
          {overlay.mode ===
              "forward" &&
              overlay.mobileLight && (
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-auto fixed left-0 top-0",
                  "z-[2147483647]",
                  "w-screen overflow-hidden",
                  "cursor-default select-none touch-none",
                  "md:hidden",
                ].join(" ")}
                style={{
                  height:
                    "calc(100dvh + 2px)",

                  WebkitBackdropFilter:
                    overlay.expanded &&
                    overlay.phase !==
                      "forward-leaving"
                      ? "blur(14px)"
                      : "blur(0px)",

                  backdropFilter:
                    overlay.expanded &&
                    overlay.phase !==
                      "forward-leaving"
                      ? "blur(14px)"
                      : "blur(0px)",

                  transition: [
                    `backdrop-filter ${
                      overlay.phase ===
                      "forward-leaving"
                        ? 1650
                        : 1150
                    }ms cubic-bezier(0.37,0,0.63,1)`,

                    `-webkit-backdrop-filter ${
                      overlay.phase ===
                      "forward-leaving"
                        ? 1650
                        : 1150
                    }ms cubic-bezier(0.37,0,0.63,1)`,
                  ].join(", "),
                }}
              >
                {/* Светлый фон */}
                <div
                  className="absolute inset-0 bg-[var(--color-bg)]"
                  style={{
                    opacity:
                      overlay.expanded &&
                      overlay.visible
                        ? 1
                        : 0,

                    transition:
                      overlay.phase ===
                      "forward-leaving"
                        ? "opacity 1450ms 260ms cubic-bezier(0.37,0,0.63,1)"
                        : "opacity 650ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                />

                {/* Стабильная область знака */}
                <div
                  className={[
                    "absolute left-0 top-0",
                    "flex h-svh w-full",
                    "items-center justify-center",
                    "px-6",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "relative h-[4.8rem] w-[4.8rem]",
                      "transform-gpu",
                      "will-change-[opacity,filter,transform]",
                    ].join(" ")}
                    style={{
                      opacity:
                        overlay.expanded &&
                        overlay.visible
                          ? 1
                          : 0,

                      filter:
                        overlay.expanded &&
                        overlay.visible
                          ? "blur(0px)"
                          : overlay.phase ===
                              "forward-leaving"
                            ? "blur(24px)"
                            : "blur(22px)",

                      transform:
                        overlay.expanded &&
                        overlay.visible
                          ? "scale(1)"
                          : overlay.phase ===
                              "forward-leaving"
                            ? "scale(1.045)"
                            : "scale(0.97)",

                      transition:
                        overlay.phase ===
                        "forward-leaving"
                          ? [
                              "opacity 1050ms cubic-bezier(0.37,0,0.63,1)",
                              "filter 1450ms cubic-bezier(0.22,1,0.36,1)",
                              "transform 1450ms cubic-bezier(0.22,1,0.36,1)",
                            ].join(", ")
                          : [
                              "opacity 1100ms 320ms cubic-bezier(0.22,1,0.36,1)",
                              "filter 1350ms 260ms cubic-bezier(0.16,1,0.3,1)",
                              "transform 1350ms 260ms cubic-bezier(0.16,1,0.3,1)",
                            ].join(", "),
                    }}
                  >
                    {/* Обводка */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 64 64"
                      className="absolute inset-0 h-full w-full overflow-visible text-black"
                    >
                      <path
                        d="M44.851 64h15.13C62.201 64 64 62.209 64 60V44.851L44.851 64Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.15"
                        vectorEffect="non-scaling-stroke"
                      />

                      <path
                        d="M64 39.181V4c0-2.209-1.799-4-4.019-4H4.019C1.799 0 0 1.791 0 4v55.999C0 62.209 1.799 64 4.019 64h35.162L64 39.181Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.15"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    {/* Чёрная заливка */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 64 64"
                      className="absolute inset-0 h-full w-full text-black will-change-[clip-path]"
                      style={{
                        WebkitClipPath:
                          overlay.expanded
                            ? "inset(0% 0% 0% 0%)"
                            : "inset(50% 50% 50% 50%)",

                        clipPath:
                          overlay.expanded
                            ? "inset(0% 0% 0% 0%)"
                            : "inset(50% 50% 50% 50%)",

                        transition: [
                          "clip-path 1000ms 1050ms cubic-bezier(0.16,1,0.3,1)",
                          "-webkit-clip-path 1000ms 1050ms cubic-bezier(0.16,1,0.3,1)",
                        ].join(", "),
                      }}
                    >
                      <path
                        d="M44.851 64h15.13C62.201 64 64 62.209 64 60V44.851L44.851 64Z"
                        fill="currentColor"
                      />

                      <path
                        d="M64 39.181V4c0-2.209-1.799-4-4.019-4H4.019C1.799 0 0 1.791 0 4v55.999C0 62.209 1.799 64 4.019 64h35.162L64 39.181Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

      <div
        aria-hidden="true"
        className={[
  "pointer-events-auto fixed",
  "z-[2147483647]",
  "overflow-hidden",
  "bg-neutral-200",
  "cursor-default",
  "select-none",
  "touch-none",
  "will-change-[top,left,width,height,opacity,transform,border-radius]",
              overlay.mode ===
              "forward"
                ? "hidden md:block"
                : "",
              overlay.expanded
    ? [
        "h-svh",
        "[@media(width:414px)_and_(orientation:portrait)]:!h-[calc(100dvh+2px)]",
      ].join(" ")
    : "",
].join(" ")}
            style={{
              top:
                overlay.expanded
                  ? 0
                  : overlay.rect.top,

              left:
                overlay.expanded
                  ? 0
                  : overlay.rect.left,

              width:
                overlay.expanded
                  ? "100vw"
                  : overlay.rect.width,

              height:
  overlay.expanded
    ? undefined
    : overlay.rect.height,

              borderRadius:
                overlay.expanded
                  ? 0
                  : 2,

              opacity:
                overlay.visible
                  ? 1
                  : 0,

              transform:
                overlay.phase ===
                "forward-leaving"
                  ? "scale(1.025)"
                  : overlay.phase ===
                      "reverse-leaving"
                    ? "scale(1.018)"
                    : "scale(1)",

              transition: [
                `top ${FORWARD_EXPAND_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
                `left ${FORWARD_EXPAND_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
                `width ${FORWARD_EXPAND_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
                `height ${FORWARD_EXPAND_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
                `border-radius ${FORWARD_EXPAND_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,

                `opacity ${
                  overlay.mode ===
                  "reverse"
                    ? REVERSE_EXIT_DURATION
                    : FORWARD_EXIT_DURATION
                }ms cubic-bezier(0.22,1,0.36,1)`,

                `transform ${
                  overlay.mode ===
                  "reverse"
                    ? REVERSE_EXIT_DURATION
                    : FORWARD_EXIT_DURATION
                }ms cubic-bezier(0.22,1,0.36,1)`,
              ].join(", "),
            }}
          >
            {overlay.image ? (
              <img
                src={overlay.image}
                alt=""
                draggable={false}
                decoding="sync"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{
                  transform:
                    overlay.expanded
                      ? "scale(1.045)"
                      : "scale(1)",

                  transition:
                    "transform 1500ms cubic-bezier(0.22,1,0.36,1)",

                  backfaceVisibility:
                    "hidden",

                  WebkitBackfaceVisibility:
                    "hidden",
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-200" />
            )}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black"
              style={{
                opacity:
                  overlay.expanded &&
                  overlay.visible
                    ? overlay.mode ===
                      "reverse"
                      ? 0.16
                      : 0.12
                    : 0,

                transition:
                  "opacity 750ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />

            <div
              aria-hidden="true"
              className={[
                "absolute -left-[60%] top-[-80%]",
                "h-[270%] w-[42%]",
                "rotate-[18deg]",
                "bg-gradient-to-r",
                "from-transparent via-white/30 to-transparent",
                "blur-2xl",
                "mix-blend-screen",
              ].join(" ")}
              style={{
                opacity:
                  overlay.expanded &&
                  overlay.visible &&
                  overlay.phase !==
                    "reverse-leaving"
                    ? 0.24
                    : 0,

                transform:
                  overlay.expanded
                    ? "translateX(430%) rotate(18deg)"
                    : "translateX(-20%) rotate(18deg)",

                transition: [
                  "transform 2600ms cubic-bezier(0.22,1,0.36,1)",
                  "opacity 500ms cubic-bezier(0.22,1,0.36,1)",
                ].join(", "),
              }}
            />

            <p
              className={[
                "absolute",
                "bottom-[clamp(24px,4vw,72px)]",
                "left-[clamp(24px,4vw,72px)]",
                "max-w-[86vw]",
                "text-[clamp(2.8rem,8vw,9rem)]",
                "font-medium leading-[0.86]",
                "tracking-[-0.075em]",
                "text-white",
              ].join(" ")}
              style={{
                opacity:
                  overlay.expanded &&
                  overlay.visible &&
                  overlay.phase !==
                    "reverse-leaving"
                    ? 1
                    : 0,

                transform:
                  overlay.expanded &&
                  overlay.visible &&
                  overlay.phase !==
                    "reverse-leaving"
                    ? "translateY(0)"
                    : "translateY(18px)",

                filter:
                  overlay.expanded &&
                  overlay.visible &&
                  overlay.phase !==
                    "reverse-leaving"
                    ? "blur(0px)"
                    : "blur(6px)",

                transition:
                  [
                    "opacity 620ms cubic-bezier(0.22,1,0.36,1)",
                    "transform 620ms cubic-bezier(0.22,1,0.36,1)",
                    "filter 620ms cubic-bezier(0.22,1,0.36,1)",
                  ].join(", "),
              }}
            >
              {overlay.title}
            </p>

            <div
              aria-hidden="true"
              className="absolute inset-[1px] border border-white/35"
              style={{
                opacity:
                  overlay.expanded &&
                  overlay.visible
                    ? 0
                    : 0.7,

                transition:
                  "opacity 650ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
                    </div>
        </>,
        document.body,
        )
      : null;

  return (
    <ProjectTransitionContext.Provider
      value={{
        isTransitioning:
          overlay !== null,

        startProjectTransition,

        startProjectNavigation:
          startProjectTransition,

        startProjectReturn,
      }}
    >
      {children}
      {overlayElement}
    </ProjectTransitionContext.Provider>
  );
}