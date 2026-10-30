"use client";

export const BRAND_COVER_DURATION = 2250;
export const BRAND_EXIT_DURATION = 1250;

type Props = {
  expanded: boolean;
  leaving: boolean;
  reducedMotion?: boolean;
};

// The original phone transition, shared by every route and screen size.
export default function BrandTransitionOverlay({ expanded, leaving, reducedMotion = false }: Props) {
  const visible = expanded && !leaving;
  const clip = expanded
    ? "polygon(-100% -100%, 300% -100%, -100% 300%)"
    : "polygon(-100% -100%, 100% -100%, -100% 100%)";

  return (
    <div
      aria-hidden="true"
      data-brand-transition={leaving ? "leaving" : expanded ? "covering" : "preparing"}
      className="pointer-events-auto fixed left-0 top-0 z-[2147483647] w-screen cursor-default select-none overflow-hidden touch-none"
      style={{ height: "calc(100dvh + 2px)" }}
    >
      <div
        className="absolute inset-0 bg-[var(--color-bg)]"
        style={{
          opacity: visible ? 1 : 0,
          transition: !reducedMotion && leaving ? "opacity 1000ms 80ms cubic-bezier(0.37,0,0.63,1)" : "none",
        }}
      />
      <div className="absolute left-0 top-0 flex h-svh w-full items-center justify-center px-6">
        <div
          className="relative h-[4.8rem] w-[4.8rem] transform-gpu will-change-[opacity,filter,transform]"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : leaving ? "blur(24px)" : "blur(22px)",
            transform: visible ? "scale(1)" : leaving ? "scale(1.045)" : "scale(0.97)",
            transition: reducedMotion ? "none" : leaving
              ? "opacity 700ms cubic-bezier(0.37,0,0.63,1), filter 1000ms cubic-bezier(0.22,1,0.36,1), transform 1000ms cubic-bezier(0.22,1,0.36,1)"
              : "opacity 1100ms 320ms cubic-bezier(0.22,1,0.36,1), filter 1350ms 260ms cubic-bezier(0.16,1,0.3,1), transform 1350ms 260ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full overflow-visible text-black">
            <path d="M44.851 64h15.13C62.201 64 64 62.209 64 60V44.851L44.851 64Z" fill="none" stroke="currentColor" strokeWidth="1.15" vectorEffect="non-scaling-stroke" />
            <path d="M64 39.181V4c0-2.209-1.799-4-4.019-4H4.019C1.799 0 0 1.791 0 4v55.999C0 62.209 1.799 64 4.019 64h35.162L64 39.181Z" fill="none" stroke="currentColor" strokeWidth="1.15" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg
            viewBox="0 0 64 64"
            className="absolute inset-0 h-full w-full text-black will-change-[clip-path]"
            style={{
              WebkitClipPath: clip,
              clipPath: clip,
              transition: reducedMotion ? "none" : "clip-path 1000ms 1050ms cubic-bezier(0.16,1,0.3,1), -webkit-clip-path 1000ms 1050ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <path d="M44.851 64h15.13C62.201 64 64 62.209 64 60V44.851L44.851 64Z" fill="currentColor" />
            <path d="M64 39.181V4c0-2.209-1.799-4-4.019-4H4.019C1.799 0 0 1.791 0 4v55.999C0 62.209 1.799 64 4.019 64h35.162L64 39.181Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
