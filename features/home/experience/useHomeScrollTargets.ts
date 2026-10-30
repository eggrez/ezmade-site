"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import type { HomeNavigationTarget } from "@/components/navigation/Navbar";
import { centeredContentOffset, layoutOffsetWithin } from "@/lib/home-navigation";

function navbarHeight() {
  const header = document.querySelector<HTMLElement>("header");
  if (header) return header.getBoundingClientRect().height;
  // The Navbar mounts through a portal after hydration. Match its clamped
  // logo and vertical padding while preparing a direct section link.
  const width = document.documentElement.clientWidth;
  return Math.min(48, Math.max(34, width * 0.026))
    + 2 * Math.min(20, Math.max(14, width * 0.0135));
}

export function useHomeScrollTargets(experienceRef: RefObject<HTMLElement | null>) {
  const tailRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const experience = experienceRef.current;
    const tail = tailRef.current;
    const section = experience?.querySelector<HTMLElement>('[data-home-scene="contact"]');
    const content = section?.querySelector<HTMLElement>("[data-home-content]");
    if (!experience || !tail || !section || !content) return;

    let cancelled = false;
    let frame = 0;
    let observedNavbar: HTMLElement | null = null;
    const measure = () => {
      if (cancelled) return;
      const header = document.querySelector<HTMLElement>("header");
      if (header && header !== observedNavbar) {
        observer.observe(header);
        observedNavbar = header;
      }
      const navSize = `${navbarHeight()}px`;
      if (experience.style.getPropertyValue("--home-navbar-height") !== navSize) {
        experience.style.setProperty("--home-navbar-height", navSize);
      }
      const bottomSpace = Math.max(24, (window.innerHeight - navbarHeight() - content.offsetHeight) / 2);
      const existingPadding = Math.max(0, section.offsetHeight - layoutOffsetWithin(content, section) - content.offsetHeight);
      const height = Math.ceil(Math.max(32, bottomSpace - existingPadding));
      if (Math.abs(tail.offsetHeight - height) >= 1) tail.style.height = `${height}px`;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    observer.observe(content);
    window.addEventListener("resize", schedule, { passive: true });
    measure();
    schedule();
    void document.fonts.ready.then(schedule);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [experienceRef]);

  const getTargetProgress = useCallback((target: HomeNavigationTarget) => {
    if (target === "hero") return 0;
    const experience = experienceRef.current;
    const section = experience?.querySelector<HTMLElement>(`[data-home-scene="${target}"]`);
    if (!experience || !section) return 0;
    const content = section.querySelector<HTMLElement>("[data-home-content]") ?? section;
    const distance = Math.max(experience.offsetHeight - window.innerHeight, 0);
    const offset = centeredContentOffset(
      layoutOffsetWithin(content, experience), content.offsetHeight, window.innerHeight, navbarHeight(),
    );
    return distance > 0 ? Math.min(offset / distance, 1) : 0;
  }, [experienceRef]);

  return { getTargetProgress, tailRef };
}
