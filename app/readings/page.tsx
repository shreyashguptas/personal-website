'use client'

import { ReadingList } from './components/reading-list'
import { ReadingTrends } from './components/reading-trends'
import { readings } from './data'
import { useState, useMemo } from 'react'

export default function ReadingsPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All')
  
  // Get unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    readings.forEach(reading => {
      reading.tags.forEach(tag => tags.add(tag))
    })
    // Ensure 'All' is first, then sort the rest alphabetically
    return ['All', ...Array.from(tags).sort()]
  }, [])

  // Sort and filter readings
  const filteredReadings = useMemo(() => {
    let filtered = [...readings]
    if (selectedTag !== 'All') {
      filtered = filtered.filter(reading => reading.tags.includes(selectedTag))
    }
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [selectedTag])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Readings</h1>
      
      <ReadingTrends readings={readings} />

      <div className="space-y-6">
        <div className="border-b pb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Reads</h2>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ReadingList readings={filteredReadings} />
      </div>
    </div>
  )
}
