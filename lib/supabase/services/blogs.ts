import { supabase, handleDatabaseError } from '../config'
import type { Database } from '../types'
import { format } from 'date-fns'
import { compileMDX } from '@/lib/mdx'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

type Blog = Database['public']['Tables']['blogs']['Row']
type BlogInsert = Database['public']['Tables']['blogs']['Insert']
type BlogUpdate = Database['public']['Tables']['blogs']['Update']

export interface BlogWithFormattedDate extends Blog {
  formattedDate: string
}

export interface BlogWithMDX extends BlogWithFormattedDate {
  source: MDXRemoteSerializeResult
}

export async function getAllBlogs(): Promise<BlogWithFormattedDate[]> {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false })

    if (error) throw error

    return blogs.map(blog => ({
      ...blog,
      formattedDate: format(new Date(blog.date), 'MMMM d, yyyy')
    }))
  } catch (error) {
    return handleDatabaseError(error, 'getAllBlogs')
  }
}

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