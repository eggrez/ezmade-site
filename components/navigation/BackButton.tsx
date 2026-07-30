"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { useProjectTransition } from "@/components/transitions/ProjectTransitionProvider";

type BackButtonProps = {
  fallbackHref: string;
  className?: string;
};

export default function BackButton({
  fallbackHref,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const {
    isTransitioning,
    startProjectReturn,
  } = useProjectTransition();

  function handleBack(
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

    if (isTransitioning) {
      return;
    }

    const didStartProjectReturn =
      startProjectReturn(fallbackHref);

    if (didStartProjectReturn) {
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <a
      href={fallbackHref}
      onClick={handleBack}
      className={className}
    >
      Back
    </a>
  );
}