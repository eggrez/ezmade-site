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

export default function WorkPage() {
  return (
  <main className="min-h-screen overflow-clip bg-white">
      <Navbar variant="simple" />

      <WorkPortfolio projects={projects} />
    </main>
  );
}
