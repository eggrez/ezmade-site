"use client";

import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { usePageTransition } from "@/components/transitions/PageTransitionProvider";
import TransitionLink from "@/components/transitions/TransitionLink";
import { homeTimeline } from "@/features/home/experience/timeline";
import { useProjectTransition } from "@/components/transitions/ProjectTransitionProvider";

export type HomeNavigationTarget = "hero" | "works" | "about" | "contact";

type NavbarProps = {
  variant?: "home" | "simple" | "project";
  progress?: MotionValue<number>;
  onNavigate?: (target: HomeNavigationTarget) => boolean | Promise<boolean>;
};

type ActiveButton = "contact" | "works" | "about" | null;

const ease = [0.22, 1, 0.36, 1] as const;
const routeBlurEase = [0.22, 1, 0.36, 1] as const;
const layerKeepAliveOpacity = 0.012;

const visibleRouteNavbar = {
  opacity: 1,
  filter: "blur(0px)",
} as const;

const hiddenRouteNavbar = {
  /*
   * Keep the glass controls on their compositor layer while hidden.
   * At opacity: 0 browsers can discard an individual backdrop-filter
   * layer and paint the button back in a single sharp frame.
   */
  opacity: layerKeepAliveOpacity,
  filter: "blur(24px)",
} as const;
 
const visibleRouteSurface = {
  opacity: 1,
} as const;

const hiddenRouteSurface = {
  opacity: 0.012,
} as const;

const routeNavbarExitTransition = {
  opacity: {
    duration: 1.05,
    ease,
  },
  filter: {
    duration: 1.25,
    ease: routeBlurEase,
  },
} as const;

const routeNavbarRevealTransition = {
  opacity: {
    duration: 0.92,
    ease,
  },
  filter: {
    duration: 1.16,
    ease: routeBlurEase,
  },
} as const;

const projectRouteNavbarRevealTransition = {
  opacity: {
    duration: 0.72,
    ease,
  },
  filter: {
    duration: 0.9,
    ease: routeBlurEase,
  },
} as const;

