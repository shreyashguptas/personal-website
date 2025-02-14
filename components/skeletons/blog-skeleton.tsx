'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function BlogSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title and date skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      {/* Content skeletons */}
      <div className="space-y-6">
        {/* Paragraph skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
          </div>
        ))}

        {/* Image placeholder */}
        <Skeleton className="h-[300px] w-full rounded-lg" />

        {/* More paragraphs */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i + 3} className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[96%]" />
          </div>
        ))}
      </div>
    </div>
  )
} 