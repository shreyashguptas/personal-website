import Link from 'next/link'
import { getAllBlogs } from './service'

export default async function BlogPage() {
  const posts = await getAllBlogs()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Blogs</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blogs/${post.slug}`}
            className="block p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <div className="text-sm text-muted-foreground mb-4">{post.formattedDate}</div>
            <p className="text-muted-foreground">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Revalidate every hour
export const revalidate = 3600

