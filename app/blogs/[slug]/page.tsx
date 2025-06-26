import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: post.author ? [post.author.name] : undefined,
      images: post.coverImage ? [post.coverImage] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt
    }
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-8 text-center">
        {post.coverImage && (
          <div className="relative aspect-[16/9] mb-8 overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          {post.author && (
            <div className="flex items-center space-x-2">
              {post.author.picture && (
                <Image
                  src={post.author.picture}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <span>{post.author.name}</span>
            </div>
          )}
          <span>•</span>
          <time>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </header>

      <div 
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
} 