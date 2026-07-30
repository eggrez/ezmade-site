import Navbar from "@/components/navigation/Navbar";
import ProjectCard from "@/components/projects/ProjectCard";
import Reveal from "@/components/motion/Reveal";
import { projects } from "@/lib/projects";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen overflow-clip bg-[var(--color-bg)]">
      <Navbar variant="simple" />

      {/* Heading */}
      <section className="pb-24 pt-28 sm:pb-28 sm:pt-32 md:pb-36 md:pt-40 xl:pb-44">
        <div className="mx-auto w-full max-w-[2200px] px-[clamp(24px,3vw,56px)]">
          <Reveal
            preset="soft"
            amount={0.18}
            duration={1.3}
          >
            <h1 className="text-left text-[clamp(4.5rem,12vw,8.5rem)] font-medium leading-[0.9] tracking-[-0.075em] text-[var(--color-text)] sm:text-[clamp(5rem,10vw,8.5rem)] md:text-[clamp(4.5rem,8vw,8.5rem)]">
              Take a look.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section className="pb-24 sm:pb-32 md:pb-44">
        <div className="mx-auto w-full max-w-[2200px] px-[clamp(24px,3vw,56px)]">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:gap-x-10 xl:gap-y-16">
            {projects.map((project, index) => (
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
        </div>
      </section>
    </main>
  );
}