'use client'

import { Reading } from '../types'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import type { 
  BarChart as BarChartType,
  Bar as BarType,
  XAxis as XAxisType,
  YAxis as YAxisType,
  Tooltip as TooltipType,
  Label as LabelType,
  ResponsiveContainer as ResponsiveContainerType
} from 'recharts'

const Chart = dynamic(() => import('./reading-trends-chart'), {
  loading: () => <div className="w-full h-64 animate-pulse bg-gray-200 rounded-lg" />,
  ssr: false
})

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

  return <Chart data={data} />
} 