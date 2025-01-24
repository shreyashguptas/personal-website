import { notFound } from 'next/navigation'
import { getBlogBySlug, getAllBlogs } from '../service'
import { MDXContent } from '@/app/components/mdx-content'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = await getAllBlogs()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Ensure params is resolved
  const slug = (await Promise.resolve(params)).slug
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
}

export default async function BlogPostPage({ params }: Props) {
  // Ensure params is resolved
  const slug = (await Promise.resolve(params)).slug
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
}

// Revalidate every hour
export const revalidate = 3600 