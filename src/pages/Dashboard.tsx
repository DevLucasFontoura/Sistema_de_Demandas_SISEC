import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

const COLORS = ['#0284c7', '#22c55e']

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100 bg-opacity-30">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Demandas"
          value="48"
          icon={ChartBarIcon}
        />
        <StatCard
          title="Em Andamento"
          value="12"
          icon={ClockIcon}
        />
        <StatCard
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
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="atendidas" fill="#0284c7" name="Atendidas" />
                <Bar dataKey="pendentes" fill="#ef4444" name="Pendentes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição por Tipo
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 