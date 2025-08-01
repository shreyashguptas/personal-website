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
    <div className={`flex flex-col ${hasImage ? 'md:flex-row' : ''} items-start gap-12 py-12`}>
      {/* Left side - Project info */}
      <div className="flex-1">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{extractYearFromDate(project.date)}</div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          {project.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {project.description}
        </p>
        {project.projectUrl && project.projectUrl.trim() !== "" && (
          <Link
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            View Project
          </Link>
        )}
      </div>
      
      {/* Right side - Project image (only if image exists) */}
      {hasImage && (
        <div className="w-full md:w-[600px] rounded-lg overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            width={600}
            height={400}
            className="w-full h-auto object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}
    </div>
  );
} 