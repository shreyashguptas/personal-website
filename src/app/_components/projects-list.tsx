import { type Project } from "@/interfaces/project";
import { ProjectPreview } from "./project-preview";

type Props = {
  projects: Project[];
};

export function ProjectsList({ projects }: Props) {
  return (
    <div className="divide-y divide-border">
      {projects.map((project) => (
        <div key={project.slug} id={project.slug}>
          <ProjectPreview project={project} />
        </div>
      ))}
    </div>
  );
}
