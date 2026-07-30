import type { ReactNode } from "react";

type WideContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function WideContainer({
  children,
  className = "",
}: WideContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1760px] px-[clamp(24px,3vw,56px)] ${className}`}
    >
      {children}
    </div>
  );
}