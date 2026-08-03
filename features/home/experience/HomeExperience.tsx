"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useLayoutEffect, useRef } from "react";

import Navbar, {
  type HomeNavigationTarget,
} from "@/components/navigation/Navbar";
import { usePageTransition } from "@/components/transitions/PageTransitionProvider";
import FeaturedProjects from "@/features/home/FeaturedProjects";
import HeroContent from "@/features/home/HeroScene/HeroContent";
import { WhatWeDoContent } from "@/features/home/HeroScene/WhatWeDoContent";

import AboutContent from "./AboutContent";
import ContactContent from "./ContactContent";
import SceneLayer from "./SceneLayer";
import { HOME_EXPERIENCE_HEIGHT, homeTimeline } from "./timeline";
import { useSceneProgress } from "./useSceneProgress";
import { useTimeline } from "./useTimeline";

const transitionEase = [0.22, 1, 0.36, 1] as const;
const blurEase = [0.4, 0, 0.2, 1] as const;
const transitionBlur = "blur(18px)";
const hiddenOpacity = 0.012;

const visibleSceneState = {
  opacity: 1,
  filter: "blur(0px)",
} as const;

const hiddenSceneState = {
  /*
   * Сохраняем filter-layer живым в точке смены сцены.
   * При opacity: 0 Chrome может пересоздать слой и показать
   * последний участок blur как отдельный резкий этап.
   */
  opacity: hiddenOpacity,
  filter: transitionBlur,
} as const;

const sceneExitTransition = {
  opacity: {
    duration: 0.46,
    ease: transitionEase,
  },
  filter: {
    duration: 0.58,
    ease: blurEase,
  },
} as const;

const sceneRevealTransition = {
  opacity: {
    duration: 0.92,
    ease: transitionEase,
  },
  filter: {
    duration: 1.16,
    ease: blurEase,
  },
} as const;

function getExternalSceneTarget(): HomeNavigationTarget | null {
  if (typeof window === "undefined") {
    return null;
  }

  const requestedScene = new URLSearchParams(window.location.search).get(
    "scene",
  );

  if (requestedScene === "works") {
    return "works";
  }

  const targetByHash: Partial<Record<string, HomeNavigationTarget>> = {
    "#selected-work": "works",
    "#about": "about",
    "#contact": "contact",
  };

  return targetByHash[window.location.hash] ?? null;
}

/*
 * Ожидание нескольких кадров нужно,
 * чтобы useTimeline гарантированно получил
 * новую физическую позицию страницы.
 */
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

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete) {
    if (typeof image.decode === "function") {
      return image.decode().catch(() => undefined);
    }

    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      resolve();
    };

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

async function waitForSelectedWorkMedia(): Promise<void> {
  const section = document.getElementById("selected-work");

  if (!section) {
    await waitForFrames(1);
    return;
  }

  const images = Array.from(section.querySelectorAll("img")).slice(0, 4);

  if (images.length === 0) {
    await waitForFrames(1);
    return;
  }

  /*
   * Provider всё ещё держит маршрут невидимым.
   * Дожидаемся четырёх обложек до reveal, чтобы
   * ProjectImage не мог показать их по одной.
   * Таймаут страхует переход при медленной сети.
   */
  await Promise.race([
    Promise.all(images.map(waitForImage)).then(() => undefined),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2200);
    }),
  ]);

  await waitForFrames(1);
}

