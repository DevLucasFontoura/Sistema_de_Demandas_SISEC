import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { Demanda } from '../services/demandas'
import { formatDate } from '../utils/date'

// Dados mockados (depois serão substituídos pelos dados do Firebase)
const solicitacoesMock: Demanda[] = [
  {
    id: '1',
    tipo: 'desenvolvimento',
    urgencia: 'alta',
    prazo: new Date('2024-02-01'),
    solicitante: 'João Silva',
    descricao: 'Desenvolvimento de nova funcionalidade',
    status: 'pendente',
    dataCriacao: new Date('2024-01-01')
  },
  {
    id: '2',
    tipo: 'dados',
    urgencia: 'media',
    prazo: new Date('2024-02-15'),
    solicitante: 'Maria Santos',
    descricao: 'Análise de dados do último trimestre',
    status: 'atendida',
    dataCriacao: new Date('2024-01-05')
  }
]

export function StatusBadge({ status }: { status: Demanda['status'] }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800',
    atendida: 'bg-green-100 text-green-800'
  }

  const icons = {
    pendente: ClockIcon,
    atendida: CheckCircleIcon
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function UrgenciaBadge({ urgencia }: { urgencia: Demanda['urgencia'] }) {
  const styles = {
    baixa: 'bg-blue-100 text-blue-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[urgencia]}`}>
      {urgencia.charAt(0).toUpperCase() + urgencia.slice(1)}
    </span>
  )
}

function ListaSolicitacoes() {
  const navigate = useNavigate()
  const [solicitacoes, setSolicitacoes] = useState<Demanda[]>(solicitacoesMock)
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'atendida'>('todos')

  const solicitacoesFiltradas = solicitacoes.filter(sol => 
    filtroStatus === 'todos' ? true : sol.status === filtroStatus
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitações</h1>
        
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <select
              className="input max-w-xs"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="atendida">Atendidas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitacoesFiltradas.map((solicitacao) => (
                <tr key={solicitacao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {solicitacao.solicitante}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {solicitacao.tipo.charAt(0).toUpperCase() + solicitacao.tipo.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UrgenciaBadge urgencia={solicitacao.urgencia} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={solicitacao.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(solicitacao.prazo)}
                      {solicitacao.adiamentos && solicitacao.adiamentos.length > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Adiada {solicitacao.adiamentos.length}x
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => navigate(`/detalhes-solicitacao/${solicitacao.id}`)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {solicitacoesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não existem solicitações com os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListaSolicitacoes 