'use client'

import Link from 'next/link'
import { BlogWithFormattedDate } from '@/lib/supabase'

interface BlogPreviewListProps {
  posts: BlogWithFormattedDate[]
}

export function BlogPreviewList({ posts }: BlogPreviewListProps) {
  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blogs/${post.slug}`}
          className="block p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <div className="text-sm text-muted-foreground">{post.formattedDate}</div>
            </div>
            <span className="text-sm text-muted-foreground px-3 py-1 bg-primary/10 rounded-full">
              {post.tag}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
} 