export default function Navbar({
  variant = "home",
  progress,
  onNavigate,
}: NavbarProps) {
  const pathname = usePathname();
  const isHome = variant === "home";
  const isProject = variant === "project";

  /*
   * Force a fresh blur reveal whenever the route changes.
   * This also covers native browser Back/Forward navigation,
   * where the transition providers may not have started first.
   */
  const routeRevealKey = `${pathname}:${variant}`;

  const activeRouteNavbarRevealTransition = isProject
    ? projectRouteNavbarRevealTransition
    : routeNavbarRevealTransition;

  const shouldReduceMotion = useReducedMotion();
  const {
    goBack,
    isTransitioning: isPageTransitioning,
  } = usePageTransition();

  const {
    isTransitioning: isProjectTransitioning,
  } = useProjectTransition();

  const isTransitioning =
    isPageTransitioning ||
    isProjectTransitioning;

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean | null>(
    null,
  );
  const [activeButton, setActiveButton] = useState<ActiveButton>(null);


  const fallbackBackHref = isProject ? "/work" : "/#selected-work";

  /*
   * PageTransitionProvider animates its content with filter/transform.
   * Either property creates a containing block for fixed descendants,
   * which makes a fixed Navbar scroll with the page.
   *
   * A portal keeps the component inside the same React context while
   * placing the actual header directly under document.body. This makes
   * position: fixed relative to the viewport on every route.
   */
  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 767px)");

    const syncMobileViewport = () => {
      setIsMobileViewport(mobileMediaQuery.matches);
    };

    syncMobileViewport();
    setPortalTarget(document.body);

    mobileMediaQuery.addEventListener("change", syncMobileViewport);

    return () => {
      mobileMediaQuery.removeEventListener("change", syncMobileViewport);
    };
  }, []);

  /*
   * Route visibility is derived directly from transition state.
   *
   * This removes the hard-refresh race from the previous implementation,
   * where the Navbar could be set to opacity: 0 while a delayed reveal
   * was cancelled before it had a chance to run.
   */
  const routeNavbarState =
    shouldReduceMotion || !isTransitioning
      ? visibleRouteNavbar
      : hiddenRouteNavbar;

  const routeSurfaceState =
    shouldReduceMotion || !isTransitioning
      ? visibleRouteSurface
      : hiddenRouteSurface;

  const routeNavbarTransition =
    shouldReduceMotion
      ? { duration: 0 }
      : isTransitioning
        ? routeNavbarExitTransition
        : activeRouteNavbarRevealTransition;

  const routeSurfaceTransition =
    shouldReduceMotion
      ? { duration: 0 }
      : isTransitioning
        ? routeNavbarExitTransition
        : activeRouteNavbarRevealTransition;

  /*
   * Navbar and the home scenes now read the same MotionValue directly.
   *
   * Previously, progress was copied into React state inside useEffect.
   * A managed jump could render What we do before that state caught up,
   * leaving the complete scene on screen with a permanently hidden Navbar.
   */
  const fallbackProgress = useMotionValue(isHome ? 0 : 1);

  const navigationProgress = progress ?? fallbackProgress;

  const navigationEnterStart = homeTimeline.hero.holdEnd;

  const navigationEnterEnd = homeTimeline.what.enterEnd;

  const navigationOpacity = useTransform(
    navigationProgress,
    [navigationEnterStart, navigationEnterEnd],
    [layerKeepAliveOpacity, 1],
    { clamp: true },
  );

  const navigationY = useTransform(
    navigationProgress,
    [navigationEnterStart, navigationEnterEnd],
    [-12, 0],
    { clamp: true },
  );

  const navigationBlur = useTransform(
    navigationProgress,
    [navigationEnterStart, navigationEnterEnd],
    [12, 0],
    { clamp: true },
  );

  const navigationFilter = useMotionTemplate`blur(${navigationBlur}px)`;

  const navigationPointerEvents = useTransform(
    navigationProgress,
    (value) =>
      !isHome || value >= navigationEnterEnd * 0.92 ? "auto" : "none",
  );

  async function handleNavigationClick(
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    target: HomeNavigationTarget,
  ) {
    if (!isHome || !onNavigate) {
      return;
    }

    event.preventDefault();

    const didNavigate = await onNavigate(target);

    if (!didNavigate) {
      return;
    }

    const hashMap = {
      hero: window.location.pathname,
      works: "#selected-work",
      about: "#about",
      contact: "#contact",
    };

    window.history.replaceState(window.history.state, "", hashMap[target]);
  }

  async function handleLogoClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isHome || !onNavigate) {
      return;
    }

    const didNavigate = await onNavigate("hero");

    if (!didNavigate) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
  }

  async function handleBackClick(event: MouseEvent<HTMLAnchorElement>) {
    await goBack({
      event,
    });
  }

  function getButtonOffset(button: "contact" | "works" | "about") {
    if (
      shouldReduceMotion ||
      activeButton === null ||
      activeButton === button
    ) {
      return 0;
    }

    const order = ["contact", "works", "about"] as const;

    const activeIndex = order.indexOf(activeButton);

    const buttonIndex = order.indexOf(button);

    return buttonIndex < activeIndex ? -12 : 12;
  }

  const utilityClass = [
    "ez-glass-control group relative isolate",
    "inline-flex items-center justify-center",
    "overflow-hidden rounded-full",
    "border border-black/[0.07]",
    "bg-white/[0.32]",
    "px-4 py-2.5",
"text-sm font-normal leading-none",

"[@media(max-width:430px)]:px-3",
"[@media(max-width:430px)]:py-2.5",
"[@media(max-width:430px)]:text-[0.78rem]",
    "text-black/[0.62]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.94),inset_0_-1px_0_rgba(17,17,17,0.025),0_8px_28px_rgba(17,17,17,0.045)]",
    "backdrop-blur-[20px]",
    "backdrop-saturate-[1.35]",
    "transition-[color,background-color,border-color,box-shadow,transform]",
    "duration-700",
    "ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus-visible:outline-none",

    "before:pointer-events-none",
    "before:absolute",
    "before:inset-[1px]",
    "before:-z-20",
    "before:rounded-full",
    "before:bg-gradient-to-b",
    "before:from-white/[0.58]",
    "before:to-white/[0.10]",
    "before:opacity-70",
    "before:transition-opacity",
    "before:duration-700",

    "after:pointer-events-none",
    "after:absolute",
    "after:-left-[50%]",
    "after:top-[-140%]",
    "after:-z-10",
    "after:h-[380%]",
    "after:w-[75%]",
    "after:rotate-[22deg]",
    "after:bg-gradient-to-r",
    "after:from-transparent",
    "after:via-white/80",
    "after:to-transparent",
    "after:blur-md",
    "after:transition-transform",
    "after:duration-[1500ms]",
    "after:ease-[cubic-bezier(0.22,1,0.36,1)]",

    "hover:-translate-y-px",
    "hover:border-white/[0.72]",
    "hover:bg-white/[0.42]",
    "hover:text-[var(--color-text)]",
    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(17,17,17,0.02),0_13px_36px_rgba(17,17,17,0.11)]",
    "hover:before:opacity-100",
    "hover:after:translate-x-[245%]",

    "focus-visible:border-white/[0.72]",
    "focus-visible:bg-white/[0.42]",
    "focus-visible:text-[var(--color-text)]",
    "focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_13px_36px_rgba(17,17,17,0.11)]",
    "focus-visible:before:opacity-100",
  ].join(" ");

  const ctaClass = [
    "ez-glass-control group relative isolate",
    "inline-flex items-center justify-center",
    "overflow-hidden rounded-full",
    "text-sm font-normal leading-none",
    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-700",
    "ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus-visible:outline-none",
    "focus-visible:ring-1",
    "focus-visible:ring-black/20",

   isHome
  ? [
      "border border-black/[0.10]",
      "bg-white/[0.24]",
      "px-5 py-2.5",

      "[@media(max-width:430px)]:px-3",
      "[@media(max-width:430px)]:py-2.5",
      "[@media(max-width:430px)]:text-[0.78rem]",

      "text-[var(--color-text)]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_30px_rgba(17,17,17,0.04)]",
          "backdrop-blur-xl",
          "hover:scale-[1.035]",
          "hover:border-transparent",
          "hover:shadow-[0_14px_38px_rgba(17,17,17,0.14)]",
        ].join(" ")
      : [
          "border border-black/[0.07]",
          "bg-white/[0.32]",
          "px-4 py-2.5",
          "text-black/[0.66]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.94),inset_0_-1px_0_rgba(17,17,17,0.025),0_8px_28px_rgba(17,17,17,0.045)]",
          "backdrop-blur-[20px]",
          "backdrop-saturate-[1.35]",
          "hover:scale-[1.035]",
          "hover:border-transparent",
          "hover:shadow-[0_13px_36px_rgba(17,17,17,0.11)]",
        ].join(" "),
  ].join(" ");

  const transition = {
    /*
     * Во время смены route новый Navbar собирается
     * мгновенно за невидимым page-transition слоем.
     * Затем он проявляется вместе со страницей одним
     * общим blur, без второй вложенной анимации.
     */
    duration: shouldReduceMotion || isTransitioning ? 0 : 0.8,
    ease,
  };

  const logoClassName = [
    "group relative block",
    "cursor-pointer appearance-none",
    "border-0 bg-transparent p-0",
    "transition-transform",
    "duration-[1400ms]",
    "ease-[cubic-bezier(0.16,1,0.3,1)]",
    "hover:scale-[1.025]",
    "motion-reduce:transition-none",
    "motion-reduce:hover:scale-100",
    "focus-visible:outline-none",
  ].join(" ");

  const logoImage = (
    <span className="relative block">
      <img
        src="/logo.svg"
        alt="EZ"
        className={["block h-auto", "w-[clamp(34px,2.6vw,48px)]"].join(
          " ",
        )}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          WebkitMaskImage: "url('/logo.svg')",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskImage: "url('/logo.svg')",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "contain",
        }}
      >
        <span
          className={[
            "absolute -left-[78%] top-[-30%]",
            "h-[160%] w-[68%]",
            "rotate-[18deg]",
            "bg-gradient-to-r",
            "from-transparent via-white/85 to-transparent",
            "blur-[2px]",
            "opacity-0",
            "transition-[transform,opacity]",
            "duration-[1900ms]",
            "ease-[cubic-bezier(0.16,1,0.3,1)]",
            "will-change-transform",
            "group-hover:translate-x-[300%]",
            "group-hover:opacity-100",
            "motion-reduce:hidden",
          ].join(" ")}
        />
      </span>
    </span>
  );

  const navigationGroupClassName = [
  "flex items-center justify-end",
  isHome
    ? "gap-2 [@media(max-width:430px)]:gap-1"
    : "gap-0.5",
].join(" ");

  const navigationBarClassName = [
    "relative flex items-center",
    "px-[clamp(24px,4vw,72px)]",
"[@media(max-width:430px)]:px-5",
    "py-[clamp(14px,1.35vw,20px)]",
    "transform-gpu [backface-visibility:hidden]",
    "will-change-[transform,opacity,filter]",
  ]
    .filter(Boolean)
    .join(" ");

  const navigationSurfaceClassName = [
  "absolute inset-0",

  "border-b border-black/[0.025]",

  /*
   * Тот же холодный светлый оттенок,
   * что и у основной поверхности сайта.
   * Фон остаётся прозрачным, поэтому grain,
   * emulsion и color drift визуально продолжаются.
   */
  "bg-[rgba(243,245,244,0.28)]",
  "supports-[backdrop-filter]:bg-[rgba(243,245,244,0.16)]",

  /*
   * Blur оставляем, но делаем слабее.
   * Сильный blur превращал Navbar в отдельную
   * матовую стеклянную полосу.
   */
  "backdrop-blur-[10px]",
  "backdrop-saturate-[1.05]",

  isProject
    ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_30px_rgba(17,17,17,0.025)]"
    : "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_24px_rgba(17,17,17,0.012)]",

  "will-change-[opacity]",
].join(" ");

  const ctaContent = (
    <>
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
          "duration-[1600ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:translate-x-[240%]",
          "group-focus-visible:translate-x-[240%]",
        ].join(" ")}
      />

      <span
  className={[
    "relative z-10 whitespace-nowrap",
    "transition-colors",
          "duration-700",
          "group-hover:text-white",
          "group-focus-visible:text-white",
        ].join(" ")}
      >
        Let&apos;s create
      </span>
    </>
  );

  if (!portalTarget || isMobileViewport === null) {
    return null;
  }

 return createPortal(
  <motion.header
    initial={false}
    style={{
      pointerEvents: isHome
        ? navigationPointerEvents
        : "auto",

      zIndex: 300,
    }}
    className={[
      "fixed left-0 top-0",
      "w-screen box-border",
      "overflow-visible",
      "bg-transparent",
    ].join(" ")}
  >
    <motion.div
      key={isMobileViewport ? routeRevealKey : "desktop-navbar"}
      initial={
        shouldReduceMotion || !isMobileViewport
          ? false
          : hiddenRouteNavbar
      }
      animate={
        isMobileViewport
          ? routeNavbarState
          : visibleRouteNavbar
      }
      transition={
        isMobileViewport
          ? routeNavbarTransition
          : { duration: 0 }
      }
      className={[
        "relative w-full",
        "transform-gpu [backface-visibility:hidden]",
        "will-change-[opacity,filter]",
      ].join(" ")}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: isHome ? navigationOpacity : 1,
          y: isHome ? navigationY : 0,
        }}
      >
       <motion.div
  initial={
    shouldReduceMotion || isMobileViewport
      ? false
      : hiddenRouteSurface
  }
  animate={
    isMobileViewport
      ? visibleRouteSurface
      : routeSurfaceState
  }
  transition={
    isMobileViewport
      ? { duration: 0 }
      : routeSurfaceTransition
  }
  className={navigationSurfaceClassName}
