"use client";

import Image from "next/image";
import { useState } from "react";
import { projectImageLoader } from "@/lib/project-images";

import ProjectPlaceholder from "@/components/projects/ProjectPlaceholder";

type ProjectImageProps = {
  src?: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  onReady?: () => void;
};

export default function ProjectImage({
  src,
  alt,
  className = "",
  sizes,
  priority = false,
  loading,
  fetchPriority,
  onReady,
}: ProjectImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!src) {
    return <ProjectPlaceholder title={alt} />;
  }

  const fallback = failedSource === src;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      loader={fallback ? undefined : projectImageLoader}
      unoptimized={fallback}
      sizes={sizes}
      preload={priority}
      loading={priority ? undefined : loading ?? "lazy"}
      fetchPriority={priority ? undefined : fetchPriority}
      decoding="async"
      onLoad={event => {
        const image = event.currentTarget;
        if (image.naturalWidth > 0) void image.decode().catch(() => undefined).then(() => onReady?.());
      }}
      onError={() => { if (!fallback) setFailedSource(src); }}
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
