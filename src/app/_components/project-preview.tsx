import Image from "next/image";
import Link from "next/link";
import { type Project } from "@/interfaces/project";

type Props = {
  project: Project;
};

export function ProjectPreview({ project }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 py-12">
      {/* Left side - Project info */}
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-2">{project.year}</div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          {project.title}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {project.description}
        </p>
        <Link
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          View Project
        </Link>
      </div>
      
      {/* Right side - Project image */}
      <div className="w-full md:w-96 h-64 relative rounded-lg overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
} 