import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getLocalBlogPost, getBlogPosts, LocalBlogPost } from '../../utils/mdx'

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

const BlogPostPage = async ({ params }: PageProps) => {
  const post = await getLocalBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto py-8 prose prose-neutral dark:prose-invert">
      <h1 className="mb-2">{post.title}</h1>
      <div className="text-sm text-muted-foreground mb-8">{post.formattedDate}</div>
      <div className="mdx-content">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}

export default BlogPostPage

export const revalidate = 3600 // Revalidate every hour 