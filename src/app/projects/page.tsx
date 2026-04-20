import Container from "@/app/_components/container";
import { Intro } from "@/app/_components/intro";
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
    <Container className="animate-fade-in">
      <Intro
        eyebrow="The Projects"
        title="Work, selected."
        description="Software and hardware I've built — shipped tools and experiments."
      />
      {allProjects.length > 0 && (
        <section className="py-6 md:py-10">
          <ProjectsList projects={allProjects} />
        </section>
      )}
    </Container>
  );
}
