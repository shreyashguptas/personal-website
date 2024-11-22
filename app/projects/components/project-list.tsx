"use client"

import { Project } from '../types'
import Link from 'next/link'
import { useState } from 'react'

interface ProjectListProps {
  projects: Project[]
  showTags?: boolean
}

export function ProjectList({ projects, showTags = true }: ProjectListProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProject = (title: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <div
          key={project.title}
          className="border-b pb-8 last:border-b-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              {project.details ? (
                <button
                  onClick={() => toggleProject(project.title)}
                  className="block group w-full text-left"
                >
                  <h2 className="text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors break-words">
                    {project.title}
                  </h2>
                </button>
              ) : (
                <Link 
                  href={project.githubUrl!}
                  className="block group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2 className="text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors break-words">
                    {project.title}
                  </h2>
                </Link>
              )}
              <p className="text-muted-foreground">{project.year}</p>
            </div>
            {showTags && (
              <div className="flex flex-nowrap gap-2 items-center shrink-0">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {project.details && expandedProjects.has(project.title) && (
            <div className="mt-4 text-muted-foreground">
              <p>{project.details}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

