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
      <ReadingList 
        initialReadings={initialData.readings}
        hasMore={initialData.hasMore}
        onLoadMore={loadMoreReadings}
        availableTags={tags}
      />
    )
  } catch (error) {
    console.error('Error loading readings:', error)
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Readings</h1>
        <p className="text-muted-foreground">Failed to load readings. Please try again later.</p>
      </div>
    )
  }
}
