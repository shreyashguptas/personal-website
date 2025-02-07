import { ReadingList } from '@/components/features/readings/reading-list'
import { getAllReadings, getUniqueReadingTags } from '@/lib/supabase'
import { loadMoreReadings } from './actions'

// Revalidate data every minute in production, but stay dynamic in development
export const revalidate = 60

export default async function ReadingsPage() {
  try {
    const [initialData, tags] = await Promise.all([
      getAllReadings(1),
      getUniqueReadingTags()
    ])

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Reading List</h1>
        <ReadingList 
          initialReadings={initialData.readings}
          hasMore={initialData.hasMore}
          onLoadMore={loadMoreReadings}
          availableTags={tags}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading readings:', error)
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Reading List</h1>
        <p className="text-muted-foreground">Failed to load reading list. Please try again later.</p>
      </div>
    )
  }
}
