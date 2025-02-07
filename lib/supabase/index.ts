import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'
import type { Database } from './types'

// Export the Supabase client and error handling utilities
export { supabase, DatabaseError, handleDatabaseError } from './config'

// Export blog-related functionality
export {
  type BlogWithFormattedDate,
  type BlogWithMDX,
  type PaginatedBlogs,
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlogStatus,
  getUniqueTags,
} from './services/blogs'

// Export project-related functionality
export {
  type PaginatedProjects,
  getAllProjects,
} from './services/projects'

// Export reading-related functionality
export {
  type ReadingWithFormattedDate,
  getAllReadings,
  createReading,
  updateReading,
  deleteReading,
  getUniqueReadingTags,
} from './services/readings'

// Export database types
export type { Database, BlogStatus, BlogTag } from './types'

// Utility functions
export function getStorageFileUrl(bucket: string, path: string) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function getOptimizedImageUrl(url: string, width = 700, height?: number, quality = 80) {
  // Don't transform GIFs as it might break animation
  if (url.toLowerCase().endsWith('.gif')) return url
  
  const params = new URLSearchParams()
  params.append('width', width.toString())
  if (height) params.append('height', height.toString())
  params.append('quality', quality.toString())
  params.append('format', 'webp')
  
  return `${url}?${params.toString()}`
} 