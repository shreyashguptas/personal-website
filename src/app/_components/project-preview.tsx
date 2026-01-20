import Image from "next/image";
import Link from "next/link";
import { type Project } from "@/interfaces/project";
import { extractYearFromDate } from "@/lib/utils";

type Props = {
  project: Project;
};

export function ProjectPreview({ project }: Props) {
  const hasImage = project.image && project.image.trim() !== "";

  return (
    <div className={`group flex flex-col ${hasImage ? 'md:flex-row' : ''} items-start gap-8 md:gap-12 py-10 md:py-12`}>
      {/* Left side - Project info */}
      <div className="flex-1">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-black text-white text-xs font-semibold mb-4">
          {extractYearFromDate(project.date)}
        </div>
        {project.projectUrl && project.projectUrl.trim() !== "" ? (
          <Link
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl md:text-3xl font-bold tracking-tight mb-4 group-hover:text-muted-foreground transition-colors duration-200 block"
          >
            {project.title}
          </Link>
        ) : (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {project.title}
          </h2>
        )}
        <p className="text-foreground/80 leading-relaxed text-base md:text-lg">
          {project.description}
        </p>
      </div>
      
      {/* Right side - Project image (only if image exists) */}
      {hasImage && (
        project.projectUrl && project.projectUrl.trim() !== "" ? (
          <Link
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-[600px] rounded-xl overflow-hidden shadow-premium-md group-hover:shadow-premium-lg transition-shadow duration-300 ring-1 ring-border/50 block"
          >
            <Image
              src={project.image}
              alt={project.title}
              width={600}
              height={400}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </Link>
        ) : (
          <div className="w-full md:w-[600px] rounded-xl overflow-hidden shadow-premium-md group-hover:shadow-premium-lg transition-shadow duration-300 ring-1 ring-border/50">
            <Image
              src={project.image}
              alt={project.title}
              width={600}
              height={400}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )
      )}
    </div>
  );
} 