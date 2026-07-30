import Image from "next/image";

import ProjectPlaceholder from "@/components/projects/ProjectPlaceholder";

type ProjectImageProps = {
  src?: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export default function ProjectImage({
  src,
  alt,
  className = "",
  sizes,
  priority = false,
}: ProjectImageProps) {
  if (!src) {
    return <ProjectPlaceholder title={alt} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={95}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
      style={{
        filter: "none",
        opacity: 1,
        mixBlendMode: "normal",
        imageRendering: "auto",
      }}
      className={[
        "select-none",
        "object-cover",
        className,
      ].join(" ")}
    />
  );
}