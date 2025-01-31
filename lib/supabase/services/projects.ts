import { supabase, handleDatabaseError } from '../config'
import type { Database } from '../types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface PaginatedProjects {
  projects: Project[]
  hasMore: boolean
}

export async function getAllProjects(page: number = 1, pageSize: number = 5): Promise<PaginatedProjects> {
  try {
    // Calculate range for pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Get total count for pagination
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Get paginated projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false })
      .range(from, to)

    if (error) {
      handleDatabaseError(error, 'getAllProjects')
    }

    return {
      projects: projects || [],
      hasMore: count ? from + projects.length < count : false
    }
  } catch (error) {
    handleDatabaseError(error, 'getAllProjects')
    return { projects: [], hasMore: false }
  }
} 