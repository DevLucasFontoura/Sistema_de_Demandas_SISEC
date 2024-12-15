// src/components/charts/DemandBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GraficoDeBarrasProps {
  data: {
    mes: string
    atendidas: number
    pendentes: number
  }[]
}

export function GraficoDeBarras({ data }: GraficoDeBarrasProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="atendidas" fill="#0284c7" name="Atendidas" />
          <Bar dataKey="pendentes" fill="#ef4444" name="Pendentes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}