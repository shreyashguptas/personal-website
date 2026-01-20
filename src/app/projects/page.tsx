import Container from "@/app/_components/container";
import { ProjectsList } from "@/app/_components/projects-list";
import { getAllProjects } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Shreyash Gupta",
  description: "Selected projects by Shreyash Gupta.",
  alternates: { canonical: absoluteUrl("/projects") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/projects"),
    title: "Projects | Shreyash Gupta",
    description: "Selected projects by Shreyash Gupta.",
  },
  twitter: {
    card: "summary",
    title: "Projects | Shreyash Gupta",
    description: "Selected projects by Shreyash Gupta.",
  },
};

export default function ProjectsPage() {
  const allProjects = getAllProjects();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <div className="mt-16 relative z-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight font-serif">
            <span className="text-foreground">Project</span>
            <span className="text-gradient-green">.</span>
          </h1>
        </div>
        
        {allProjects.length > 0 && <ProjectsList projects={allProjects} />}
      </Container>
    </main>
  );
} 