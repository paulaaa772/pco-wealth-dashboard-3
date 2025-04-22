'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type Holding = {
  name: string
  value: number
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1']

export default function PortfolioDonut({ holdings }: { holdings: Holding[] }) {
  const total = holdings.reduce((acc, h) => acc + h.value, 0)
  const data = holdings.map((h) => ({
    name: h.name,
    value: Math.round((h.value / total) * 100),
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