/>
      </motion.div>

      <motion.nav
  initial={
    shouldReduceMotion || isMobileViewport
      ? false
      : hiddenRouteNavbar
  }
  animate={
    isMobileViewport
      ? visibleRouteNavbar
      : routeNavbarState
  }
  transition={
    isMobileViewport
      ? { duration: 0 }
      : routeNavbarTransition
  }
  aria-label="Primary navigation"
  className={navigationBarClassName}
>
        <motion.div
          className="flex w-full items-center justify-between gap-8"
          style={{
            opacity: isHome ? navigationOpacity : 1,
            y: isHome ? navigationY : 0,
            filter: isHome ? navigationFilter : "blur(0px)",
          }}
        >
          <div className="shrink-0">
            {isHome ? (
              <button
                type="button"
                aria-label="EZ — Home"
                onClick={(event) => {
                  void handleLogoClick(event);
                }}
                className={logoClassName}
              >
                {logoImage}
              </button>
            ) : (
              <TransitionLink
                href="/"
                scroll={false}
                transitionIntent="home-hero"
                aria-label="EZ — Home"
                className={logoClassName}
              >
                {logoImage}
              </TransitionLink>
            )}
          </div>

          <div
            className={navigationGroupClassName}
            onMouseLeave={() => setActiveButton(null)}
          >
            <motion.div
              animate={{
                x: getButtonOffset("contact"),
              }}
              transition={transition}
              onMouseEnter={() => setActiveButton("contact")}
              onFocusCapture={() => setActiveButton("contact")}
              onBlurCapture={() => setActiveButton(null)}
            >
              {isHome ? (
                <a
                  href="#contact"
                  onClick={(event) => handleNavigationClick(event, "contact")}
                  className={ctaClass}
                >
                  {ctaContent}
                </a>
              ) : (
                <TransitionLink
                  href="/#contact"
                  scroll={false}
                  transitionIntent="home-contact"
                  className={ctaClass}
                >
                  {ctaContent}
                </TransitionLink>
              )}
            </motion.div>

            <motion.div
              animate={{
                x: getButtonOffset("works"),
              }}
              transition={transition}
              onMouseEnter={() => setActiveButton("works")}
              onFocusCapture={() => setActiveButton("works")}
              onBlurCapture={() => setActiveButton(null)}
            >
              {isHome ? (
                <a
                  href="#selected-work"
                  onClick={(event) => handleNavigationClick(event, "works")}
                  className={utilityClass}
                >
                  Works
                </a>
              ) : (
                <a
                  href={fallbackBackHref}
                  onClick={(event) => {
                    void handleBackClick(event);
                  }}
                  className={utilityClass}
                >
                  Back
                </a>
              )}
            </motion.div>

            <motion.div
              animate={{
                x: getButtonOffset("about"),
              }}
              transition={transition}
              onMouseEnter={() => setActiveButton("about")}
              onFocusCapture={() => setActiveButton("about")}
              onBlurCapture={() => setActiveButton(null)}
            >
              {isHome ? (
                <a
                  href="#about"
                  onClick={(event) => handleNavigationClick(event, "about")}
                  className={utilityClass}
                >
                  About
                </a>
              ) : (
                <TransitionLink
                  href="/#selected-work"
                  scroll={false}
                  transitionIntent="home-works"
                  className={utilityClass}
                >
                  Home
                </TransitionLink>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.nav>
    </motion.div>
    </motion.header>,
    portalTarget,
  );
}