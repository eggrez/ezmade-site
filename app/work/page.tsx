import type { Metadata } from "next";

import Navbar from "@/components/navigation/Navbar";
import WorkPortfolio from "@/components/work/WorkPortfolio";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work — EZ Production",
  description:
    "Explore direction, color grading, editing, sound design and 3D work by EZ Production.",
};

export default function WorkPage() {
  return (
  <main className="min-h-screen overflow-clip bg-white">
      <Navbar variant="simple" />

      <WorkPortfolio projects={projects} />
    </main>
  );
}