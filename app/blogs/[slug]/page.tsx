import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import type { MDXComponents } from 'mdx/types'
import { getLocalBlogPost, getBlogPosts, LocalBlogPost } from '../../utils/mdx'
import { MDXImage } from '@/app/components/mdx-image'

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts
    .filter((post): post is LocalBlogPost => post.type === 'local')
    .map((post) => ({
      slug: post.slug,
    }))
}

type PageProps = {
  params: { slug: string }
  searchParams: Record<string, string | string[] | undefined>
}

const components: MDXComponents = {
  img: MDXImage,
}

const BlogPostPage = async ({ params }: PageProps) => {
  const post = await getLocalBlogPost(params.slug)

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

export default BlogPostPage

export const revalidate = 3600 // Revalidate every hour 