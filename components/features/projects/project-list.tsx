'use client'

import { Project } from '@/app/projects/types'
import Link from 'next/link'
import Image from 'next/image'

interface ProjectListProps {
  projects: Project[]
  showTags?: boolean
  showImages?: boolean
}

export function ProjectList({ projects, showTags = true, showImages = false }: ProjectListProps) {
  return (
    <div className="grid gap-6">
      {projects.map((project) => (
        project.url ? (
          <Link
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex flex-col gap-4">
              {showImages && project.image && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.date).getFullYear()}
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{project.details}</p>
                
                {showTags && project.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-accent/50 text-accent-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div
            key={project.id}
            className="block p-6 rounded-lg border"
          >
            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
            <p className="text-muted-foreground">{project.details}</p>
            {showTags && project.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      ))}
    </div>
  )
} 