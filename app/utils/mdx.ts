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

interface BlogFrontMatter {
  title: string
  date: string
  description: string
}

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
            const frontMatter = data as BlogFrontMatter
            
            const date = parse(frontMatter.date, 'yyyy/MM/dd', new Date())
            const slug = file.replace('.mdx', '')
            
            return {
              slug,
              title: frontMatter.title,
              date: frontMatter.date,
              formattedDate: format(date, 'MMMM yyyy'),
              description: frontMatter.description,
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
    // Decode the URL-encoded slug
    const decodedSlug = decodeURIComponent(slug)
    const filePath = path.join(BLOGS_PATH, `${decodedSlug}.mdx`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    const frontMatter = data as BlogFrontMatter
    
    const date = parse(frontMatter.date, 'yyyy/MM/dd', new Date())
    
    return {
      slug: decodedSlug,
      title: frontMatter.title,
      date: frontMatter.date,
      formattedDate: format(date, 'MMMM yyyy'),
      description: frontMatter.description,
      content,
      type: 'local'
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
} 