import { ReactNode } from "react";

type SectionSpacing = "compact" | "default" | "generous";

type SectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  spacing?: SectionSpacing;
};

const spacingClasses: Record<SectionSpacing, string> = {
  compact: "py-24 md:py-32",
  default: "py-32 md:py-40",
  generous: "py-40 md:py-52 lg:py-60",
};

export default function Section({
  children,
  id,
  className = "",
  spacing = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 bg-[var(--color-bg)] ${spacingClasses[spacing]} ${className}`}
    >
      {children}
    </section>
  );
}