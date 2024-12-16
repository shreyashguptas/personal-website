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
    <div className="flex flex-col space-y-6">
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
                className="block w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </Link>
            );

        return (
          <ProjectWrapper key={project.title}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                {showImages && project.image && (
                  <div className="relative w-72 h-48 flex-shrink-0">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold hover:text-gray-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500">{project.year}</p>
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
            </div>
          </ProjectWrapper>
        );
      })}
    </div>
  )
}

