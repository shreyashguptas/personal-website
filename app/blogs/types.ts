/** Status of the blog post - either published (visible to users) or draft (only visible to admin) */
export type BlogStatus = 'published' | 'draft'

/** Tag for the blog post */
export type BlogTag = 
  | 'Technology' 
  | 'Politics' 
  | 'Business'
  | 'Personal'
  | 'Finance'
  | 'AI'
  | 'Career'

/** Base interface for creating a new blog post */
export interface CreateBlogInput {
  /** Title of the blog post - appears as the main heading */
  title: string

  /** Brief summary of the blog post - appears in blog list and metadata */
  description: string

  /** Full content of the blog post in MDX format */
  content: string

  /** Publication date in ISO format (e.g., "2024-01-24") */
  date: string

  /** Current status of the blog post */
  status: BlogStatus

  /** Tag for the blog post */
  tag: BlogTag
}

/** Represents a blog post in the Supabase database */
export interface Blog extends CreateBlogInput {
  /** Unique identifier for the blog post (UUID) */
  id: string

  /** URL-friendly version of the title used in the blog post URL (auto-generated) */
  slug: string

  /** Timestamp when the blog post was first created */
  created_at: string

  /** Timestamp when the blog post was last modified */
  updated_at: string
}

/** Extends the Blog type with a formatted date string for display */
export type BlogWithFormattedDate = Blog & {
  /** Date formatted for display (e.g., "January 24, 2024") */
  formattedDate: string
}
  
  