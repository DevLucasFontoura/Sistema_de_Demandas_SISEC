import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  ClockIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import { toast } from 'react-hot-toast'

const firestore = getFirestore()

interface Demanda {
  id: string
  solicitante: string
  tipo: 'desenvolvimento' | 'dados' | 'suporte' | 'infraestrutura' | 'outros'
  urgencia: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
  prazo: string
  responsavel: string
  titulo: string
}

export function StatusBadge({ status }: { status: Demanda['status'] }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    em_andamento: 'bg-blue-100 text-blue-800 border border-blue-200',
    concluida: 'bg-green-100 text-green-800 border border-green-200',
    suspenso: 'bg-red-100 text-red-800 border border-red-200'
  }

  const icons = {
    pendente: ClockIcon,
    em_andamento: ClockIcon,
    concluida: CheckCircleIcon,
    suspenso: ClockIcon
  }

  const labels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    suspenso: 'Suspenso'
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]} shadow-sm`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {labels[status]}
    </span>
  )
}

export function UrgenciaBadge({ urgencia }: { urgencia: Demanda['urgencia'] }) {
  const styles = {
    baixa: 'bg-blue-100 text-blue-800 border border-blue-200',
    media: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    alta: 'bg-red-100 text-red-800 border border-red-200'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[urgencia]} shadow-sm`}>
      {urgencia.charAt(0).toUpperCase() + urgencia.slice(1)}
    </span>
  )
}

const formatarData = (data: string) => {
  const date = new Date(data + 'T00:00:00')
  const dia = date.getDate().toString().padStart(2, '0')
  const mes = (date.getMonth() + 1).toString().padStart(2, '0')
  const ano = date.getFullYear()
  return `${dia} / ${mes} / ${ano}`
}

