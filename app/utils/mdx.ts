import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { format, parse } from 'date-fns'
import { posts as substackPosts } from '../blogs/data'
import { BlogPost, LocalBlogPost, SubstackBlogPost } from '../blogs/types'

const BLOGS_PATH = path.join(process.cwd(), 'app/blogs/content')

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
              date: date,
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

  // Convert Substack posts to common format and ensure they have the correct type
  const formattedSubstackPosts: SubstackBlogPost[] = (substackPosts as { title: string; date: Date; url: string }[]).map(post => ({
    title: post.title,
    date: new Date(post.date),
    url: post.url,
    type: 'substack' as const
  }))

  // Combine and sort all posts
  return [...localPosts, ...formattedSubstackPosts]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
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
      date: date,
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