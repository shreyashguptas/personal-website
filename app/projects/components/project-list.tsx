import { Project } from '../types'
import Link from 'next/link'

interface ProjectListProps {
  projects: Project[]
  showTags?: boolean
}

export function ProjectList({ projects, showTags = true }: ProjectListProps) {
  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <div
          key={project.title}
          className="border-b pb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link 
                href={project.githubUrl}
                className="block group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors">
                  {project.title}
                </h2>
              </Link>
              <p className="text-muted-foreground">{project.year}</p>
            </div>
            {showTags && (
              <div className="flex flex-wrap gap-2 items-start">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

