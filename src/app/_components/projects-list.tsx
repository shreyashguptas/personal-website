import { type Project } from "@/interfaces/project";
import { ProjectPreview } from "./project-preview";

type Props = {
  projects: Project[];
};

export function ProjectsList({ projects }: Props) {
  return (
    <div className="mt-2">
      {projects.map((project, index) => (
        <div key={project.slug} id={project.slug}>
          <ProjectPreview project={project} />
          {/* Separator line between projects - spans full content width */}
          {index < projects.length - 1 && (
            <hr className="border-gray-200 dark:border-gray-700 border-t-[0.5px]" />
          )}
        </div>
      ))}
    </div>
  );
} 