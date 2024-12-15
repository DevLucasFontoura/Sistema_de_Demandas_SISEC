// src/components/charts/TypePieChart.tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface GraficoDePizzaProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = ['#111827', '#4b5563']

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
            label={({ name, percent }) => (
              `${name} ${(percent * 100).toFixed(0)}%`
            )}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #111827',
              borderRadius: '0.5rem'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}