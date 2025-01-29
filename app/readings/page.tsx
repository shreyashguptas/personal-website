'use client'

import { useState, useEffect } from 'react'
import { getReadings, getUniqueReadingTags } from '@/lib/supabase/readings'
import type { Reading } from '@/lib/supabase/readings'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ReadingsPage() {
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [readings, setReadings] = useState<Reading[]>([])
  const [tags, setTags] = useState<string[]>([])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [readingsData, tagsData] = await Promise.all([
        getReadings(),
        getUniqueReadingTags()
      ])
      setReadings(readingsData)
      setTags(['all', ...tagsData])
    }
    loadData()
  }, [])

  // Handle tag selection
  const handleTagChange = async (value: string) => {
    setSelectedTag(value)
    const filteredReadings = await getReadings(value === 'all' ? undefined : value)
    setReadings(filteredReadings)
  }

  return (
    <main className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Readings</h1>
            <p className="text-muted-foreground">
              A collection of books and articles I've been reading.
            </p>
          </div>
          <Select value={selectedTag} onValueChange={handleTagChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-6">
          {readings.map((reading) => (
            <a
              key={reading.id}
              href={reading.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{reading.title}</h2>
                    <p className="text-sm text-muted-foreground">by {reading.author}</p>
                  </div>
                  {reading.recommendation && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      Top {reading.recommendation} Pick
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {reading.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-accent/50 text-accent-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">{reading.date}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
