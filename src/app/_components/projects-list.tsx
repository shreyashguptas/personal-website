import { type Project } from "@/interfaces/project";
import { ProjectPreview } from "./project-preview";

type Props = {
  projects: Project[];
};

export function ProjectsList({ projects }: Props) {
  return (
    <div className="mt-16">
      {projects.map((project, index) => (
        <div key={project.slug}>
          <ProjectPreview project={project} />
          {/* Separator line between projects */}
          {index < projects.length - 1 && (
            <div className="mx-8">
              <hr className="border-gray-200" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 