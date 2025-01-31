'use client'

import { useState } from 'react'
import { ReadingWithFormattedDate } from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReadingListProps {
  initialReadings: ReadingWithFormattedDate[]
  availableTags: string[]
}

export function ReadingList({ initialReadings, availableTags }: ReadingListProps) {
  const [selectedTag, setSelectedTag] = useState<string>('all')

  // Filter readings based on selected tag
  const filteredReadings = selectedTag === 'all' 
    ? initialReadings 
    : initialReadings.filter(reading => reading.tags.includes(selectedTag))

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Readings</h1>
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
      <div className="grid gap-6">
        {filteredReadings.map((reading) => (
          <a
            key={reading.id}
            href={reading.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="space-y-4">
              {/* Title and Recommendation */}
              <div className="space-y-2">
                {/* Recommendation Badge - Show above title on mobile */}
                {reading.recommendation && (
                  <div className="flex md:hidden mb-2">
                    <span className="inline-flex px-3 py-1 text-sm rounded-full bg-primary/10 text-primary whitespace-nowrap">
                      Top {reading.recommendation} Pick
                    </span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 items-start">
                  <h2 className="text-xl font-semibold">{reading.title}</h2>
                  {/* Recommendation Badge - Show inline with title on desktop */}
                  {reading.recommendation && (
                    <span className="hidden md:inline-flex px-3 py-1 text-sm rounded-full bg-primary/10 text-primary whitespace-nowrap">
                      Top {reading.recommendation} Pick
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">by {reading.author}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
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
    </div>
  )
} 