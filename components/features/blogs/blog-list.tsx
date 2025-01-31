'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { BlogWithFormattedDate, BlogTag, PaginatedBlogs } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BlogListProps {
  initialPosts: BlogWithFormattedDate[]
  availableTags: BlogTag[]
  hasMore: boolean
  onLoadMore: (page: number) => Promise<PaginatedBlogs>
}

export function BlogList({ initialPosts, availableTags, hasMore: initialHasMore, onLoadMore }: BlogListProps) {
  const [posts, setPosts] = useState<BlogWithFormattedDate[]>(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [selectedTag, setSelectedTag] = useState<BlogTag | 'all'>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    try {
      setLoading(true)
      const nextPage = page + 1
      const data = await onLoadMore(nextPage)
      
      setPosts(prev => {
        // Create a Set of existing post IDs for efficient lookup
        const existingIds = new Set(prev.map(p => p.id))
        // Only add posts that don't already exist
        const uniqueNewPosts = data.blogs.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNewPosts]
      })
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, onLoadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  const filteredPosts = selectedTag === 'all' 
    ? posts 
    : posts.filter(post => post.tag === selectedTag)

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a tag" />
          </SelectTrigger>
          <SelectContent>
            {['all', ...availableTags].map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Blog Posts */}
      <div className="space-y-24">
        {filteredPosts.map((post, index) => (
          <div key={post.id}>
            {/* Mobile Layout */}
            <div className="md:hidden space-y-8">
              {/* Date */}
              <p className="text-sm text-muted-foreground">
                {post.formattedDate}
              </p>

              {/* Title */}
              <h2 className="text-2xl font-semibold">{post.title}</h2>

              {/* Description */}
              <p className="text-muted-foreground">{post.description}</p>

              {/* Content Preview Card */}
              <div className="w-full relative rounded-lg overflow-hidden">
                <Link 
                  href={`/blogs/${post.slug}`}
                  className="block group"
                >
                  <Card className="p-8 bg-muted/50 transition-colors hover:bg-muted group-hover:border-primary">
                    <p className="text-base text-muted-foreground leading-relaxed line-clamp-[6]">
                      {post.content}
                    </p>
                  </Card>
                </Link>
              </div>

              {/* Read Button */}
              <div>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Read Post
                </Link>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex gap-8 items-start">
              <div className="flex-1 max-w-[calc(100%-632px)] space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{post.formattedDate}</p>
                  <h2 className="text-2xl font-semibold">{post.title}</h2>
                </div>
                
                <p className="text-muted-foreground">{post.description}</p>
                
                <Link
                  href={`/blogs/${post.slug}`}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Read Post
                </Link>
              </div>

              <Link 
                href={`/blogs/${post.slug}`}
                className="block w-[600px] group"
              >
                <Card className="h-[300px] p-8 bg-muted/50 transition-colors hover:bg-muted group-hover:border-primary">
                  <p className="text-base text-muted-foreground leading-relaxed line-clamp-[10]">
                    {post.content}
                  </p>
                </Card>
              </Link>
            </div>

            {/* Divider */}
            {index < filteredPosts.length - 1 && (
              <div className="mt-16 border-t border-border" />
            )}
          </div>
        ))}

        {/* Intersection Observer target */}
        {hasMore && (
          <div 
            ref={observerTarget} 
            className="h-10 flex items-center justify-center"
          >
            {loading && (
              <div className="text-sm text-muted-foreground">Loading more blogs...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 