import { BlogWithFormattedDate } from '../types'
import Link from 'next/link'

interface BlogListProps {
  posts: BlogWithFormattedDate[]
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border-b pb-8 last:border-b-0"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link 
                href={`/blogs/${post.slug}`}
                className="block group"
              >
                <h2 className="text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground">
                {post.formattedDate}
              </p>
              <p className="text-muted-foreground">{post.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

