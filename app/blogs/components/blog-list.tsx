import { BlogPost } from '../types'
import Link from 'next/link'

interface BlogListProps {
  posts: BlogPost[]
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div
          key={post.title}
          className="border-b pb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link 
                href={post.url}
                className="block group"
              >
                <h2 className="text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground">
                {post.date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

