import { supabase } from '@/lib/supabase'
import { Blog, BlogWithFormattedDate, CreateBlogInput, BlogTag, BlogStatus } from './types'
import { format } from 'date-fns'
import { unstable_cache } from 'next/cache'
import { compileMDX } from '@/lib/mdx'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

// Cache time: 24 hours in seconds
const CACHE_DURATION = 24 * 60 * 60

// Function to get cache key based on request time
function getCacheKey() {
  // Round to nearest minute to prevent too many cache entries
  const timestamp = Math.floor(Date.now() / (60 * 1000))
  return `blogs-list-${timestamp}`
}

export async function getAllBlogs(): Promise<BlogWithFormattedDate[]> {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error)
    return []
  }

  return blogs.map((blog) => ({
    ...blog,
    formattedDate: format(new Date(blog.date), 'MMMM d, yyyy')
  })) as BlogWithFormattedDate[]
}

export async function getBlogBySlug(slug: string): Promise<(BlogWithFormattedDate & { source: MDXRemoteSerializeResult }) | null> {
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !blog) {
    console.error('Error fetching blog:', error)
    return null
  }

  // Compile MDX content
  const { source } = await compileMDX(blog.content)
  
  if (typeof source === 'string') {
    console.error('Error compiling MDX for blog:', slug)
    return null
  }

  return {
    ...blog,
    source,
    formattedDate: format(new Date(blog.date), 'MMMM d, yyyy')
  } as BlogWithFormattedDate & { source: MDXRemoteSerializeResult }
}

export async function createBlog(blog: CreateBlogInput): Promise<Blog | null> {
  const { data, error } = await supabase
    .from('blogs')
    .insert([blog])
    .select()
    .single()

  if (error) {
    console.error('Error creating blog:', error)
    return null
  }

  return data
}

export async function updateBlogStatus(slug: string, status: 'published' | 'draft'): Promise<Blog | null> {
  const { data, error } = await supabase
    .from('blogs')
    .update({ status })
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    console.error('Error updating blog status:', error)
    return null
  }

  return data
}

// Function to force revalidate all blog pages
export async function revalidateAllBlogs(): Promise<void> {
  try {
    // Get all blogs to revalidate their individual caches
    const { data: blogs } = await supabase
      .from('blogs')
      .select('slug')
    
    if (blogs) {
      // Revalidate each blog's cache
      for (const blog of blogs) {
        await unstable_cache(
          async () => Promise.resolve(undefined),
          [`blog-${blog.slug}`],
          {
            revalidate: 0, // Immediate revalidation
            tags: ['blogs', `blog-${blog.slug}`]
          }
        )()
      }
    }

    // Revalidate the main blogs list cache
    await unstable_cache(
      async () => Promise.resolve(undefined),
      ['blogs-list'],
      {
        revalidate: 0,
        tags: ['blogs']
      }
    )()
  } catch (error) {
    console.error('Error revalidating blogs:', error)
  }
}

// Add this new function to get unique tags
export async function getUniqueTags(): Promise<BlogTag[]> {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('tag')
    .eq('status', 'published')
    .order('tag')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  // Get unique tags
  const uniqueTags = Array.from(new Set(blogs.map(blog => blog.tag)))
  return uniqueTags as BlogTag[]
} 