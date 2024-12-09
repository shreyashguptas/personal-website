import { ReadingList } from './components/reading-list'
import { ReadingTrends } from './components/reading-trends'
import { readings } from './data'

export default function ReadingsPage() {
  // Sort all readings by date in descending order (newest first)
  const sortedReadings = [...readings].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Readings</h1>
      
      <ReadingTrends readings={readings} />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All the books I've read</h2>
        <ReadingList readings={sortedReadings} />
      </div>
    </div>
  )
}
