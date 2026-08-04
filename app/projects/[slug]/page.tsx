import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectPageView from "@/components/projects/ProjectPageView";
import {
  getProjectCover,
  getProjectGallery,
  getProjectGalleryItems,
  getProjectVideos,
} from "@/lib/project-media";
import {
  getNextProject,
  getPreviousProject,
  getProjectBySlug,
  projects,
} from "@/lib/projects";
import {
  createPageMetadata,
  makeMetaDescription,
} from "@/lib/seo";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return projects.map(
    (project) => ({
      slug: project.slug,
    }),
  );
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;

  const project =
    getProjectBySlug(slug);

  if (!project) {
    return createPageMetadata({
      title: "Project not found",
      description: "The requested project could not be found.",
      path: `/projects/${slug}`,
      noIndex: true,
    });
  }

  const description = makeMetaDescription(project.description);
  const cover = getProjectCover(project.slug);

  return createPageMetadata({
    title: project.title,
    description,
    path: `/projects/${project.slug}`,
    image: cover,
    imageAlt: `${project.title} — ${project.category} by EZ Production`,
  });
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;

  const project =
    getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const previousProject =
    getPreviousProject(slug);

  const nextProject =
    getNextProject(slug);

  const cover =
    getProjectCover(slug);

  const videos =
    getProjectVideos(slug);

  const gallery =
    getProjectGallery(slug);

  const galleryItems =
    getProjectGalleryItems(slug);

  const previousProjectCover =
    previousProject
      ? getProjectCover(
          previousProject.slug,
        )
      : "";

  const nextProjectCover =
    nextProject
      ? getProjectCover(
          nextProject.slug,
        )
      : "";

  return (
    <ProjectPageView
      project={project}
      cover={cover}
      videos={videos}
      gallery={gallery}
      galleryItems={galleryItems}
      previousProject={
        previousProject
      }
      previousProjectCover={
        previousProjectCover
      }
      nextProject={nextProject}
      nextProjectCover={
        nextProjectCover
      }
    />
  );
}
