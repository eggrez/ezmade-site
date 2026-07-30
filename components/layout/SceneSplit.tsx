import type { ReactNode } from "react";

import WideContainer from "./WideContainer";

type SceneSplitLayout =
  | "balanced"
  | "wide"
  | "extra-wide";

type SceneSplitProps = {
  title: ReactNode;
  children: ReactNode;
  layout?: SceneSplitLayout;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
};

const layoutClasses: Record<
  SceneSplitLayout,
  string
> = {
  balanced:
    "lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-[clamp(96px,7vw,180px)]",

  wide:
    "lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-[clamp(180px,10vw,280px)]",

  "extra-wide":
    "lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-[clamp(220px,13vw,380px)]",
};

export default function SceneSplit({
  title,
  children,
  layout = "balanced",
  className = "",
  titleClassName = "",
  contentClassName = "",
}: SceneSplitProps) {
  return (
    <WideContainer>
      <div
        className={[
          "grid gap-12",
          layoutClasses[layout],
          className,
        ].join(" ")}
      >
        <div
          className={[
            "lg:pt-4 lg:text-right",
            titleClassName,
          ].join(" ")}
        >
          <h2
            className={[
              "text-[clamp(1.8rem,2.5vw,3.2rem)]",
              "font-medium leading-[0.95]",
              "tracking-[-0.04em]",
              "text-[var(--color-text-secondary)]",
            ].join(" ")}
          >
            {title}
          </h2>
        </div>

        <div
          className={[
            "min-w-0",
            contentClassName,
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </WideContainer>
  );
}