const formatStatus = (status: string) => {
  const statusMap = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    suspenso: 'Suspenso'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatarTipo = (tipo: string) => {
  const tiposMap = {
    desenvolvimento: 'Desenvolvimento',
    dados: 'Dados',
    suporte: 'Suporte',
    infraestrutura_ti: 'Infraestrutura de TI',
    outros: 'Outros'
  }
  return tiposMap[tipo as keyof typeof tiposMap] || tipo
}

function ListaSolicitacoes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'equipe_ti'
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [solicitacoes, setSolicitacoes] = useState<Demanda[]>([])
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Demanda[]>([])
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({
    pendente: 1,
    em_andamento: 1,
    concluida: 1,
    suspenso: 1
  })
  const itemsPerPage = 10
  const [filters, setFilters] = useState<{ [key: string]: { [key: string]: string } }>({
    pendente: { responsavel: '', solicitante: '', tipo: '', urgencia: '' },
    em_andamento: { responsavel: '', solicitante: '', tipo: '', urgencia: '' },
    concluida: { responsavel: '', solicitante: '', tipo: '', urgencia: '' },
    suspenso: { responsavel: '', solicitante: '', tipo: '', urgencia: '' }
  })

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const demandasRef = collection(firestore, 'demandas')
        const querySnapshot = await getDocs(demandasRef)
        
        const demandasList = querySnapshot.docs.map(doc => {
          const data = doc.data()
          let createdAtDate

          // Trata diferentes formatos de data
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              // Se for Timestamp do Firestore
              createdAtDate = data.createdAt.toDate()
            } else if (typeof data.createdAt === 'string') {
              // Se for string ISO
              createdAtDate = new Date(data.createdAt)
            } else {
              // Fallback para data atual
              createdAtDate = new Date()
            }
          } else {
            createdAtDate = new Date()
          }

          return {
            ...data,
            id: doc.id,
            createdAt: createdAtDate
          }
        })

        // Ordena por data de criação (mais recente primeiro)
        const sortedDemandas = demandasList.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        )

        setSolicitacoes(sortedDemandas)
        setFilteredSolicitacoes(sortedDemandas)
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error)
        toast.error('Erro ao carregar solicitações')
      }
    }

    fetchSolicitacoes()
  }, [])

  useEffect(() => {
    const filtered = searchTerm
      ? solicitacoes.filter(s => 
          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.titulo || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      : solicitacoes
    setFilteredSolicitacoes(filtered)
  }, [searchTerm, solicitacoes])

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter esta ação!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      borderRadius: '10px',
      customClass: {
        container: 'font-sans',
        title: 'text-xl font-bold text-gray-800',
        content: 'text-gray-600',
        confirmButton: 'rounded-md',
        cancelButton: 'rounded-md'
      }
    })

    if (result.isConfirmed) {
      try {
        const docRef = doc(firestore, 'demandas', id)
        await deleteDoc(docRef)
        
        // Atualiza a lista local removendo a solicitação excluída
        setSolicitacoes(prevSolicitacoes => 
          prevSolicitacoes.filter(s => s.id !== id)
        )
        
        Swal.fire({
          title: 'Excluído!',
          text: 'A solicitação foi excluída com sucesso.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
          background: '#fff',
          borderRadius: '10px',
          customClass: {
            container: 'font-sans',
            title: 'text-xl font-bold text-gray-800',
            content: 'text-gray-600',
            confirmButton: 'rounded-md'
          }
        })
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error)
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível excluir a solicitação.',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
          background: '#fff',
          borderRadius: '10px',
          customClass: {
            container: 'font-sans',
            title: 'text-xl font-bold text-gray-800',
            content: 'text-gray-600',
            confirmButton: 'rounded-md'
          }
        })
      }
    }
  }

  const handlePageChange = (status: string, page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [status]: page
    }))
  }

  // Função para obter valores únicos para cada coluna em uma lista específica
  const getUniqueValues = (status: string, key: string) => {
    return Array.from(new Set(
      solicitacoes
        .filter(item => item.status === status)
        .map(item => item[key as keyof Demanda])
    )).filter(Boolean).sort()
  }

  // Função para aplicar os filtros em uma lista específica
  const applyFilters = (items: Demanda[], status: string) => {
    return items.filter(item => {
      return Object.entries(filters[status]).every(([key, value]) => {
        if (!value) return true
        return item[key as keyof Demanda] === value
      })
    })
  }

  // Componente FilterDropdown atualizado
  const FilterDropdown = ({ status, column }: { status: string, column: string }) => (
    <div className="group relative inline-flex items-center cursor-pointer">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
        {column === 'responsavel' ? 'Responsável' :
         column === 'solicitante' ? 'Solicitante' :
         column === 'tipo' ? 'Tipo' :
         column === 'urgencia' ? 'Urgência' : column}
      </span>
      <select
        value={filters[status][column]}
        onChange={(e) => setFilters(prev => ({
          ...prev,
          [status]: { ...prev[status], [column]: e.target.value }
        }))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="">Todos</option>
        {getUniqueValues(status, column).map(option => (
          <option key={option} value={option}>
            {column === 'tipo' ? formatarTipo(option) :
             column === 'status' ? formatStatus(option) :
             option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600" />
    </div>
  )

  const renderStatusSection = (status: string, title: string) => {
    let filteredByStatus = solicitacoes.filter(s => s.status === status)
    
    // Aplicar busca por texto
    if (searchTerm) {
      filteredByStatus = filteredByStatus.filter(s => 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.titulo || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Aplicar filtros específicos desta lista
    filteredByStatus = applyFilters(filteredByStatus, status)
    
    if (filteredByStatus.length === 0) return null

    const totalPages = Math.ceil(filteredByStatus.length / itemsPerPage)
    const currentPageNumber = currentPage[status] || 1
    const startIndex = (currentPageNumber - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = filteredByStatus.slice(startIndex, endIndex)

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <FilterDropdown status={status} column="responsavel" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <FilterDropdown status={status} column="solicitante" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <FilterDropdown status={status} column="tipo" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <FilterDropdown status={status} column="urgencia" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</span>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((solicitacao) => (
                  <tr 
                    key={solicitacao.id} 
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/detalhes-solicitacao/${solicitacao.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {solicitacao.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {solicitacao.responsavel || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {solicitacao.solicitante}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatarTipo(solicitacao.tipo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UrgenciaBadge urgencia={solicitacao.urgencia} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={solicitacao.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {solicitacao.prazo ? formatarData(solicitacao.prazo) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(solicitacao.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-center gap-2 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(status, currentPageNumber - 1)}
                disabled={currentPageNumber === 1}
                className={`p-2 rounded-full ${
                  currentPageNumber === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(status, index + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPageNumber === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(status, currentPageNumber + 1)}
                disabled={currentPageNumber === totalPages}
                className={`p-2 rounded-full ${
                  currentPageNumber === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              <span className="ml-4 text-sm text-gray-500">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredByStatus.length)} de {filteredByStatus.length}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Lista de Solicitações
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, solicitante ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-96 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {renderStatusSection('pendente', 'Pendentes')}
      {renderStatusSection('em_andamento', 'Em Andamento')}
      {renderStatusSection('concluida', 'Concluídas')}
      {renderStatusSection('suspenso', 'Suspensas')}

      {filteredSolicitacoes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhuma solicitação encontrada.
          </p>
        </div>
      )}
    </div>
  )
}

export default ListaSolicitacoes 