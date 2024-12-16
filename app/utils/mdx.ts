import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { format, parse } from 'date-fns'
import { posts as substackPosts } from '../blogs/data'

const BLOGS_PATH = path.join(process.cwd(), 'app/blogs/content')

export type LocalBlogPost = {
  slug: string
  title: string
  date: string
  formattedDate: string
  description: string
  content: string
  type: 'local'
}

export type SubstackBlogPost = {
  title: string
  date: Date
  url: string
  type: 'substack'
}

export type BlogPost = LocalBlogPost | SubstackBlogPost

export async function getBlogPosts(): Promise<BlogPost[]> {
  // Get local MDX posts
  let localPosts: LocalBlogPost[] = []
  
  try {
    const exists = await fs.stat(BLOGS_PATH).catch(() => false)
    if (exists) {
      const files = await fs.readdir(BLOGS_PATH)
      const postsPromises = files
        .filter((file) => file.endsWith('.mdx'))
        .map(async (file) => {
          try {
            const filePath = path.join(BLOGS_PATH, file)
            const fileContent = await fs.readFile(filePath, 'utf8')
            const { data, content } = matter(fileContent)
            
            const date = parse(data.date, 'yyyy/MM/dd', new Date())
            
            return {
              slug: file.replace('.mdx', ''),
              title: data.title,
              date: data.date,
              formattedDate: format(date, 'MMMM yyyy'),
              description: data.description,
              content,
              type: 'local' as const
            }
          } catch (error) {
            console.error(`Error processing ${file}:`, error)
            return null
          }
        })
      
      const posts = await Promise.all(postsPromises)
      localPosts = posts.filter((post): post is LocalBlogPost => post !== null)
    }
  } catch (error) {
    console.error('Error reading blog posts:', error)
  }

  // Convert Substack posts to common format
  const formattedSubstackPosts: SubstackBlogPost[] = substackPosts.map(post => ({
    ...post,
    type: 'substack' as const
  }))

  // Combine and sort all posts
  return [...localPosts, ...formattedSubstackPosts]
    .sort((a, b) => {
      const dateA = a.type === 'local' ? new Date(a.date) : a.date
      const dateB = b.type === 'local' ? new Date(b.date) : b.date
      return dateB.getTime() - dateA.getTime()
    })
}

export async function getLocalBlogPost(slug: string): Promise<LocalBlogPost | null> {
  try {
    const filePath = path.join(BLOGS_PATH, `${slug}.mdx`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    
    const date = parse(data.date, 'yyyy/MM/dd', new Date())
    
    return {
      slug,
      title: data.title,
      date: data.date,
      formattedDate: format(date, 'MMMM yyyy'),
      description: data.description,
      content,
      type: 'local'
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
} 