import { ReactNode } from "react";

type TextProps = {
  children: ReactNode;
  className?: string;
};

export default function Text({
  children,
  className = "",
}: TextProps) {
  return (
    <p className={`text-lg text-neutral-600 ${className}`}>
      {children}
    </p>
  );
}