export default function HomeExperience() {
  const experienceRef = useRef<HTMLElement>(null);

  const transitionLockRef = useRef(false);

  const completedManagedEntryIdRef = useRef<number | null>(null);

  const { homeEntry, markHomeReady } = usePageTransition();

  /*
   * При клиентском переходе HomeExperience
   * рендерится уже с актуальным URL.
   *
   * Запоминаем target синхронно во время самого
   * первого render, чтобы transition-контейнер
   * появился скрытым сразу, ещё до layout effect.
   * Иначе один полностью готовый кадр Selected Work
   * успевает попасть на экран прямой склейкой.
   */
  const initialExternalTargetRef = useRef<HomeNavigationTarget | null>(
    homeEntry?.target ?? getExternalSceneTarget(),
  );

  const initialEntryIsManagedRef = useRef(Boolean(homeEntry));

  const sceneControls = useAnimationControls();

  const shouldReduceMotion = useReducedMotion();

  const { progress, rawProgress } = useTimeline(experienceRef);

  const heroProgress = useSceneProgress(progress, homeTimeline.hero);

  const heroRawProgress = useSceneProgress(rawProgress, homeTimeline.hero);

  const whatProgress = useSceneProgress(progress, homeTimeline.what);

  const featuredProgress = useSceneProgress(progress, homeTimeline.featured);

  /*
   * Внешняя сцена Selected Work должна успеть
   * полностью собраться ещё до начала exit-фазы.
   *
   * Поэтому внутреннюю анимацию карточек заканчиваем
   * на 72% локального progress, а оставшуюся часть
   * диапазона держим в полностью готовом состоянии.
   */
  const featuredContentProgress = useTransform(
    featuredProgress,
    [0, 0.72, 1],
    [0, 1, 1],
  );

  const aboutProgress = useSceneProgress(progress, homeTimeline.about);

  const contactProgress = useSceneProgress(progress, homeTimeline.contact);

  const getTargetProgress = useCallback(
    (target: HomeNavigationTarget): number => {
      if (target === "hero") {
        return 0;
      }

      const ranges = {
        works: homeTimeline.featured,
        about: homeTimeline.about,
        contact: homeTimeline.contact,
      };

      const range = ranges[target];

      const holdDuration = Math.max(range.holdEnd - range.enterEnd, 0);

      if (target === "works") {
        /*
         * Почти конец hold-фазы: SceneLayer ещё
         * полностью непрозрачен, а remapped progress
         * FeaturedProjects уже точно равен 1.
         */
        return Math.max(range.enterEnd, range.holdEnd - 0.006);
      }

      return Math.min(range.enterEnd + holdDuration * 0.32, range.holdEnd);
    },
    [],
  );

  /*
   * Мгновенно меняет физическое положение
   * страницы без smooth scroll.
   *
   * Временно отключаем scroll-behavior,
   * потому что в globals.css у тебя,
   * вероятно, включён smooth scroll.
   */
  const jumpToProgress = useCallback(
    (targetProgress: number) => {
      const experience = experienceRef.current;

      if (!experience) {
        return;
      }

      const experienceRect = experience.getBoundingClientRect();

      const experienceTop = window.scrollY + experienceRect.top;

      const scrollableDistance = Math.max(
        experience.offsetHeight - window.innerHeight,
        0,
      );

      const clampedProgress = Math.min(Math.max(targetProgress, 0), 1);

      const targetScrollY =
        experienceTop + scrollableDistance * clampedProgress;

      const html = document.documentElement;

      const body = document.body;

      const previousHtmlBehavior =
        html.style.getPropertyValue("scroll-behavior");

      const previousHtmlPriority =
        html.style.getPropertyPriority("scroll-behavior");

      const previousBodyBehavior =
        body.style.getPropertyValue("scroll-behavior");

      const previousBodyPriority =
        body.style.getPropertyPriority("scroll-behavior");

      /*
       * priority: important нужен на случай,
       * если smooth scroll в globals.css тоже
       * объявлен через !important.
       */
      html.style.setProperty("scroll-behavior", "auto", "important");

      body.style.setProperty("scroll-behavior", "auto", "important");

      window.scrollTo({
        left: 0,
        top: targetScrollY,
        behavior: "instant" as ScrollBehavior,
      });

      /*
       * useTimeline сглаживает scrollYProgress
       * через useSpring. Одного scrollTo здесь
       * недостаточно: пружина продолжила бы
       * проходить через промежуточные сцены.
       *
       * jump() мгновенно синхронизирует
       * визуальный progress с новой физической
       * позицией и сбрасывает скорость пружины.
       */
      rawProgress.jump(clampedProgress);
      progress.jump(clampedProgress);

      /*
       * Возвращаем исходный scroll-behavior
       * только после того, как браузер
       * применил мгновенную позицию.
       */
      requestAnimationFrame(() => {
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
      });
    },
    [progress, rawProgress],
  );

  const navigateToScene = useCallback(
    async (target: HomeNavigationTarget) => {
      if (transitionLockRef.current) {
        return false;
      }

      transitionLockRef.current = true;

      const targetProgress = getTargetProgress(target);

      try {
        /*
         * Reduced motion:
         * просто мгновенно открываем сцену.
         */
        if (shouldReduceMotion) {
          jumpToProgress(targetProgress);

          await waitForFrames(2);

          sceneControls.set({
            opacity: 1,
            filter: "blur(0px)",
          });

          return true;
        }

        /*
         * Шаг 1.
         *
         * Текущая настоящая сцена
         * растворяется и уходит в blur.
         */
        await sceneControls.start({
          ...hiddenSceneState,
          transition: sceneExitTransition,
        });

        /*
         * Шаг 2.
         *
         * Экран сейчас полностью невидим.
         * Мгновенно переставляем реальный scroll.
         *
         * Пользователь не видит движения
         * через промежуточные секции.
         */
        jumpToProgress(targetProgress);

        /*
         * Даём useTimeline несколько кадров,
         * чтобы он обновил progress и отрисовал
         * правильную целевую сцену.
         */
        await waitForFrames(2);

        if (target === "works") {
          await waitForSelectedWorkMedia();
        }

        /*
         * Поздняя browser restoration больше не
         * сможет сдвинуть spring через другие сцены.
         */
        jumpToProgress(targetProgress);
        await waitForFrames(1);

        /*
         * Шаг 3.
         *
         * Настоящая целевая сцена
         * плавно появляется из того же blur(18px),
         * в котором исчезла предыдущая сцена.
         *
         * Между exit и enter фильтр больше не
         * получает второе, более сильное значение.
         */
        await sceneControls.start({
          ...visibleSceneState,
          transition: sceneRevealTransition,
        });

        return true;
      } finally {
        transitionLockRef.current = false;
      }
    },
    [getTargetProgress, jumpToProgress, sceneControls, shouldReduceMotion],
  );

  useLayoutEffect(() => {
    /*
     * Provider очищает завершённый request после
     * каскада. Не запускаем из-за этого повторный
     * hash-вход: сцена уже стоит в нужной точке.
     */
    if (!homeEntry && completedManagedEntryIdRef.current !== null) {
      sceneControls.set(visibleSceneState);
      return;
    }

    /*
     * При переходе через Home target приходит
     * напрямую из PageTransitionProvider.
     * Hash нужен только для прямой ссылки,
     * перезагрузки и настоящего browser Back.
     */
    const target =
  homeEntry?.target ??
  getExternalSceneTarget() ??
  "hero";

    const managedRequestId = homeEntry?.id ?? null;

    /*
     * При управляемом переходе внешний provider
     * уже держит весь новый маршрут невидимым.
     * Внутреннюю сцену можно сразу подготовить
     * полностью видимой. Для прямого URL-входа
     * сохраняем локальный blur → focus.
     */
    sceneControls.set(
      shouldReduceMotion || managedRequestId !== null
        ? visibleSceneState
        : hiddenSceneState,
    );

    jumpToProgress(getTargetProgress(target));

    if (shouldReduceMotion) {
      if (target === "works") {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}#selected-work`,
        );
      }

      if (managedRequestId !== null) {
        completedManagedEntryIdRef.current = managedRequestId;
        markHomeReady(managedRequestId);
      }

      return;
    }

    let isCancelled = false;

    void waitForFrames(2).then(async () => {
      if (isCancelled) {
        return;
      }

      /*
       * Браузер может восстановить старый scroll
       * уже после layout effect. Повторный jump
       * перед reveal окончательно фиксирует Works.
       */
      jumpToProgress(getTargetProgress(target));

      await waitForFrames(1);

      if (isCancelled) {
        return;
      }

      if (target === "works") {
        await waitForSelectedWorkMedia();
      }

      if (isCancelled) {
        return;
      }

      /*
       * После загрузки обложек ещё раз фиксируем
       * целевую hold-зону, пока страница скрыта.
       */
      jumpToProgress(getTargetProgress(target));
      await waitForFrames(1);

      if (isCancelled) {
        return;
      }

      if (managedRequestId !== null) {
        /*
         * Это единственная точка, где новый
         * маршрут получает право появиться.
         * К этому моменту scroll-progress уже
         * дважды зафиксирован внутри hold-зоны
         * Selected Works.
         */
        sceneControls.set(visibleSceneState);
        completedManagedEntryIdRef.current = managedRequestId;
        markHomeReady(managedRequestId);
      } else {
        await sceneControls.start({
          ...visibleSceneState,
          transition: sceneRevealTransition,
        });
      }

      if (!isCancelled && target === "works") {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}#selected-work`,
        );
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    getTargetProgress,
    homeEntry?.id,
    homeEntry?.target,
    jumpToProgress,
    markHomeReady,
    sceneControls,
    shouldReduceMotion,
  ]);

  const navigateToSelectedWork = useCallback(async () => {
    const didNavigate = await navigateToScene("works");

    if (!didNavigate) {
      return;
    }

    window.history.replaceState(window.history.state, "", "#selected-work");
  }, [navigateToScene]);

  return (
    <>
      <Navbar variant="home" progress={progress} onNavigate={navigateToScene} />

      <main
        id="home-experience"
        ref={experienceRef}
        className={["relative", "overflow-x-clip", "bg-[var(--color-bg)]"].join(
          " ",
        )}
        style={{
          height: `${HOME_EXPERIENCE_HEIGHT}svh`,
        }}
      >
        <div
          className={[
            "sticky top-0",
            "h-svh w-full",
            "[@media(width:414px)_and_(orientation:portrait)]:!h-[calc(100dvh+2px)]",
            "overflow-hidden",
            "bg-[var(--color-bg)]",
          ].join(" ")}
        >
          {/*
           * Все настоящие секции находятся
           * внутри одного transition-контейнера.
           *
           * Он исчезает, пока scroll мгновенно
           * переставляется на новую сцену,
           * а затем проявляется обратно.
           */}

          <motion.div
            initial={
              initialExternalTargetRef.current &&
              !initialEntryIsManagedRef.current &&
              !shouldReduceMotion
                ? hiddenSceneState
                : visibleSceneState
            }
            animate={sceneControls}
            suppressHydrationWarning
            className={[
              "absolute inset-0",
              "origin-center",
              "transform-gpu",
              "will-change-[opacity,filter,transform]",
            ].join(" ")}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            {/* Hero */}

            <SceneLayer
              progress={progress}
              range={homeTimeline.hero}
              preset={{
                enterY: 0,
                exitY: 0,
                enterScale: 1,
                exitScale: 1.008,
                enterBlur: 0,
                exitBlur: 6,
              }}
              className="z-10"
            >
              <HeroContent
                progress={heroProgress}
                rawProgress={heroRawProgress}
              />
            </SceneLayer>

            {/* What We Do */}

            <SceneLayer
              progress={progress}
              range={homeTimeline.what}
              preset={{
                enterY: 0,
                exitY: -24,
                enterScale: 1,
                exitScale: 1.008,
                enterBlur: 0,
                exitBlur: 6,
              }}
              className="z-20"
            >
              <WhatWeDoContent
                progress={whatProgress}
                onNavigateToSelectedWork={navigateToSelectedWork}
              />
            </SceneLayer>

            {/* Selected Work */}

            <SceneLayer
              progress={progress}
              range={homeTimeline.featured}
              preset={{
                enterY: 48,
                exitY: -30,
                enterScale: 0.985,
                exitScale: 1.008,
                enterBlur: 10,
                exitBlur: 6,
              }}
              className="z-30"
            >
              <FeaturedProjects progress={featuredContentProgress} />
            </SceneLayer>

            {/* About */}

            <SceneLayer
              progress={progress}
              range={homeTimeline.about}
              preset={{
                enterY: 38,
                exitY: -22,
                enterScale: 0.99,
                exitScale: 1,
                enterBlur: 10,
                exitBlur: 8,
              }}
              className="z-40"
            >
              <AboutContent progress={aboutProgress} />
            </SceneLayer>

            {/* Contact */}

            <SceneLayer
              progress={progress}
              range={homeTimeline.contact}
              preset={{
                enterY: 64,
                exitY: 0,
                enterScale: 0.99,
                exitScale: 1,
                enterBlur: 10,
                exitBlur: 0,
              }}
              className="z-50"
            >
              <ContactContent progress={contactProgress} />
            </SceneLayer>
          </motion.div>
        </div>
      </main>

      {/*
       * Прозрачная блокировка кликов
       * здесь не нужна: transitionLockRef
       * уже защищает от повторной навигации.
       */}
    </>
  );
}