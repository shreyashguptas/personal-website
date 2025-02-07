'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { BlogWithFormattedDate } from '@/lib/supabase'

interface BlogCardProps {
  blog: BlogWithFormattedDate
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <article key={blog.id} className="flex flex-col space-y-4">
      {/* Date */}
      <p className="text-sm text-muted-foreground">
        {blog.formattedDate}
      </p>

      {/* Title */}
      <h2 className="text-2xl font-semibold">{blog.title}</h2>

      {/* Description */}
      <p className="text-muted-foreground">{blog.description}</p>

      {/* Content Preview */}
      <Link 
        href={`/blogs/${blog.slug}`}
        className="block group flex-1"
      >
        <Card className="h-full p-6 bg-muted/50 transition-colors hover:bg-muted group-hover:border-primary">
          <p className="text-base text-muted-foreground leading-relaxed line-clamp-[8]">
            {blog.content}
          </p>
        </Card>
      </Link>

      {/* Read Button */}
      <div>
        <Link
          href={`/blogs/${blog.slug}`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Read Post
        </Link>
      </div>
    </article>
  )
} 