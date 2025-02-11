import { getBlogBySlug } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx/mdx-content'
import type { Metadata } from 'next'
import { format } from 'date-fns'

// Force dynamic rendering for blog posts
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
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

export default async function BlogPage(props: PageProps) {
  try {
    const { slug } = await props.params
    const blog = await getBlogBySlug(slug)

    if (!blog) {
      notFound()
    }

    return (
      <article className="max-w-3xl mx-auto">
        {/* Blog Header */}
        <header className="mb-16 space-y-4">
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight">
            {blog.title}
          </h1>
          
          {/* Date */}
          <p className="text-sm text-muted-foreground">
            {format(new Date(blog.date), 'MMMM yyyy')}
          </p>
        </header>

        {/* Blog Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent source={blog.source} />
        </div>
      </article>
    )
  } catch (error) {
    console.error('Error loading blog:', error)
    notFound()
  }
} 