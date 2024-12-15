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

// Dados mockados para exemplo
const solicitacoesExemplo: Demanda[] = [
  {
    id: '123456',
    tipo: 'desenvolvimento',
    urgencia: 'alta',
    prazo: new Date('2024-03-15'),
    solicitante: 'João Silva',
    descricao: 'Implementação de novo módulo de relatórios',
    status: 'pendente',
    dataCriacao: new Date('2024-02-01'),
    responsavel: 'Maria Santos',
    titulo: 'Novo Módulo de Relatórios'
  },
  {
    id: '234567',
    tipo: 'dados',
    urgencia: 'media',
    prazo: new Date('2024-03-20'),
    solicitante: 'Ana Oliveira',
    descricao: 'Análise de dados de vendas do último trimestre',
    status: 'em_andamento',
    dataCriacao: new Date('2024-02-05'),
    responsavel: 'Carlos Mendes',
    titulo: 'Análise de Vendas'
  },
  {
    id: '345678',
    tipo: 'desenvolvimento',
    urgencia: 'baixa',
    prazo: new Date('2024-04-01'),
    solicitante: 'Pedro Costa',
    descricao: 'Correção de bugs no sistema de login',
    status: 'concluida',
    dataCriacao: new Date('2024-02-10'),
    responsavel: 'Lucas Ferreira',
    titulo: 'Correção de Bugs'
  },
  {
    id: '456789',
    tipo: 'dados',
    urgencia: 'alta',
    prazo: new Date('2024-03-10'),
    solicitante: 'Mariana Lima',
    descricao: 'Integração com nova API de pagamentos',
    status: 'pendente',
    dataCriacao: new Date('2024-02-12'),
    responsavel: 'Rafael Santos',
    titulo: 'Integração com API de Pagamentos'
  },
  {
    id: '567890',
    tipo: 'desenvolvimento',
    urgencia: 'media',
    prazo: new Date('2024-03-25'),
    solicitante: 'Bruno Alves',
    descricao: 'Implementação de novo design system',
    status: 'em_andamento',
    dataCriacao: new Date('2024-02-15'),
    responsavel: 'Julia Pereira',
    titulo: 'Implementação de Design System'
  }
]

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
  const [solicitacoes] = useState<Demanda[]>(solicitacoesExemplo)
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Demanda[]>(solicitacoesExemplo)

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
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
                Responsável
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                    {solicitacao.status === 'em_andamento' ? 'Em Andamento' : 
                      solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1)}
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

        {filteredSolicitacoes.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma solicitação encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchId 
                ? "Não foi encontrada nenhuma solicitação com este ID."
                : "Não existem solicitações cadastradas."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListaSolicitacoes 