import { ReactNode } from "react";

type HeadingProps = {
  children: ReactNode;
  className?: string;
};

export default function Heading({
  children,
  className = "",
}: HeadingProps) {
  return (
    <h1
      className={`font-medium tracking-tight text-[clamp(6rem,16vw,13rem)] leading-[0.9] ${className}`}
    >
      {children}
    </h1>
  );
}