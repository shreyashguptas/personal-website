import { notFound } from 'next/navigation'
import { getBlogBySlug } from '@/lib/supabase/services/blogs'
import { MDXContent } from '@/components/mdx/mdx-content'
import type { Metadata } from 'next'

// Force dynamic rendering for blog posts
export const dynamic = 'force-dynamic'
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: ['Shreyash Gupta'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    }
  }
}

export default async function BlogPostPage({
  params,
}: PageProps) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)
  
  if (!post) {
    notFound()
  }

  return (
    <article className="prose dark:prose-invert mx-auto">
      <h1>{post.title}</h1>
      <div className="flex flex-col gap-4 mb-8">
        <p className="text-muted-foreground">{post.formattedDate}</p>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-sm rounded-md bg-muted">
            {post.tag}
          </span>
        </div>
      </div>
      <MDXContent source={post.source} />
    </article>
  )
} 