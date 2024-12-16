import Link from 'next/link'
import { getBlogPosts } from '../utils/mdx'
import { format } from 'date-fns'

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Blogs</h1>
      <div className="grid gap-6">
        {posts.map((post) => {
          const formattedDate = post.type === 'local' 
            ? post.formattedDate 
            : format(post.date, 'MMMM yyyy')
          
          return (
            <Link
              key={post.type === 'local' ? post.slug : post.url}
              href={post.type === 'local' ? `/blogs/${post.slug}` : post.url}
              target={post.type === 'local' ? undefined : '_blank'}
              rel={post.type === 'local' ? undefined : 'noopener noreferrer'}
              className="block p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <div className="text-sm text-muted-foreground mb-4">{formattedDate}</div>
              {post.type === 'local' && (
                <p className="text-muted-foreground">{post.description}</p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export const revalidate = 3600 // Revalidate every hour

