import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote'
import type { MDXComponents } from 'mdx/types'
import { getLocalBlogPost, getBlogPosts } from '../../utils/mdx'
import { LocalBlogPost } from '../types'
import { MDXImage } from '@/app/components/mdx-image'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts
    .filter((post): post is LocalBlogPost => post.type === 'local')
    .map((post) => ({
      slug: post.slug,
    }))
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const post = await getLocalBlogPost(props.params.slug)
  
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

const components: MDXComponents = {
  img: MDXImage,
}

// @ts-ignore -- Next.js 15.1 type issue workaround
export default async function BlogPostPage(props: any) {
  const post = await getLocalBlogPost(props.params.slug)

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
        <MDXRemote 
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              development: process.env.NODE_ENV === 'development'
            }
          }}
        />
      </article>
    </div>
  )
}

export const revalidate = 3600 // Revalidate every hour 