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