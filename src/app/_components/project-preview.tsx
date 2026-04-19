import Image from "next/image";
import Link from "next/link";
import { type Project } from "@/interfaces/project";
import { extractYearFromDate } from "@/lib/utils";

type Props = {
  project: Project;
};

export function ProjectPreview({ project }: Props) {
  const hasImage = project.image && project.image.trim() !== "";
  const hasUrl = Boolean(project.projectUrl && project.projectUrl.trim() !== "");

  return (
    <article className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-12">
      {/* Eyebrow: tabular year */}
      <div className="md:col-span-2">
        <p className="label-eyebrow tabular">
          {extractYearFromDate(project.date)}
        </p>
      </div>

      {/* Title + description */}
      <div className={hasImage ? "md:col-span-6" : "md:col-span-10"}>
        {hasUrl ? (
          <Link
            href={project.projectUrl!}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-intent="hover"
            className="block hover:text-muted-foreground transition-colors"
          >
            <h2 className="display-md">
              {project.title}
            </h2>
          </Link>
        ) : (
          <h2 className="display-md">{project.title}</h2>
        )}
        <p className="mt-4 font-serif text-lg leading-relaxed text-muted-foreground max-w-xl">
          {project.description}
        </p>
        {hasUrl && (
          <a
            href={project.projectUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center text-sm font-medium underline decoration-border hover:decoration-foreground underline-offset-4"
            data-cursor-intent="hover"
          >
            Visit project →
          </a>
        )}
      </div>

      {/* Image */}
      {hasImage && (
        <div className="md:col-span-4">
          {hasUrl ? (
            <Link
              href={project.projectUrl!}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-intent="hover"
              className="block overflow-hidden border border-border"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Image
                src={project.image}
                alt={project.title}
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </Link>
          ) : (
            <div
              className="overflow-hidden border border-border"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Image
                src={project.image}
                alt={project.title}
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
