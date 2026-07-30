"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PageTransitionIntent =
  "default" | "home-hero" | "home-works" | "home-contact" | "from-works";

export type HomeEntryPhase = "idle" | "preparing" | "entering";

export type HomeEntryTarget = "hero" | "works" | "about" | "contact";

export type HomeEntryRequest = {
  id: number;
  target: HomeEntryTarget;
  mode: "together";
};

type NavigateOptions = {
  href: string;
  event: MouseEvent<HTMLAnchorElement>;
  intent?: PageTransitionIntent;
  scroll?: boolean;
};

type BackOptions = {
  event: MouseEvent<HTMLAnchorElement>;
};

type PendingTransition =
  | {
      kind: "route";
      id: number;
      scrollToTop: boolean;
    }
  | {
      kind: "home";
      id: number;
    }
  | null;

type PageTransitionContextValue = {
  isTransitioning: boolean;
  homeEntry: HomeEntryRequest | null;
  homeEntryPhase: HomeEntryPhase;
  navigate: (options: NavigateOptions) => Promise<boolean>;
  goBack: (options: BackOptions) => Promise<boolean>;
  markHomeReady: (requestId: number) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

const transitionEase = [0.22, 1, 0.36, 1] as const;
const blurEase = [0.4, 0, 0.2, 1] as const;
const transitionBlur = "blur(18px)";
const hiddenOpacity = 0.012;

const visibleState = {
  opacity: 1,
  filter: "blur(0px)",
} as const;

const hiddenState = {
  /*
   * Не используем абсолютный 0.
   *
   * При opacity: 0 Chrome может удалить filter-layer из композиции.
   * После смены route слой создаётся заново, и последний участок blur
   * визуально превращается в резкий второй этап. Почти нулевая opacity
   * оставляет слой живым, но для глаза экран всё равно полностью скрыт.
   */
  opacity: hiddenOpacity,
  filter: transitionBlur,
} as const;

const exitTransition = {
  opacity: {
    duration: 0.46,
    ease: transitionEase,
  },
  filter: {
    duration: 0.58,
    ease: blurEase,
  },
} as const;

const revealTransition = {
  opacity: {
    duration: 0.92,
    ease: transitionEase,
  },
  filter: {
    duration: 1.16,
    ease: blurEase,
  },
} as const;

function getIntentHomeTarget(
  intent: PageTransitionIntent,
): HomeEntryTarget | null {
  if (intent === "home-hero") {
    return "hero";
  }

  if (intent === "home-works") {
    return "works";
  }

  if (intent === "home-contact") {
    return "contact";
  }

  return null;
}

function getHomeHref(target: HomeEntryTarget): string {
  if (target === "works") {
    return "/#selected-work";
  }

  if (target === "about") {
    return "/#about";
  }

  if (target === "contact") {
    return "/#contact";
  }

  return "/";
}

function getCurrentHomeTarget(): HomeEntryTarget | null {
  if (window.location.pathname !== "/") {
    return null;
  }

  if (window.location.hash === "#selected-work") {
    return "works";
  }

  if (window.location.hash === "#about") {
    return "about";
  }

  if (window.location.hash === "#contact") {
    return "contact";
  }

  return "hero";
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function waitForFrames(frameCount = 2): Promise<void> {
  return new Promise((resolve) => {
    function nextFrame(remainingFrames: number) {
      if (remainingFrames <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => {
        nextFrame(remainingFrames - 1);
      });
    }

    nextFrame(frameCount);
  });
}

function lockInstantScroll(): () => void {
  const html = document.documentElement;
  const body = document.body;

  const previousHtmlBehavior = html.style.getPropertyValue("scroll-behavior");
  const previousHtmlPriority =
    html.style.getPropertyPriority("scroll-behavior");
  const previousBodyBehavior = body.style.getPropertyValue("scroll-behavior");
  const previousBodyPriority =
    body.style.getPropertyPriority("scroll-behavior");
  const previousScrollRestoration = window.history.scrollRestoration;

  html.style.setProperty("scroll-behavior", "auto", "important");
  body.style.setProperty("scroll-behavior", "auto", "important");
  window.history.scrollRestoration = "manual";

  let isReleased = false;

  return () => {
    if (isReleased) {
      return;
    }

    isReleased = true;
    window.history.scrollRestoration = previousScrollRestoration;

    if (previousHtmlBehavior) {
      html.style.setProperty(
        "scroll-behavior",
        previousHtmlBehavior,
        previousHtmlPriority,
      );
    } else {
      html.style.removeProperty("scroll-behavior");
    }

    if (previousBodyBehavior) {
      body.style.setProperty(
        "scroll-behavior",
        previousBodyBehavior,
        previousBodyPriority,
      );
    } else {
      body.style.removeProperty("scroll-behavior");
    }
  };
}

async function forceScrollToTop(frameCount = 2): Promise<void> {
  window.scrollTo(0, 0);

  for (let frame = 0; frame < frameCount; frame += 1) {
    await waitForFrames(1);
    window.scrollTo(0, 0);
  }
}

export default function PageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const controls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion() ?? false;

  const [isTransitioning, setIsTransitioning] = useState(false);

  const [homeEntry, setHomeEntry] = useState<HomeEntryRequest | null>(null);

  const [homeEntryPhase, setHomeEntryPhase] = useState<HomeEntryPhase>("idle");

  const transitionIdRef = useRef(0);
  const transitionLockRef = useRef(false);
  const pendingTransitionRef = useRef<PendingTransition>(null);

  const pathnameRef = useRef(pathname);
  const revealLockRef = useRef(false);

  const noPopstateTimerRef = useRef<number | null>(null);
  const releaseScrollLockRef = useRef<(() => void) | null>(null);

  const clearNoPopstateTimer = useCallback(() => {
    if (noPopstateTimerRef.current === null) {
      return;
    }

    window.clearTimeout(noPopstateTimerRef.current);

    noPopstateTimerRef.current = null;
  }, []);

  const releaseScrollLock = useCallback(() => {
    releaseScrollLockRef.current?.();
    releaseScrollLockRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearNoPopstateTimer();
      releaseScrollLock();
    };
  }, [clearNoPopstateTimer, releaseScrollLock]);

  const animateOut = useCallback(async () => {
    controls.stop();

    if (shouldReduceMotion) {
      controls.set({
        opacity: 0,
        filter: "blur(0px)",
      });

      return;
    }

    await controls.start({
      ...hiddenState,
      transition: exitTransition,
    });
  }, [controls, shouldReduceMotion]);

  const revealRoute = useCallback(async () => {
    if (revealLockRef.current) {
      return;
    }

    revealLockRef.current = true;

    const pending = pendingTransitionRef.current;

    pendingTransitionRef.current = null;

    if (pending?.kind === "route" && pending.scrollToTop) {
      /*
       * Scroll уже был поставлен в 0 до router.push.
       * После commit ещё несколько кадров удерживаем
       * его наверху, пока /work остаётся невидимым.
       */
      if (!releaseScrollLockRef.current) {
        releaseScrollLockRef.current = lockInstantScroll();
      }

      await forceScrollToTop(3);
    } else {
      await waitForFrames(2);
    }

    if (shouldReduceMotion) {
      controls.set(visibleState);
    } else {
      /*
       * animateOut уже оставил persistent wrapper ровно в hiddenState.
       * Не вызываем controls.set() ещё раз: повторная запись filter на
       * первом кадре нового route и создавала заметный стык.
       */
      await controls.start({
        ...visibleState,
        transition: revealTransition,
      });
    }

    releaseScrollLock();

    setIsTransitioning(false);
    transitionLockRef.current = false;
    revealLockRef.current = false;
  }, [controls, releaseScrollLock, shouldReduceMotion]);

  const revealHome = useCallback(
    async (requestId: number) => {
      const pending = pendingTransitionRef.current;

      if (
        revealLockRef.current ||
        pending?.kind !== "home" ||
        pending.id !== requestId
      ) {
        return;
      }

      revealLockRef.current = true;
      setHomeEntryPhase("entering");

      /*
       * Подготовленная домашняя сцена проявляется
       * из того же blur-состояния, в котором исчезла
       * предыдущая страница. Значение фильтра не
       * перескакивает между двумя фазами перехода.
       */
      if (shouldReduceMotion) {
        controls.set(visibleState);
      } else {
        /*
         * Wrapper не сбрасывается между route и Home.
         * Продолжаем анимацию из сохранённого hiddenState,
         * поэтому blur проходит стык без второго keyframe.
         */
        await controls.start({
          ...visibleState,
          transition: revealTransition,
        });
      }

      pendingTransitionRef.current = null;
      setHomeEntryPhase("idle");
      setHomeEntry(null);
      setIsTransitioning(false);
      transitionLockRef.current = false;
      revealLockRef.current = false;
    },
    [controls, shouldReduceMotion],
  );

  const markHomeReady = useCallback(
    (requestId: number) => {
      void revealHome(requestId);
    },
    [revealHome],
  );

  const navigate = useCallback(
    async ({ href, event, intent = "default", scroll }: NavigateOptions) => {
      if (
        event.defaultPrevented ||
        isModifiedClick(event) ||
        event.currentTarget.target === "_blank" ||
        event.currentTarget.hasAttribute("download")
      ) {
        return false;
      }

      const destination = new URL(href, window.location.href);
      const originPathname = window.location.pathname;

      if (destination.origin !== window.location.origin) {
        return false;
      }

      event.preventDefault();

      if (transitionLockRef.current) {
        return false;
      }

      transitionLockRef.current = true;

      const transitionId = ++transitionIdRef.current;
      const homeTarget = getIntentHomeTarget(intent);
      const shouldResetRouteScroll = !homeTarget && (scroll ?? true);
      const shouldPrepositionRouteScroll =
        intent === "from-works" && shouldResetRouteScroll;

      setIsTransitioning(true);
      revealLockRef.current = false;

      if (intent === "from-works") {
        /*
         * Меняем именно текущую запись истории.
         * Внутренний state Next.js сохраняется.
         * Следующий push создаст отдельную запись
         * /work, поэтому Back вернёт ровно сюда.
         */
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}#selected-work`,
        );
      }

      if (homeTarget) {
        const request: HomeEntryRequest = {
          id: transitionId,
          target: homeTarget,
          mode: "together",
        };

        setHomeEntry(request);
        setHomeEntryPhase("preparing");

        pendingTransitionRef.current = {
          kind: "home",
          id: transitionId,
        };
      } else {
        setHomeEntry(null);
        setHomeEntryPhase("idle");

        pendingTransitionRef.current = {
          kind: "route",
          id: transitionId,
          scrollToTop: shouldResetRouteScroll,
        };
      }

      await animateOut();

      /*
       * Ключевой момент для View All Projects:
       * сначала ставим скрытую старую страницу в 0,
       * и только затем меняем маршрут. Поэтому /work
       * с первого кадра монтируется наверху и ему
       * больше неоткуда "приезжать" снизу.
       */
      if (shouldPrepositionRouteScroll) {
        releaseScrollLock();
        releaseScrollLockRef.current = lockInstantScroll();
        await forceScrollToTop(2);
      }

      const routerHref = homeTarget
        ? getHomeHref(homeTarget)
        : `${destination.pathname}${destination.search}${destination.hash}`;

      /*
       * Scroll всегда контролирует provider.
       * Иначе Next запускает собственный переход
       * к top, который при global smooth-scroll
       * становится видимой прокруткой снизу вверх.
       */
      router.push(routerHref, {
        scroll: false,
      });

      /*
       * Для обычного hash-перехода pathname
       * может не измениться. В таком случае
       * usePathname не даст нового события,
       * поэтому раскрываем маршрут сами.
       */
      if (!homeTarget && destination.pathname === originPathname) {
        void revealRoute();
      }

      return true;
    },
    [animateOut, releaseScrollLock, revealRoute, router],
  );

  const goBack = useCallback(
    async ({ event }: BackOptions) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return false;
      }

      event.preventDefault();

      if (transitionLockRef.current) {
        return false;
      }

      transitionLockRef.current = true;

      const transitionId = ++transitionIdRef.current;

      setIsTransitioning(true);
      setHomeEntry(null);
      setHomeEntryPhase("idle");
      revealLockRef.current = false;

      await animateOut();

      let didReceivePopstate = false;

      const handlePopstate = () => {
        didReceivePopstate = true;
        clearNoPopstateTimer();

        const homeTarget = getCurrentHomeTarget();

        if (homeTarget) {
          const request: HomeEntryRequest = {
            id: transitionId,
            target: homeTarget,
            mode: "together",
          };

          setHomeEntry(request);
          setHomeEntryPhase("preparing");

          pendingTransitionRef.current = {
            kind: "home",
            id: transitionId,
          };

          return;
        }

        pendingTransitionRef.current = {
          kind: "route",
          id: transitionId,
          scrollToTop: false,
        };

        /*
         * При смене pathname раскрытие запустит
         * usePathname-effect уже после того, как
         * Next подменил children. Для hash/query
         * внутри того же pathname раскрываем сами.
         */
        if (window.location.pathname === pathnameRef.current) {
          void revealRoute();
        }
      };

      window.addEventListener("popstate", handlePopstate, {
        once: true,
      });

      window.history.back();

      /*
       * history.length не показывает, существует
       * ли доступный шаг внутри текущей вкладки.
       * Если Back физически не сработал, остаёмся
       * на текущей странице и возвращаем её из blur.
       */
      noPopstateTimerRef.current = window.setTimeout(() => {
        if (didReceivePopstate) {
          return;
        }

        window.removeEventListener("popstate", handlePopstate);

        pendingTransitionRef.current = {
          kind: "route",
          id: transitionId,
          scrollToTop: false,
        };

        void revealRoute();
      }, 900);

      return true;
    },
    [animateOut, clearNoPopstateTimer, revealRoute],
  );

  useEffect(() => {
    if (pathnameRef.current === pathname) {
      return;
    }

    pathnameRef.current = pathname;

    const pending = pendingTransitionRef.current;

    if (pending?.kind === "route") {
      void revealRoute();
    }
  }, [pathname, revealRoute]);

  const contextValue = useMemo(
    () => ({
      isTransitioning,
      homeEntry,
      homeEntryPhase,
      navigate,
      goBack,
      markHomeReady,
    }),
    [
      goBack,
      homeEntry,
      homeEntryPhase,
      isTransitioning,
      markHomeReady,
      navigate,
    ],
  );

  return (
    <PageTransitionContext.Provider value={contextValue}>
      <motion.div
        initial={false}
        animate={controls}
        className={[
          "min-h-full",
          "transform-gpu",
          "will-change-[opacity,filter]",
          isTransitioning ? "pointer-events-none" : "",
        ].join(" ")}
        style={{
          opacity: 1,
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </motion.div>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider.",
    );
  }

  return context;
}