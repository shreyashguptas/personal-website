import { getAllReadings, getUniqueReadingTags } from '@/lib/supabase'
import { ReadingList } from '@/components/features/readings/reading-list'

export const dynamic = 'force-dynamic'

export default async function ReadingsPage() {
  try {
    const [initialReadings, availableTags] = await Promise.all([
      getAllReadings(),
      getUniqueReadingTags()
    ])
    
    return (
      <ReadingList 
        initialReadings={initialReadings} 
        availableTags={availableTags} 
      />
    )
  } catch (error) {
    console.error('Error loading readings:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Unable to Load Readings</h1>
        <p className="text-muted-foreground">
          We're having trouble connecting to our database. Please try again later.
        </p>
      </div>
    )
  }
}
