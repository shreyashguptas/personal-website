'use client'

import { useState, useEffect, useRef } from 'react'
import { BlogWithFormattedDate, PaginatedBlogs } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'

interface BlogListProps {
  initialBlogs: BlogWithFormattedDate[]
  availableTags: string[]
  hasMore: boolean
  onLoadMore: (page: number) => Promise<PaginatedBlogs>
}

export function BlogList({ initialBlogs, availableTags, hasMore: initialHasMore, onLoadMore }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogWithFormattedDate[]>(initialBlogs)
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
  const [selectedTag, setSelectedTag] = useState<string>('all')
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

  // Filter blogs based on selected tag
  const filteredBlogs = selectedTag === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.tag === selectedTag)

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Blog Posts */}
      <div className="space-y-24">
        {filteredBlogs.map((blog, index) => (
          <div key={blog.id}>
            <article>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Blog Info */}
                <div className="flex-1 flex flex-col justify-between py-6">
                  <div className="space-y-4">
                    {/* Date */}
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(blog.date), 'MMMM yyyy')}
                    </p>

                    {/* Title */}
                    <a href={`/blogs/${blog.slug}`} className="block group">
                      <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                        {blog.title}
                      </h2>
                    </a>
                  </div>

                  {/* Read Button */}
                  <div>
                    <a
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Read Post
                    </a>
                  </div>
                </div>

                {/* Right Column - Content Preview */}
                <div className="flex-1">
                  <a href={`/blogs/${blog.slug}`} className="block group h-full">
                    <Card className="h-full p-6 bg-muted/50 transition-colors group-hover:bg-muted group-hover:border-primary">
                      <p className="text-base text-muted-foreground leading-relaxed line-clamp-[8] overflow-hidden">
                        {blog.content.trim() + '...'}
                      </p>
                    </Card>
                  </a>
                </div>
              </div>
            </article>

            {/* Divider */}
            {index < filteredBlogs.length - 1 && (
              <div className="mt-16 border-t border-border" />
            )}
          </div>
        ))}
      </div>

      {/* Intersection Observer target */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="h-8 flex items-center justify-center"
        >
          {loading && (
            <div className="text-sm text-muted-foreground">Loading more blogs...</div>
          )}
        </div>
      )}
    </div>
  )
} 