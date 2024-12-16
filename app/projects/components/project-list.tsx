"use client"

import { Project } from '../types'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface ProjectListProps {
  projects: Project[]
  showTags?: boolean
  showImages?: boolean
}

export function ProjectList({ projects, showTags = true, showImages = false }: ProjectListProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => {
        const ProjectWrapper = project.details 
          ? ({ children }: { children: React.ReactNode }) => (
              <button
                onClick={() => toggleProject(project.title)}
                className="w-full text-left"
              >
                {children}
              </button>
            )
          : ({ children }: { children: React.ReactNode }) => (
              <Link 
                href={project.githubUrl!}
                className="block h-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </Link>
            );

        return (
          <ProjectWrapper key={project.title}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              {showImages && project.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-semibold hover:text-gray-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{project.year}</p>
                  </div>

                  {showTags && project.tags && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {!showTags && project.details && (
                    <p className="text-gray-600 text-sm">
                      {project.details}
                    </p>
                  )}
                  
                  {showTags && project.details && expandedProjects.has(project.title) && (
                    <p className="text-gray-600 text-sm">
                      {project.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ProjectWrapper>
        );
      })}
    </div>
  )
}

