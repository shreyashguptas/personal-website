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
import { BlogCard } from './blog-card'

interface BlogListProps {
  initialBlogs: BlogWithFormattedDate[]
  availableTags: BlogTag[]
  hasMore: boolean
  onLoadMore: (page: number) => Promise<PaginatedBlogs>
}

export function BlogList({ initialBlogs, availableTags, hasMore: initialHasMore, onLoadMore }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogWithFormattedDate[]>(initialBlogs)
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
  const [selectedTag, setSelectedTag] = useState<BlogTag | 'all'>('all')
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleIntersection = async (entries: IntersectionObserverEntry[]): Promise<void> => {
      const firstEntry = entries[0];
      if (!firstEntry?.isIntersecting || !hasMore || loading) {
        return;
      }

      setLoading(true);
      try {
        const nextPage = page + 1;
        const { blogs: newBlogs, hasMore: newHasMore } = await onLoadMore(nextPage);
        
        setBlogs(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewBlogs = newBlogs.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewBlogs];
        });
        
        setHasMore(newHasMore);
        setPage(nextPage);
      } catch (error) {
        console.error(
          'Error loading more blogs:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 1.0,
      rootMargin: '100px'
    });

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, onLoadMore, page]);

  // Update blogs when initialBlogs changes
  useEffect(() => {
    setBlogs(initialBlogs);
  }, [initialBlogs]);

  const filteredPosts = selectedTag === 'all' 
    ? blogs 
    : blogs.filter(post => post.tag === selectedTag)

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
        <div className="grid gap-8 md:grid-cols-2">
          {filteredPosts.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

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