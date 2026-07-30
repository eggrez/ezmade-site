import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1500px] px-[clamp(32px,4vw,72px)] ${className}`}
    >
      {children}
    </div>
  );
}