import { ReadingList } from './components/reading-list'
import { readings } from './data'

export default function ReadingsPage() {
  const recommendedReadings = readings
    .filter(reading => reading.recommendation)
    .sort((a, b) => (a.recommendation || 0) - (b.recommendation || 0));

  const otherReadings = readings.filter(reading => !reading.recommendation);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Readings</h1>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">My book recommendations</h2>
        <ReadingList readings={recommendedReadings} isRecommendations={true} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All the books I've read</h2>
        <ReadingList readings={otherReadings} />
      </div>
    </div>
  )
}
