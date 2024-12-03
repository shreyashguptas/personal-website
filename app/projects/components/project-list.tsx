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
      {projects.map((project) => (
        <div
          key={project.title}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {showImages && (
            <div className="relative h-48 w-full">
              <Image
                src={project.image || '/images/project-placeholder.jpg'}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                {project.details ? (
                  <button
                    onClick={() => toggleProject(project.title)}
                    className="w-full text-left"
                  >
                    <h3 className="text-xl font-semibold hover:text-gray-600 transition-colors">
                      {project.title}
                    </h3>
                  </button>
                ) : (
                  <Link 
                    href={project.githubUrl!}
                    className="block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h3 className="text-xl font-semibold hover:text-gray-600 transition-colors">
                      {project.title}
                    </h3>
                  </Link>
                )}
                <p className="text-sm text-gray-500 mt-1">{project.year}</p>
              </div>
              
              {showTags && (
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
              
              {project.details && expandedProjects.has(project.title) && (
                <p className="text-gray-600 text-sm">
                  {project.details}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

