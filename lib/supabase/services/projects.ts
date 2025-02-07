import { supabase } from '../config'
import type { Database } from '../types'
import { cache } from 'react'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface PaginatedProjects {
  projects: Project[]
  hasMore: boolean
}

/**
 * Get paginated projects with caching
 */
export const getAllProjects = cache(async (page: number = 1, pageSize: number = 10): Promise<PaginatedProjects> => {
  try {
    // First verify the table exists and is accessible
    const { error: tableError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('Error accessing projects table:', tableError)
      return { projects: [], hasMore: false }
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching projects:', error)
      return { projects: [], hasMore: false }
    }

    if (!projects) {
      return { projects: [], hasMore: false }
    }

    // Sort pinned projects to the top
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return {
      projects: sortedProjects,
      hasMore: count ? from + projects.length < count : false
    }
  } catch (error) {
    console.error('Error in getAllProjects:', error)
    return { projects: [], hasMore: false }
  }
}) 