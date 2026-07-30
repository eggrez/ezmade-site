"use client";

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type GlassButtonVariant =
  | "primary"
  | "quiet";

type GlassButtonSize =
  | "small"
  | "default"
  | "large";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  fullWidth?: boolean;
};

type GlassButtonLinkProps = SharedProps &
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "className" | "children" | "href"
  > & {
    href: string;
  };

type GlassButtonNativeProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  > & {
    href?: never;
  };

type GlassButtonProps =
  | GlassButtonLinkProps
  | GlassButtonNativeProps;

const sizeClasses: Record<
  GlassButtonSize,
  string
> = {
  small: "px-4 py-2.5 text-sm",
  default: "px-6 py-3 text-sm",
  large: "px-8 py-3.5 text-sm",
};

const baseClasses = [
  "group relative isolate",
  "inline-flex shrink-0 items-center justify-center",
  "overflow-hidden rounded-full",
  "font-normal leading-none",
  "transition-[color,border-color,background-color,box-shadow,transform]",
  "duration-700",
  "ease-[cubic-bezier(0.22,1,0.36,1)]",
  "focus-visible:outline-none",
  "focus-visible:ring-1",
  "focus-visible:ring-black/20",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-[var(--color-bg)]",
].join(" ");

const primaryClasses = [
  "border border-black/[0.10]",
  "bg-white/[0.24]",
  "text-[var(--color-text)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_30px_rgba(17,17,17,0.04)]",
  "backdrop-blur-xl",
  "hover:scale-[1.035]",
  "hover:border-white/[0.32]",
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_14px_38px_rgba(17,17,17,0.14)]",
].join(" ");

const quietClasses = [
  "border border-transparent",
  "bg-transparent",
  "text-[var(--color-text-secondary)]",
  "hover:-translate-y-px",
  "hover:scale-[1.035]",
  "hover:border-white/[0.60]",
  "hover:bg-white/[0.34]",
  "hover:text-[var(--color-text)]",
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(17,17,17,0.085)]",
  "hover:backdrop-blur-xl",
].join(" ");

function GlassLayers({
  variant,
}: {
  variant: GlassButtonVariant;
}) {
  if (variant === "primary") {
    return (
      <>
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-0 -z-30",
            "bg-black/[0.84]",
            "opacity-0",
            "transition-opacity duration-700",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:opacity-100",
            "group-focus-visible:opacity-100",
          ].join(" ")}
        />

        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute",
            "-left-[45%] top-[-130%] -z-20",
            "h-[360%] w-[72%]",
            "rotate-[22deg]",
            "bg-gradient-to-r",
            "from-transparent via-white/45 to-transparent",
            "blur-md",
            "translate-x-0",
            "transition-transform duration-[1600ms]",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:translate-x-[240%]",
            "group-focus-visible:translate-x-[240%]",
          ].join(" ")}
        />

        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-[1px] -z-10",
            "rounded-full",
            "bg-gradient-to-b from-white/20 to-transparent",
            "opacity-70",
            "transition-opacity duration-700",
            "group-hover:opacity-100",
            "group-focus-visible:opacity-100",
          ].join(" ")}
        />
      </>
    );
  }

  return (
    <>
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-[1px] -z-30",
          "rounded-full",
          "bg-gradient-to-b",
          "from-white/55 via-white/16 to-white/5",
          "opacity-0",
          "transition-opacity duration-700",
          "group-hover:opacity-100",
          "group-focus-visible:opacity-100",
        ].join(" ")}
      />

      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-left-[55%] top-[-150%] -z-20",
          "h-[400%] w-[78%]",
          "rotate-[22deg]",
          "bg-gradient-to-r",
          "from-transparent via-white/80 to-transparent",
          "blur-md",
          "translate-x-0",
          "transition-transform duration-[1800ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:translate-x-[250%]",
          "group-focus-visible:translate-x-[250%]",
        ].join(" ")}
      />

      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "inset-x-[18%] top-0 -z-10",
          "h-px bg-white/90",
          "opacity-0",
          "transition-opacity duration-700",
          "group-hover:opacity-90",
          "group-focus-visible:opacity-90",
        ].join(" ")}
      />
    </>
  );
}

function isLinkProps(
  props: GlassButtonProps,
): props is GlassButtonLinkProps {
  return typeof props.href === "string";
}

export default function GlassButton(
  props: GlassButtonProps,
) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "default";
  const fullWidth = props.fullWidth ?? false;
  const className = props.className ?? "";

  const classes = [
    baseClasses,
    variant === "primary"
      ? primaryClasses
      : quietClasses,
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <GlassLayers variant={variant} />

      <span
        className={[
          "relative z-10",
          "transition-colors duration-700",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          variant === "primary"
            ? "group-hover:text-white group-focus-visible:text-white"
            : "",
        ].join(" ")}
      >
        {props.children}
      </span>
    </>
  );

  if (isLinkProps(props)) {
    const {
      href,
      children: _children,
      className: _className,
      variant: _variant,
      size: _size,
      fullWidth: _fullWidth,
      ...linkProps
    } = props;

    return (
      <Link
        href={href}
        className={classes}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  const {
    children: _children,
    className: _className,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    href: _href,
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button
      type={type}
      className={[
        classes,
        "disabled:pointer-events-none",
        "disabled:opacity-45",
      ].join(" ")}
      {...buttonProps}
    >
      {content}
    </button>
  );
}