// src/pages/Dashboard.tsx
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'
import { GraficoDeBarras } from '../components/GraficoDeBarras'
import { GraficoDePizza } from '../components/GraficoDePizza'
import { CardTotal } from '../components/CardTotal'

// Remova ou comente os dados de exemplo
// const barData = [
//   { mes: 'Jan', atendidas: 4, canceladas: 1 },
//   { mes: 'Fev', atendidas: 3, canceladas: 2 },
//   { mes: 'Mar', atendidas: 6, canceladas: 1 },
//   { mes: 'Abr', atendidas: 8, canceladas: 4 },
//   { mes: 'Mai', atendidas: 5, canceladas: 2 },
// ]

// const pieData = [
//   { name: 'Desenvolvimento', value: 60 },
//   { name: 'Dados', value: 40 },
// ]

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Visão geral das demandas e métricas do sistema
          </p>
        </header>
        
        {/* Cards de Totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <CardTotal
            title="Total de Demandas"
            value=""
            icon={ChartBarIcon}
            className="bg-white"
            iconClassName="bg-gray-100"
            borderClassName="border-gray-900"
          />
          <CardTotal
            title="Em Andamento"
            value=""
            icon={ClockIcon}
            className="bg-white"
            iconClassName="bg-gray-100"
            borderClassName="border-gray-900"
          />
          <CardTotal
            title="Concluídas"
            value=""
            icon={CheckCircleIcon}
            className="bg-white"
            iconClassName="bg-gray-100"
            borderClassName="border-gray-900"
          />
          <CardTotal
            title="Canceladas"
            value=""
            icon={XCircleIcon}
            className="bg-white"
            iconClassName="bg-gray-100"
            borderClassName="border-gray-900"
          />
          <CardTotal
            title="Adiadas"
            value=""
            icon={CalendarIcon}
            className="bg-white"
            iconClassName="bg-gray-100"
            borderClassName="border-gray-900"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Demandas por Mês
              </h2>
              <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
                <option>Todo período</option>
              </select>
            </div>
            <GraficoDeBarras data={[]} />
          </div>

          <div className="bg-white border border-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Distribuição por Tipo
              </h2>
              <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Este mês</option>
                <option>Último mês</option>
                <option>Todo período</option>
              </select>
            </div>
            <GraficoDePizza data={[]} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard