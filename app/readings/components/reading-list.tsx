import { Reading } from '../types'
import Link from 'next/link'

interface ReadingListProps {
  readings: Reading[]
  showTags?: boolean
  isRecommendations?: boolean
}

export function ReadingList({ readings, showTags = true, isRecommendations = false }: ReadingListProps) {
  return (
    <div className="space-y-8">
      {readings.map((reading) => (
        <div
          key={reading.title}
          className="border-b pb-6 md:pb-8 last:border-b-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 flex-1">
              {reading.url ? (
                <Link 
                  href={reading.url}
                  className="block group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2 className="text-lg md:text-xl font-normal group-hover:bg-muted px-2 -mx-2 rounded transition-colors">
                    {isRecommendations && reading.recommendation && (
                      <span className="font-semibold mr-2">#{reading.recommendation}</span>
                    )}
                    {reading.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-lg md:text-xl font-normal">
                  {isRecommendations && reading.recommendation && (
                    <span className="font-semibold mr-2">#{reading.recommendation}</span>
                  )}
                  {reading.title}
                </h2>
              )}
              <p className="text-muted-foreground text-sm md:text-base">{reading.author}</p>
              {showTags && (
                <div className="flex flex-wrap gap-1.5 sm:hidden mt-2">
                  {reading.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 md:py-1 bg-muted text-muted-foreground rounded text-xs md:text-sm whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {showTags && (
              <div className="hidden sm:flex sm:flex-wrap gap-1.5 sm:gap-2 sm:w-[40%] sm:justify-end">
                {reading.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 md:py-1 bg-muted text-muted-foreground rounded text-xs md:text-sm whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

