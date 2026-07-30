"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import {
  type PageTransitionIntent,
  usePageTransition,
} from "@/components/transitions/PageTransitionProvider";

type TransitionLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  transitionIntent?: PageTransitionIntent;
  scroll?: boolean;
} & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children" | "className"
>;

export default function TransitionLink({
  href,
  children,
  className = "",
  transitionIntent = "default",
  scroll,
  onClick,
  ...linkProps
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  return (
    <Link
      href={href}
      scroll={scroll}
      className={className}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        void navigate({
          href,
          event,
          intent: transitionIntent,
          scroll,
        });
      }}
      {...linkProps}
    >
      {children}
    </Link>
  );
}