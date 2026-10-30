import { getWorkFilter } from "@/lib/work-filters";
import type { Metadata } from "next";

import Navbar from "@/components/navigation/Navbar";
import WorkPortfolio from "@/components/work/WorkPortfolio";
import { projects } from "@/lib/projects";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Work",
  description:
    "Explore selected direction, color grading, editing, sound design and 3D work by EZ Production.",
  path: "/work",
});

export default async function WorkPage({ searchParams }: {
  searchParams: Promise<{ discipline?: string | string[] }>;
}) {
  const initialFilter = getWorkFilter((await searchParams).discipline);
  return (
  <main className="min-h-screen overflow-clip bg-white">
      <Navbar variant="simple" />

      <WorkPortfolio key={initialFilter} projects={projects} initialFilter={initialFilter} />
    </main>
  );
}