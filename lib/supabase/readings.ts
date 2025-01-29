import { supabase } from './client'

export interface Reading {
  id: string
  title: string
  author: string
  url: string
  date: string
  tags: string[]
  recommendation?: 1 | 2 | 3
}

export async function getUniqueReadingTags(): Promise<string[]> {
  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .select('tags')

  if (readingsError) {
    console.error('Error fetching tags:', readingsError)
    return []
  }

  // Get all tags and flatten them into a single array
  const allTags = readings.flatMap(reading => reading.tags)
  
  // Remove duplicates and sort alphabetically
  return Array.from(new Set(allTags)).sort()
}

export async function getReadings(selectedTag?: string): Promise<Reading[]> {
  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .select('*')
    .order('date', { ascending: false })

  if (readingsError) {
    console.error('Error fetching readings:', readingsError)
    return []
  }

  const formattedReadings = readings.map(reading => ({
    id: reading.id,
    title: reading.title,
    author: reading.author,
    url: reading.url,
    date: new Date(reading.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    tags: reading.tags,
    recommendation: reading.recommendation
  }))

  // Filter by tag if one is selected
  if (selectedTag) {
    return formattedReadings.filter(reading => reading.tags.includes(selectedTag))
  }

  return formattedReadings
} 
