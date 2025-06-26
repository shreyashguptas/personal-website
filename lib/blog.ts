import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  coverImage?: string
  author?: {
    name: string
    picture?: string
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, `${realSlug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processedContent = await remark()
      .use(html)
      .process(content)
    const contentHtml = processedContent.toString()

    return {
      slug: realSlug,
      title: data['title'] || '',
      date: data['date'] || new Date().toISOString(),
      excerpt: data['excerpt'] || '',
      content: contentHtml,
      coverImage: data['coverImage'],
      author: data['author']
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getAllPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true })
      return []
    }

    const slugs = fs.readdirSync(postsDirectory)
    const posts = slugs
      .filter(slug => slug.endsWith('.md'))
      .map(slug => {
        const realSlug = slug.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, slug)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data } = matter(fileContents)

        return {
          slug: realSlug,
          title: data['title'] || '',
          date: data['date'] || new Date().toISOString(),
          excerpt: data['excerpt'] || '',
          content: '', // We don't need full content for listing
          coverImage: data['coverImage'],
          author: data['author']
        }
      })
      .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))

    return posts
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}