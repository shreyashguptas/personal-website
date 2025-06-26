import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import Image from 'next/image'

export default function BlogsPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-lg text-muted-foreground">
          Stories and ideas from my journey
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blogs/${post.slug}`} className="block space-y-3">
                {post.coverImage && (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <time className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

