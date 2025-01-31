import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

// Export the Supabase client and error handling utilities
export { supabase, DatabaseError, handleDatabaseError } from './config'

// Export database types
export type { Database } from './types'
export type { BlogStatus, BlogTag } from './types'

// Export blog-related functionality
export {
  type BlogWithFormattedDate,
  type BlogWithMDX,
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlogStatus,
  getUniqueTags,
} from './services/blogs'

// Export reading-related functionality
export {
  type ReadingWithFormattedDate,
  getAllReadings,
  getUniqueReadingTags,
  createReading,
  updateReading,
  deleteReading,
} from './services/readings'

// Export project-related functionality
export {
  type PaginatedProjects,
  getAllProjects,
} from './services/projects'

export function getStorageFileUrl(bucket: string, path: string) {
  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)
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