// src/pages/Dashboard.tsx
import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { GraficoDeBarras } from '../components/GraficoDeBarras'
import { GraficoDePizza } from '../components/GraficoDePizza'
import { CardTotal } from '../components/CardTotal'

// Dados de exemplo (depois serão substituídos por dados do Firebase)
const barData = [
  { mes: 'Jan', atendidas: 4, pendentes: 2 },
  { mes: 'Fev', atendidas: 3, pendentes: 1 },
  { mes: 'Mar', atendidas: 6, pendentes: 3 },
  { mes: 'Abr', atendidas: 8, pendentes: 4 },
  { mes: 'Mai', atendidas: 5, pendentes: 2 },
]

const pieData = [
  { name: 'Desenvolvimento', value: 60 },
  { name: 'Dados', value: 40 },
]

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardTotal
          title="Total de Demandas"
          value="48"
          icon={ChartBarIcon}
        />
        <CardTotal
          title="Em Andamento"
          value="12"
          icon={ClockIcon}
        />
        <CardTotal
          title="Concluídas"
          value="36"
          icon={CheckCircleIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Demandas por Mês
          </h2>
          <GraficoDeBarras data={barData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição por Tipo
          </h2>
          <GraficoDePizza data={pieData} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard