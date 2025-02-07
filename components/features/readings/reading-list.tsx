'use client'

import { useState, useEffect, useRef } from 'react'
import { ReadingWithFormattedDate, PaginatedReadings } from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface ReadingListProps {
  initialReadings: ReadingWithFormattedDate[]
  hasMore: boolean
  onLoadMore: (page: number) => Promise<PaginatedReadings>
  availableTags: string[]
}

export function ReadingList({ initialReadings, hasMore: initialHasMore, onLoadMore, availableTags }: ReadingListProps) {
  const [readings, setReadings] = useState<ReadingWithFormattedDate[]>(initialReadings)
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [selectedTag, setSelectedTag] = useState<string>('all')
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
        const { readings: newReadings, hasMore: newHasMore } = await onLoadMore(nextPage);
        
        setReadings(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewReadings = newReadings.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewReadings];
        });
        
        setHasMore(newHasMore);
        setPage(nextPage);
      } catch (error) {
        console.error(
          'Error loading more readings:',
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

  // Filter readings based on selected tag
  const filteredReadings = selectedTag === 'all' 
    ? readings 
    : readings.filter(reading => reading.tags.includes(selectedTag))

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Readings</h1>
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

      {/* Readings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReadings.map((reading) => (
          <Card
            key={reading.id}
            className="group relative overflow-hidden border transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <a
              href={reading.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 sm:p-5"
            >
              <div className="flex flex-col min-h-[140px] sm:min-h-[160px]">
                {/* Header: Title and Year */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2">
                    {reading.title}
                  </h2>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {new Date(reading.date).getFullYear()}
                  </span>
                </div>

                {/* Author */}
                <p className="text-sm text-muted-foreground mb-3">
                  by {reading.author}
                </p>

                {/* Recommendation Badge */}
                {reading.recommendation && (
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3 w-fit">
                    Top {reading.recommendation} Pick
                  </span>
                )}

                {/* Tags Section */}
                <div className="mt-auto pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {reading.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-2.5 py-1 text-sm font-medium rounded-full bg-accent/50 text-accent-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>

      {/* Intersection Observer target */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="h-8 flex items-center justify-center"
        >
          {loading && (
            <div className="text-sm text-muted-foreground">Loading more readings...</div>
          )}
        </div>
      )}
    </div>
  )
} 