import { notFound } from 'next/navigation'
import { getBlogBySlug, getAllBlogs, DatabaseError } from '@/lib/supabase'
import { MDXContent } from '@/components/mdx/mdx-content'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateStaticParams() {
  try {
    const posts = await getAllBlogs()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  try {
    const post = await getBlogBySlug(resolvedParams.slug)
    
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

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  try {
    const post = await getBlogBySlug(resolvedParams.slug)

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
          <MDXContent source={post.source} />
        </article>
      </div>
    )
  } catch (error) {
    if (error instanceof DatabaseError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <h1 className="text-2xl font-bold">Unable to Load Blog Post</h1>
          <p className="text-muted-foreground">
            We're having trouble connecting to our database. Please try again later.
          </p>
        </div>
      )
    }
    console.error('Error loading blog post:', error)
    notFound()
  }
} 