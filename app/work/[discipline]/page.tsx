import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/navigation/Navbar";
import ProjectCard from "@/components/projects/ProjectCard";
import {
  disciplines,
  getDisciplineBySlug,
} from "@/lib/disciplines";
import { projects } from "@/lib/projects";
import { createPageMetadata } from "@/lib/seo";

type DisciplinePageProps = {
  params: Promise<{
    discipline: string;
  }>;
};

export function generateStaticParams() {
  return disciplines.map((discipline) => ({
    discipline: discipline.slug,
  }));
}

export async function generateMetadata({
  params,
}: DisciplinePageProps): Promise<Metadata> {
  const { discipline: slug } = await params;
  const discipline = getDisciplineBySlug(slug);

  if (!discipline) {
    return createPageMetadata({
      title: "Work not found",
      description: "The requested work category could not be found.",
      path: `/work/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: discipline.title,
    description: `Selected ${discipline.title.toLowerCase()} work by EZ Production.`,
    path: `/work/${discipline.slug}`,
  });
}

export default async function DisciplinePage({
  params,
}: DisciplinePageProps) {
  const { discipline: slug } = await params;
  const discipline = getDisciplineBySlug(slug);

  if (!discipline) {
    notFound();
  }

  const filteredProjects = projects.filter((project) =>
    project.services.some(
      (service) =>
        service.toLowerCase() ===
        discipline.projectService.toLowerCase(),
    ),
  );

  return (
    <main className="min-h-screen overflow-clip bg-[var(--color-bg)]">
      <Navbar variant="simple" />

      {/* Discipline title */}
      <section className="flex min-h-[62svh] items-center px-[clamp(24px,3vw,56px)] pb-20 pt-28 sm:min-h-[68svh] sm:pt-32 md:min-h-[74svh] md:pb-24 md:pt-40 xl:min-h-[68svh]">
        <div className="mx-auto w-full max-w-[2200px]">
          <Reveal
            preset="soft"
            amount={0.18}
            duration={1.3}
          >
            <h1 className="text-center text-[clamp(4.5rem,14vw,10rem)] font-medium leading-[0.86] tracking-[-0.08em] text-[var(--color-text)] sm:text-[clamp(5.5rem,11vw,10rem)] md:text-[clamp(5rem,9vw,10rem)]">
              {discipline.title}
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section className="px-[clamp(24px,3vw,56px)] pb-28 sm:pb-36 md:pb-44 xl:pb-52">
        <div className="mx-auto w-full max-w-[2200px]">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:gap-x-10 xl:gap-y-16">
              {filteredProjects.map((project, index) => (
                <Reveal
                  key={project.slug}
                  preset="rise"
                  amount={0.12}
                  duration={1.1}
                  delay={index * 0.07}
                >
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal
              preset="soft"
              amount={0.24}
              duration={1.2}
            >
              <div className="flex min-h-[32vh] items-center justify-center text-center">
                <p className="max-w-[560px] text-[clamp(1.5rem,5vw,2.5rem)] leading-[1.2] tracking-[-0.045em] text-[var(--color-text-secondary)] sm:text-[clamp(1.8rem,3.5vw,2.5rem)]">
                  Work for this direction will be added soon.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  );
}
