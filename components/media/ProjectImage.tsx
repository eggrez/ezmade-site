"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const imageRef = useRef<HTMLImageElement>(null);
  const reportReady = useCallback((image: HTMLImageElement) => {
    if (!onReady || image.naturalWidth <= 0) return;
    const loadedSource = image.currentSrc;
    void image.decode().catch(() => undefined).then(() => {
      if (imageRef.current === image && image.isConnected && image.currentSrc === loadedSource) onReady();
    });
  }, [onReady]);
  useEffect(() => {
    // A restored/cached image may already be complete and emit no new load event.
    const image = imageRef.current;
    if (image?.complete) reportReady(image);
  }, [src, reportReady]);
  if (!src) {
    return <ProjectPlaceholder title={alt} />;
  }

  const fallback = failedSource === src;
  return (
    <Image
      ref={imageRef}
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
      onLoad={event => reportReady(event.currentTarget)}
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
