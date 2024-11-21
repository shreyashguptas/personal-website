import { ReadingList } from './components/readings-list'
import { Reading } from './types'

const readings: Reading[] = [
  {
    title: "Truths",
    author: "Vivek Ramaswamy",
    tags: ["Politics", "Economics", "Social Issues"],
    url: "https://www.amazon.com/dp/B0BT8ZSXZ7"
  },
  {
    title: "100M$ Leads",
    author: "Alex Hormozi",
    tags: ["Business", "Lead Generation", "Sales"],
    url: "https://www.amazon.com/dp/B0BN6H9QG9"
  }
]

export default function ReadingsPage() {
  return (
    <div className="space-y-8">
      <h1>Readings</h1>
      <ReadingList readings={readings} />
    </div>
  )
}
