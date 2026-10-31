"use client";

import { useReducedMotion } from "framer-motion";
import BrandTransitionOverlay, { BRAND_COVER_DURATION, BRAND_EXIT_DURATION } from "./BrandTransitionOverlay";
import { prepareProjectImage } from "@/lib/project-images";

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
  isContentReady: boolean;
  markProjectReady: (slug: string) => void;

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

const REVERSE_ROUTE_WAIT = 180;

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
  const shouldReduceMotion = useReducedMotion() ?? false;

  const pathname =
    usePathname();
  const [readyProject, setReadyProject] = useState<string | null>(null);
  const markProjectReady = useCallback((slug: string) => setReadyProject(slug), []);
  const transitionGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const mountFrame = requestAnimationFrame(() => {
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
      try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
    }
    });
    return () => cancelAnimationFrame(mountFrame);
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
      if (transitionGuardRef.current) {
        clearTimeout(transitionGuardRef.current);
        transitionGuardRef.current = null;
      }
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
        setReadyProject(null);
        router.prefetch(`/projects/${slug}`);
        void prepareProjectImage(image, Math.min(window.innerWidth * window.devicePixelRatio, 2200)).catch(() => undefined);
        transitionGuardRef.current = setTimeout(() => {
          overlayRef.current = null;
          setOverlay(null);
          window.location.assign(`/projects/${slug}`);
        }, 10000);


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
      }, shouldReduceMotion ? 0 : BRAND_COVER_DURATION);
      },
      [
        clearTimers,
        pathname,
        router,
        saveOrigin,
        shouldReduceMotion,
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
        router.prefetch(targetHref);
        transitionGuardRef.current = setTimeout(() => {
          overlayRef.current = null;
          setOverlay(null);
          window.location.assign(targetHref);
        }, 10000);

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
          }, shouldReduceMotion ? 0 : BRAND_COVER_DURATION);

        return true;
      },
      [
        clearTimers,
        origin,
        shouldReduceMotion,
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
    // The destination can mount before its poster has loaded and decoded.
    if (readyProject !== overlay.slug) return;

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
                if (transitionGuardRef.current) clearTimeout(transitionGuardRef.current);
                transitionGuardRef.current = null;
                }, shouldReduceMotion ? 0 : BRAND_EXIT_DURATION);
          });
      });
  }, [
    overlay,
    readyProject,
    shouldReduceMotion,
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
                    if (transitionGuardRef.current) clearTimeout(transitionGuardRef.current);
                    transitionGuardRef.current = null;
                  }, shouldReduceMotion ? 0 : BRAND_EXIT_DURATION);
              }, shouldReduceMotion ? 0 : REVERSE_ROUTE_WAIT);
          });
      });
  }, [
    clearOrigin,
    origin?.sourcePathname,
    overlay,
    pathname,
    shouldReduceMotion,
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

  const overlayElement = isMounted && overlay ? createPortal(
    <BrandTransitionOverlay
      expanded={overlay.expanded && (overlay.visible || overlay.phase.endsWith("leaving"))}
      leaving={overlay.phase.endsWith("leaving")}
      reducedMotion={shouldReduceMotion}
    />,
    document.body,
  ) : null;

  return (
    <ProjectTransitionContext.Provider
      value={{
        isTransitioning:
          overlay !== null,
        isContentReady:
          overlay === null || overlay.phase.endsWith("leaving"),
        markProjectReady,

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
