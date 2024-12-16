'use client'

import { Reading } from '../types'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import type { 
  BarProps, 
  XAxisProps, 
  YAxisProps, 
  TooltipProps,
  LabelProps
} from 'recharts'

// Dynamically import Recharts components to avoid SSR issues
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { loading: () => <div className="w-full h-64 animate-pulse bg-gray-200 rounded-lg" /> }
)
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar))
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis))
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis))
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip))
const Label = dynamic(() => import('recharts').then(mod => mod.Label))
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)

interface DataPoint {
  year: string
  count: number
}

interface ReadingTrendsProps {
  readings: Reading[]
}

export const ReadingTrends: FC<ReadingTrendsProps> = ({ readings }) => {
  // Process the data to get counts by year
  const readingsByYear = readings.reduce((acc: { [key: string]: number }, reading) => {
    const year = reading.date.getFullYear().toString()
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})

  // Convert to array format for recharts
  const data: DataPoint[] = Object.entries(readingsByYear)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const labelStyle = {
    fontSize: 12,
    fill: '#A1A1AA'
  }

  return (
    <div className="w-full h-64 my-4 md:my-8 flex justify-center">
      <div className="w-full max-w-3xl">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="year"
              stroke="#A1A1AA"
              fontSize={12}
              tickMargin={8}
            >
              <Label 
                value="Year" 
                position="bottom" 
                offset={0}
                style={labelStyle}
              />
            </XAxis>
            <YAxis
              stroke="#A1A1AA"
              fontSize={12}
              allowDecimals={false}
              tickMargin={8}
            >
              <Label 
                value="# of books" 
                angle={-90} 
                position="center"
                style={{
                  ...labelStyle,
                  textAnchor: 'middle'
                }}
              />
            </YAxis>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#27272A',
                border: 'none',
                borderRadius: '6px',
                color: '#A1A1AA',
                fontSize: '12px'
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
    </div>
  )
} 