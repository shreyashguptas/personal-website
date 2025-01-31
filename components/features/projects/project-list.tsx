'use client'

import { Project } from '@/app/projects/types'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PaginatedProjects } from '@/lib/supabase/services/projects'

interface ProjectListProps {
  initialProjects: Project[]
  hasMore: boolean
  onLoadMore: (page: number) => Promise<PaginatedProjects>
}

export function ProjectList({ initialProjects, hasMore: initialHasMore, onLoadMore }: ProjectListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const observerTarget = useRef(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true)
          try {
            const nextPage = page + 1
            const { projects: newProjects, hasMore: newHasMore } = await onLoadMore(nextPage)
            setProjects(prev => [...prev, ...newProjects])
            setHasMore(newHasMore)
            setPage(nextPage)
          } catch (error) {
            console.error('Error loading more projects:', error)
          } finally {
            setLoading(false)
          }
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loading, onLoadMore, page])

  return (
    <div className="space-y-24">
      {projects.map((project, index) => (
        <div key={project.id}>
          {/* Mobile Layout */}
          <div className="md:hidden space-y-8">
            {/* Date */}
            <p className="text-sm text-muted-foreground">
              {new Date(project.date).getFullYear() === currentYear ? 'Present' : new Date(project.date).getFullYear()}
            </p>

            {/* Title */}
            <h2 className="text-2xl font-semibold">{project.title}</h2>

            {/* Description */}
            <p className="text-muted-foreground">{project.details}</p>

            {/* Image/Media */}
            {project.image && (
              <div className="w-full relative rounded-lg overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={1200}
                  height={675}
                  className="object-cover w-full"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            {/* View Button */}
            {project.url && (
              <div>
                <Link
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  View Project
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-8 items-start">
            <div className={cn(
              "flex-1 space-y-4",
              project.image ? "max-w-[calc(100%-732px)]" : "w-full"
            )}>
              <div className="space-y-2">
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
                  View Project
                </Link>
              )}
            </div>

            {project.image && (
              <div className="w-[700px] relative rounded-lg overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={700}
                  height={394}
                  className="object-cover w-full"
                  sizes="(min-width: 768px) 700px"
                  priority
                />
              </div>
            )}
          </div>

          {/* Divider */}
          {index < projects.length - 1 && (
            <div className="mt-16 border-t border-border" />
          )}
        </div>
      ))}

      {/* Intersection Observer target */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="h-10 flex items-center justify-center"
        >
          {loading && (
            <div className="text-sm text-muted-foreground">Loading more projects...</div>
          )}
        </div>
      )}
    </div>
  )
} 