import type { Metadata } from "next";

export const SITE_NAME = "EZ";
export const SITE_TITLE = "EZ — Made easy.";
export const SITE_DESCRIPTION =
  "Creative production studio for direction, editing, color grading, sound design and 3D. Made easy.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ezmade.pro"
).replace(/\/+$/, "");

export const DEFAULT_SOCIAL_IMAGE =
  "/projects/fractal-design/cover-v4.jpg";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function makeMetaDescription(description: string, maxLength = 160) {
  const normalized = description.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const candidate = normalized.slice(0, maxLength - 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const boundary = lastSpace > maxLength * 0.7 ? lastSpace : candidate.length;

  return `${candidate
    .slice(0, boundary)
    .replace(/[,:;вЂ”-]+$/u, "")
    .trim()}вЂ¦`;
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_SOCIAL_IMAGE,
  imageAlt = `${SITE_NAME} selected work`,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = `${title} вЂ” ${SITE_NAME}`;

 return {
  title: {
    absolute: SITE_TITLE,
  },
  description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: image,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
  };
}

