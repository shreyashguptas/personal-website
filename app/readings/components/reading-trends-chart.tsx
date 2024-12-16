import { FC } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  ResponsiveContainer
} from 'recharts'

interface DataPoint {
  year: string
  count: number
}

interface ChartProps {
  data: DataPoint[]
}

const ReadingTrendsChart: FC<ChartProps> = ({ data }) => {
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

export default ReadingTrendsChart 