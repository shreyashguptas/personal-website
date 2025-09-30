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
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
          {extractYearFromDate(project.date)}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 group-hover:text-muted-foreground transition-colors duration-200">
          {project.title}
        </h2>
        <p className="text-foreground/80 mb-6 leading-relaxed text-base md:text-lg">
          {project.description}
        </p>
        {project.projectUrl && project.projectUrl.trim() !== "" && (
          <Link
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-premium-sm hover:shadow-premium-md"
            data-cursor-intent="hover"
          >
            View Project
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        )}
      </div>
      
      {/* Right side - Project image (only if image exists) */}
      {hasImage && (
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
      )}
    </div>
  );
} 