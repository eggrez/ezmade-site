import type { MetadataRoute } from "next";

import { disciplines } from "@/lib/disciplines";
import { getProjectCover } from "@/lib/project-media";
import { projects } from "@/lib/projects";
import { DEFAULT_SOCIAL_IMAGE, absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
      images: [absoluteUrl(DEFAULT_SOCIAL_IMAGE)],
    },
    {
      url: absoluteUrl("/work"),
      changeFrequency: "monthly",
      priority: 0.9,
      images: projects.map((project) =>
        absoluteUrl(getProjectCover(project.slug)),
      ),
    },
  ];

  const disciplineRoutes: MetadataRoute.Sitemap = disciplines.map(
    (discipline) => ({
      url: absoluteUrl(`/work/${discipline.slug}`),
      changeFrequency: "monthly",
      priority: 0.75,
    }),
  );

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    changeFrequency: "yearly",
    priority: 0.8,
    images: [absoluteUrl(getProjectCover(project.slug))],
  }));

  return [...staticRoutes, ...disciplineRoutes, ...projectRoutes];
}
