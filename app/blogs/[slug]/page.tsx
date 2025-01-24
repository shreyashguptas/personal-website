import { notFound } from 'next/navigation'
import { getBlogBySlug, getAllBlogs } from '../service'
import { MDXContent } from '@/app/components/mdx-content'
import type { Metadata } from 'next'
import { ReactElement } from 'react'

// Configure dynamic route behavior
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllBlogs()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getBlogBySlug(slug)
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
      }
    }

    return {
      title: post.title,
      description: post.description,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Error Loading Blog Post',
    }
  }
}

export default async function BlogPostPage({ params }: PageProps): Promise<ReactElement> {
  try {
    const { slug } = await params
    const post = await getBlogBySlug(slug)

    if (!post) {
      notFound()
    }

    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Blog Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          <div className="text-base text-muted-foreground">
            {post.formattedDate}
          </div>
        </header>

        {/* Blog Content */}
        <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
          <MDXContent content={post.content} />
        </article>
      </div>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    notFound()
  }
} 