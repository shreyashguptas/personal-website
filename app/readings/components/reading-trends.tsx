'use client'

import { Reading } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ReadingTrendsProps {
  readings: Reading[]
}

export function ReadingTrends({ readings }: ReadingTrendsProps) {
  // Process the data to get counts by year
  const readingsByYear = readings.reduce((acc: { [key: string]: number }, reading) => {
    const year = reading.date.getFullYear().toString()
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})

  // Convert to array format for recharts
  const data = Object.entries(readingsByYear)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))

  return (
    <div className="w-full h-64 my-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="year"
            stroke="#A1A1AA"
            fontSize={14}
          />
          <YAxis 
            stroke="#A1A1AA"
            fontSize={14}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#27272A',
              border: 'none',
              borderRadius: '6px',
              color: '#A1A1AA'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#3F3F46"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 