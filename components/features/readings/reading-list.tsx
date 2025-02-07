'use client'

import { useState, useEffect, useRef } from 'react'
import { ReadingWithFormattedDate, PaginatedReadings } from '@/lib/supabase'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
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

      {/* Readings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReadings.map((reading) => (
          <a
            key={reading.id}
            href={reading.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors h-full"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold line-clamp-2">{reading.title}</h2>
                  {reading.recommendation && (
                    <span className="inline-flex px-3 py-1 text-sm rounded-full bg-primary/10 text-primary whitespace-nowrap">
                      Top {reading.recommendation} Pick
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">by {reading.author}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {reading.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex px-3 py-1 text-sm rounded-full bg-accent/50 text-accent-foreground whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Intersection Observer target */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="h-10 flex items-center justify-center"
        >
          {loading && (
            <div className="text-sm text-muted-foreground">Loading more readings...</div>
          )}
        </div>
      )}
    </div>
  )
} 