// src/components/charts/DemandBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GraficoDeBarrasProps {
  data: {
    mes: string
    atendidas: number
    canceladas: number
  }[]
}

export function GraficoDeBarras({ data }: GraficoDeBarrasProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="mes" 
            stroke="#111827"
            tick={{ fill: '#111827' }}
          />
          <YAxis 
            stroke="#111827"
            tick={{ fill: '#111827' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #111827',
              borderRadius: '0.5rem'
            }}
          />
          <Bar 
            dataKey="atendidas" 
            fill="#bbf7d0"
            stroke="#111827"
            strokeWidth={1}
            name="Atendidas"
          />
          <Bar 
            dataKey="canceladas" 
            fill="#fecaca"
            stroke="#111827"
            strokeWidth={1}
            name="Canceladas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}