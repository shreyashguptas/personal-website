import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getLocalBlogPost, getBlogPosts } from '../../utils/mdx'

export async function generateStaticParams() {
  const posts = getBlogPosts()
  return posts
    .filter((post): post is { type: 'local'; slug: string } => 
      post.type === 'local'
    )
    .map((post) => ({
      slug: post.slug,
    }))
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getLocalBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto py-8 prose prose-neutral dark:prose-invert">
      <h1 className="mb-2">{post.title}</h1>
      <div className="text-sm text-muted-foreground mb-8">{post.formattedDate}</div>
      <MDXRemote source={post.content} />
    </article>
  )
}

export const revalidate = 3600 // Revalidate every hour 