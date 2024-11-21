import { Reading } from '../types'
import Link from 'next/link'

interface ReadingListProps {
  readings: Reading[]
}

export function ReadingList({ readings }: ReadingListProps) {
  return (
    <div className="space-y-8">
      {readings.map((reading) => (
        <div
          key={reading.title}
          className="border-b pb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {reading.url ? (
                <Link 
                  href={reading.url}
                  className="block group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2 className="text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors">
                    {reading.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-xl font-normal">
                  {reading.title}
                </h2>
              )}
              <p className="text-muted-foreground">{reading.author}</p>
            </div>
            <div className="flex flex-wrap gap-2 items-start">
              {reading.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

