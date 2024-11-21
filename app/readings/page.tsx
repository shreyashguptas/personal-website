import { ReadingList } from './components/reading-list'
import { readings } from './data'

export default function ReadingsPage() {
  return (
    <div className="space-y-8">
      <h1>Readings</h1>
      <ReadingList readings={readings} />
    </div>
  )
}

