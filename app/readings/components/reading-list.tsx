import { Reading } from '../types'
import Link from 'next/link'

interface ReadingListProps {
  readings: Reading[]
  showTags?: boolean
  isRecommendations?: boolean
}

export function ReadingList({ readings, showTags = true, isRecommendations = false }: ReadingListProps) {
  return (
    <div className={`space-y-8 ${isRecommendations ? 'border-y-2 py-6' : ''}`}>
      {readings.map((reading) => (
        <div
          key={reading.title}
          className="border-b pb-8 last:border-b-0"
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
                    {isRecommendations && reading.recommendation && (
                      <span className="font-semibold mr-2">#{reading.recommendation}</span>
                    )}
                    {reading.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-xl font-normal">
                  {isRecommendations && reading.recommendation && (
                    <span className="font-semibold mr-2">#{reading.recommendation}</span>
                  )}
                  {reading.title}
                </h2>
              )}
              <p className="text-muted-foreground">{reading.author}</p>
            </div>
            <div className="flex flex-wrap gap-2 items-start">
              {showTags && (
                reading.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

