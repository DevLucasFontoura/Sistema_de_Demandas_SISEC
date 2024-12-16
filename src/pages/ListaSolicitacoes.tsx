import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'
import { Demanda } from '../services/demandas'
import { formatDate } from '../utils/date'

export function StatusBadge({ status }: { status: Demanda['status'] }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    concluida: 'bg-green-100 text-green-800'
  }

  const icons = {
    pendente: ClockIcon,
    em_andamento: ClockIcon,
    concluida: CheckCircleIcon
  }

  const labels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída'
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon className="w-4 h-4 mr-1" />
      {labels[status]}
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
  const [searchId, setSearchId] = useState('')
  const [solicitacoes, setSolicitacoes] = useState<Demanda[]>([])
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Demanda[]>([])

  useEffect(() => {
    // Filtra as solicitações com base no ID de busca
    const filtered = searchId
      ? solicitacoes.filter(s => s.id.includes(searchId))
      : solicitacoes
    setFilteredSolicitacoes(filtered)
  }, [searchId, solicitacoes])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Solicitações</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-900 rounded-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                Solicitante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                Urgência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                Prazo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                Responsável
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-900">
            {filteredSolicitacoes.map((solicitacao) => (
              <tr key={solicitacao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    onClick={() => navigate(`/detalhes-solicitacao/${solicitacao.id}`)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                  >
                    {solicitacao.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {solicitacao.solicitante}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {solicitacao.tipo === 'desenvolvimento' ? 'Desenvolvimento' : 'Dados'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${solicitacao.urgencia === 'alta' ? 'bg-red-100 text-red-800' : 
                      solicitacao.urgencia === 'media' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}
                  >
                    {solicitacao.urgencia.charAt(0).toUpperCase() + solicitacao.urgencia.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${solicitacao.status === 'pendente' ? 'bg-gray-100 text-gray-800' : 
                      solicitacao.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}
                  >
                    {solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(solicitacao.prazo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {solicitacao.responsavel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListaSolicitacoes 