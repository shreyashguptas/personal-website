import Link from "next/link";
import { type Project } from "@/interfaces/project";

type Props = {
  project: Project;
};

export function MinimalProjectHighlight({ project }: Props) {
  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">Featured Project</div>
        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
      </div>
      
      <div className="space-y-2 py-3">
        {project.projectUrl ? (
          <Link
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block group-hover:translate-x-1 transition-transform duration-200"
          >
            <h3 className="text-lg font-medium leading-snug hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {project.title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-lg font-medium leading-snug">
            {project.title}
          </h3>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {project.description}
        </p>
      </div>
    </div>
  );
} 