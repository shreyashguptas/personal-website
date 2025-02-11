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
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        {/* Blog Header */}
        <header className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            {format(new Date(blog.date), 'MMMM yyyy')}
          </p>
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
          {blog.description && (
            <p className="text-xl text-muted-foreground">{blog.description}</p>
          )}
        </header>

        {/* Blog Content */}
        <div className="mt-8">
          <MDXContent source={blog.source} />
        </div>
      </article>
    )
  } catch (error) {
    console.error('Error loading blog:', error)
    notFound()
  }
} 