"use client"

import { Project } from '../types'
import Link from 'next/link'
import Image from 'next/image'

interface ProjectListProps {
  projects: Project[]
  showTags?: boolean
  showImages?: boolean
}

export function ProjectList({ projects, showTags = true, showImages = false }: ProjectListProps) {
  return (
    <div className="flex flex-col space-y-6">
      {projects.map((project) => (
        <Link 
          key={project.title}
          href={project.githubUrl!}
          className="block w-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
            <div className="flex flex-col md:flex-row h-full">
              {showImages && (
                <div className="relative w-full md:w-72 h-48 flex-shrink-0">
                  <Image
                    src={project.image || '/images/project-placeholder.jpg'}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4 md:p-6 flex flex-col">
                <div className="space-y-3 md:space-y-4 flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="text-lg md:text-xl font-semibold hover:text-gray-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 sm:ml-4 sm:whitespace-nowrap">{project.year}</p>
                  </div>

                  {showTags && project.tags && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 md:py-1 bg-gray-100 text-gray-600 rounded-full text-xs md:text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm flex-1 line-clamp-3 md:line-clamp-none">
                    {project.details || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

