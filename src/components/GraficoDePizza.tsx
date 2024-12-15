// src/components/charts/TypePieChart.tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface GraficoDePizzaProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = ['#0284c7', '#22c55e']

export function GraficoDePizza({ data }: GraficoDePizzaProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}