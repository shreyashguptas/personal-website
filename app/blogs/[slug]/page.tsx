import { notFound } from 'next/navigation'
import { getBlogBySlug, getAllBlogSlugs, DatabaseError } from '@/lib/supabase'
import { MDXContent } from '@/components/mdx/mdx-content'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'error'
export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const slugs = await getAllBlogSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
    if (error instanceof DatabaseError) {
      console.error('Database error generating metadata:', error)
      return {
        title: 'Unable to Load Blog Post',
        description: 'We are experiencing technical difficulties.',
      }
    }
    console.error('Error generating metadata:', error)
    return {
      title: 'Error Loading Blog Post',
    }
  }
}

export default async function BlogPostPage({
  params,
}: PageProps): Promise<ReactElement> {
  try {
    const { slug } = await params
    const post = await getBlogBySlug(slug)
    
    if (!post) {
      notFound()
    }

    return (
      <article className="prose dark:prose-invert mx-auto">
        <h1>{post.title}</h1>
        <p className="text-muted-foreground">{post.formattedDate}</p>
        <MDXContent source={post.source} />
      </article>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    throw error
  }
} 