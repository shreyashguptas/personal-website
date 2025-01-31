import { supabase, handleDatabaseError } from '../config'
import type { Database, BlogStatus, BlogTag } from '../types'
import { format } from 'date-fns'
import { compileMDX } from '@/lib/mdx'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

type Blog = Database['public']['Tables']['blogs']['Row']
type BlogInsert = Database['public']['Tables']['blogs']['Insert']
type BlogUpdate = Database['public']['Tables']['blogs']['Update']

export interface BlogWithFormattedDate {
  id: string
  title: string
  description: string
  content: string
  date: string
  formattedDate: string
  slug: string
  status: BlogStatus
  tag: BlogTag
}

export interface BlogWithMDX extends BlogWithFormattedDate {
  source: MDXRemoteSerializeResult
  formattedDate: string
}

export interface PaginatedBlogs {
  blogs: BlogWithFormattedDate[]
  hasMore: boolean
}

/**
 * Get all published blog slugs for static path generation
 * @returns Array of blog slugs
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('slug')
      .eq('status', 'published')
      .order('date', { ascending: false })

    if (error) {
      handleDatabaseError(error, 'getAllBlogSlugs')
      return []
    }

    return blogs.map(blog => blog.slug)
  } catch (error) {
    console.error('Error getting blog slugs:', error)
    return []
  }
}

/**
 * Get paginated blog posts
 * @param page Page number (1-based)
 * @param pageSize Number of posts per page
 * @returns Paginated blog posts with hasMore flag
 */
export async function getAllBlogs(page: number = 1, pageSize: number = 10): Promise<PaginatedBlogs> {
  try {
    // Calculate range for pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Get total count for pagination
    const { count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get paginated blogs
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('id, title, description, content, date, slug, status, tag')
      .eq('status', 'published')
      .order('date', { ascending: false })
      .range(from, to)

    if (error) {
      handleDatabaseError(error, 'getAllBlogs')
      return { blogs: [], hasMore: false }
    }

    const formattedBlogs = blogs.map((blog): BlogWithFormattedDate => ({
      ...blog,
      formattedDate: format(new Date(blog.date), 'MMMM d, yyyy'),
      content: blog.content.slice(0, 500)
    }))

    return {
      blogs: formattedBlogs,
      hasMore: count ? from + blogs.length < count : false
    }
  } catch (error) {
    handleDatabaseError(error, 'getAllBlogs')
    return { blogs: [], hasMore: false }
  }
}

/**
 * Get a single blog post by slug
 * @param slug Blog post slug
 * @returns Blog post with MDX content or null if not found
 */
export async function getBlogBySlug(slug: string): Promise<BlogWithMDX | null> {
  try {
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) throw error
    if (!blog) return null

    const { source } = await compileMDX(blog.content)
    if (typeof source === 'string') {
      throw new Error('Error compiling MDX')
    }

    return {
      ...blog,
      source,
      formattedDate: format(new Date(blog.date), 'MMMM d, yyyy')
    }
  } catch (error) {
    return handleDatabaseError(error, `getBlogBySlug: ${slug}`)
  }
}

export async function createBlog(blog: BlogInsert): Promise<Blog> {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .insert([blog])
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('No data returned from insert')

    return data
  } catch (error) {
    return handleDatabaseError(error, 'createBlog')
  }
}

export async function updateBlogStatus(slug: string, status: Blog['status']): Promise<Blog> {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .update({ status })
      .eq('slug', slug)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('No data returned from update')

    return data
  } catch (error) {
    return handleDatabaseError(error, `updateBlogStatus: ${slug}`)
  }
}

export async function getUniqueTags(): Promise<Blog['tag'][]> {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('tag')
      .eq('status', 'published')
      .order('tag')

    if (error) throw error

    return Array.from(new Set(blogs.map(blog => blog.tag)))
  } catch (error) {
    return handleDatabaseError(error, 'getUniqueTags')
  }
} 