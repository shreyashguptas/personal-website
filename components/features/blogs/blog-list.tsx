'use client'

import { useState, useEffect, useRef } from 'react'
import { BlogWithFormattedDate, PaginatedBlogs } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Card } from "@/components/ui/card"

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
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTag('all')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
              selectedTag === 'all'
                ? "bg-primary text-primary-foreground"
                : "bg-accent/50 text-accent-foreground hover:bg-accent/70"
            )}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/50 text-accent-foreground hover:bg-accent/70"
              )}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts */}
      <div className="space-y-24">
        {filteredBlogs.map((blog, index) => (
          <div key={blog.id}>
            <article>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Blog Info */}
                <div className="flex-1 space-y-6">
                  {/* Date */}
                  <p className="text-sm text-muted-foreground">
                    {blog.formattedDate}
                  </p>

                  {/* Title */}
                  <h2 className="text-2xl font-semibold">{blog.title}</h2>

                  {/* Description */}
                  <p className="text-muted-foreground">{blog.description}</p>

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
                  <Card className="h-full p-6 bg-muted/50 hover:bg-muted transition-colors">
                    <p className="text-base text-muted-foreground leading-relaxed line-clamp-[8]">
                      {blog.content}
                    </p>
                  </Card>
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