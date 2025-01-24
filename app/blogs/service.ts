import { supabase } from '@/lib/supabase'
import { Blog, BlogWithFormattedDate, CreateBlogInput } from './types'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'

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

  return blogs.map((blog: Blog) => ({
    ...blog,
    formattedDate: format(new Date(blog.date), 'MMMM d, yyyy')
  }))
}

export async function getBlogBySlug(slug: string): Promise<BlogWithFormattedDate | null> {
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

  return {
    ...blog,
    formattedDate: format(new Date(blog.date), 'MMMM d, yyyy')
  }
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

  // Force revalidate the blogs page and the new blog's page
  revalidatePath('/blogs')
  if (data?.slug) {
    revalidatePath(`/blogs/${data.slug}`)
  }

  return data
}

// Function to force revalidate all blog pages
export async function revalidateAllBlogs(): Promise<void> {
  try {
    // Revalidate the main blogs page
    revalidatePath('/blogs')
    
    // Get all blogs and revalidate individual pages
    const blogs = await getAllBlogs()
    for (const blog of blogs) {
      revalidatePath(`/blogs/${blog.slug}`)
    }
  } catch (error) {
    console.error('Error revalidating blogs:', error)
  }
} 