export type ProjectGalleryLayout =
  | "wide"
  | "half";

export type ProjectGalleryItem = {
  src: string;
  layout: ProjectGalleryLayout;
};

export type ProjectVideoItem = {
  src: string;
  mobileSrc?: string;
  poster: string;
  label?: string;
};

type ProjectGalleryConfigItem = {
  filename: string;
  layout: ProjectGalleryLayout;
};

type ProjectVideoConfigItem = {
  src: string;
  mobileSrc?: string;
  poster?: string;
  label?: string;
};

type ProjectMediaConfig = {
  cover: string;
  videos?: ProjectVideoConfigItem[];
  gallery: ProjectGalleryConfigItem[];
};

const projectMedia: Record<string, ProjectMediaConfig> = {
  "fractal-design": {
    cover: "cover-v4.jpg",
    videos: [{ src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4" }],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
      { filename: "05.jpg", layout: "half" },
      { filename: "06.jpg", layout: "half" },
      { filename: "07.jpg", layout: "wide" },
    ],
  },
  
"yandex-browser": {
  cover: "cover_1.jpg",

  videos: [
    {
      src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4",
      poster: "cover_1.jpg",
      label: "Film 01",
    },
    {
      src: "video-02-web-v3.mp4", mobileSrc: "video-02-mobile-v3.mp4",
      poster: "cover_2.jpg",
      label: "Film 02",
    },
    {
      src: "video-03-web-v3.mp4", mobileSrc: "video-03-mobile-v3.mp4",
      poster: "cover_3.jpg",
      label: "Film 03",
    },
    {
      src: "video-04-web-v3.mp4", mobileSrc: "video-04-mobile-v3.mp4",
      poster: "cover_4.jpg",
      label: "Film 04",
    },
    {
      src: "video-05-web-v3.mp4", mobileSrc: "video-05-mobile-v3.mp4",
      poster: "cover_5.jpg",
      label: "Film 05",
    },
  ],

  gallery: [],
},

  neopolis: {
    cover: "cover.jpg",
    videos: [{ src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4" }],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
    ],
  },
  luma: {
    cover: "cover.jpg",
    videos: [{ src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4" }],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
      { filename: "05.jpg", layout: "half" },
      { filename: "06.jpg", layout: "half" },
      { filename: "07.jpg", layout: "wide" },
    ],
  },
  "yandex-lavka": {
    cover: "cover_v2.jpg",
    videos: [{ src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4" }],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
    ],
  },
  higgsfield: {
    cover: "cover.jpg",
    videos: [{ src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4" }],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
      { filename: "05.jpg", layout: "half" },
      { filename: "06.jpg", layout: "half" },
      { filename: "07.jpg", layout: "wide" },
    ],
  },
  runway: {
    cover: "cover.jpg",
    videos: [{ src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4" }],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
    ],
  },
  "t-bank": {
    cover: "cover.jpg",
    videos: [
      {
        src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4",
        poster: "cover.jpg",
        label: "Film 01",
      },
      {
        src: "video-02-web-v3.mp4", mobileSrc: "video-02-mobile-v3.mp4",
        poster: "cover-02.jpg",
        label: "Film 02",
      },
    ],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
    ],
  },
  "infinox-x-alpine": {
    cover: "cover.jpg",
    videos: [
      {
        src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4",
        poster: "cover.jpg",
      },
    ],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
    ],
  },
  "higgsfield-02": {
    cover: "cover.jpg",
    videos: [
      {
        src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4",
        poster: "cover.jpg",
      },
    ],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
    ],
  },
  "my-father-used-to-say": {
    cover: "cover.jpg",
    videos: [
      {
        src: "video-01-web-v3.mp4", mobileSrc: "video-01-mobile-v3.mp4",
        poster: "cover.jpg",
      },
    ],
    gallery: [
      { filename: "01.jpg", layout: "wide" },
      { filename: "02.jpg", layout: "half" },
      { filename: "03.jpg", layout: "half" },
      { filename: "04.jpg", layout: "wide" },
      { filename: "05.jpg", layout: "half" },
      { filename: "06.jpg", layout: "half" },
      { filename: "07.jpg", layout: "wide" },
    ],
  },
};

const MEDIA_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL ?? "https://media.ezmade.pro";

function resolveProjectImagePath(slug: string, filename: string) {
  return `/projects/${slug}/${filename}`;
}

function resolveProjectVideoPath(slug: string, filename: string) {
  return `${MEDIA_URL}/projects/${slug}/${filename}`;
}

export function getProjectCover(slug: string) {
  const config = projectMedia[slug];

  if (!config) {
    return "";
  }

 return resolveProjectImagePath(slug, config.cover);
}

export function getProjectVideos(slug: string): ProjectVideoItem[] {
  const config = projectMedia[slug];

  if (!config?.videos) {
    return [];
  }

  return config.videos.map((video) => ({
    src: resolveProjectVideoPath(slug, video.src),
    mobileSrc: video.mobileSrc ? resolveProjectVideoPath(slug, video.mobileSrc) : undefined,
poster: resolveProjectImagePath(
  slug,
  video.poster ?? config.cover,
),
    label: video.label,
  }));
}

export function getProjectVideo(slug: string) {
  return getProjectVideos(slug)[0]?.src ?? "";
}

export function getProjectGallery(slug: string) {
  const config = projectMedia[slug];

  if (!config) {
    return [];
  }

  return config.gallery.map((item) =>
    resolveProjectImagePath(slug, item.filename),
  );
}

export function getProjectGalleryItems(slug: string): ProjectGalleryItem[] {
  const config = projectMedia[slug];

  if (!config) {
    return [];
  }

  return config.gallery.map((item) => ({
    src: resolveProjectImagePath(slug, item.filename),
    layout: item.layout,
  }));
}
