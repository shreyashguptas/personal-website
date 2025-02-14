import { getBlogBySlug } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx/mdx-content'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { Suspense } from 'react'
import { BlogSkeleton } from '@/components/skeletons/blog-skeleton'

// Dynamic route configuration
export const dynamic = 'error'      // Proper error handling
export const dynamicParams = true   // Enable dynamic parameters
export const revalidate = 3600      // Cache invalidation time (1 hour)

interface PageProps {
  params: Promise<{ slug: string }> // Note: params must be treated as a Promise
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const { slug } = await props.params
    const blog = await getBlogBySlug(slug)

    if (!blog) {
      return {
        title: 'Blog Not Found',
        description: 'The requested blog post could not be found.'
      }
    }

    return {
      title: blog.title,
      description: blog.description,
      openGraph: {
        title: blog.title,
        description: blog.description,
        type: 'article',
        publishedTime: new Date(blog.date).toISOString(),
        authors: ['Shreyash Gupta']
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.description
      }
    }
  } catch (error) {
    console.error(`Error generating metadata for blog:`, error)
    return {
      title: 'Error',
      description: 'An error occurred while loading the blog post.'
    }
  }
}

export default async function BlogPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  if (!blog.source) {
    throw new Error('Blog content could not be processed')
  }

  return (
    <article className="max-w-3xl mx-auto py-8 space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">{blog.title}</h1>
        <p className="text-muted-foreground">
          {format(new Date(blog.date), 'MMMM d, yyyy')}
        </p>
      </header>
      
      <Suspense fallback={<BlogSkeleton />}>
        <MDXContent source={blog.source} />
      </Suspense>
    </article>
  )
} 