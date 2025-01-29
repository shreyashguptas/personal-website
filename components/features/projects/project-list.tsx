'use client'

import { Project } from '@/app/projects/types'
import Link from 'next/link'
import Image from 'next/image'

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-16">
      {projects.map((project, index) => (
        <div key={project.id}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 max-w-[calc(100%-432px)] space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {new Date(project.date).getFullYear() === currentYear ? 'Present' : new Date(project.date).getFullYear()}
                </p>
                <h2 className="text-2xl font-semibold">{project.title}</h2>
              </div>
              
              <p className="text-muted-foreground">{project.details}</p>
              
              {project.url && (
                <Link
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  View
                </Link>
              )}
            </div>

            <div className="w-full md:w-[400px] aspect-[4/3] relative rounded-lg overflow-hidden">
              {project.image && (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              )}
            </div>
          </div>
          
          {/* Add divider if not the last project */}
          {index < projects.length - 1 && (
            <div className="mt-16 border-t border-border" />
          )}
        </div>
      ))}
    </div>
  )
} 