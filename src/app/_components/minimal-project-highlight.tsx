import Link from "next/link";
import { type Project } from "@/interfaces/project";

type Props = {
  project: Project;
};

export function MinimalProjectHighlight({ project }: Props) {
  return (
    <article>
      <p className="label-eyebrow mb-3">Featured Project</p>
      {project.projectUrl ? (
        <Link
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-intent="hover"
          className="group block"
        >
          <h3 className="display-sm transition-smooth group-hover:text-muted-foreground">
            <span className="text-tug">{project.title}</span>
          </h3>
        </Link>
      ) : (
        <h3 className="display-sm">{project.title}</h3>
      )}
      <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
        {project.description}
      </p>
    </article>
  );
}
