import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ClockIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const firestore = getFirestore()

interface Demanda {
  id: string
  solicitante: string
  tipo: 'desenvolvimento' | 'dados'
  urgencia: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluida'
  prazo: string
  responsavel: string
}

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
    concluida: 'Concluída'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

function ListaSolicitacoes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'equipe_ti'
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState('')
  const [solicitacoes, setSolicitacoes] = useState<Demanda[]>([])
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Demanda[]>([])

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'demandas'))
        const demandasList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Demanda[]
        setSolicitacoes(demandasList)
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error)
      }
    }

    fetchSolicitacoes()
  }, [])

  useEffect(() => {
    const filtered = searchId
      ? solicitacoes.filter(s => s.id.includes(searchId))
      : solicitacoes
    setFilteredSolicitacoes(filtered)
  }, [searchId, solicitacoes])

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
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-900">
                  Ações
                </th>
              )}
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
                    {solicitacao.urgencia ? solicitacao.urgencia.charAt(0).toUpperCase() + solicitacao.urgencia.slice(1) : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${solicitacao.status === 'pendente' ? 'bg-gray-100 text-gray-800' : 
                      solicitacao.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}
                  >
                    {formatStatus(solicitacao.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {solicitacao.prazo ? formatarData(solicitacao.prazo) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {solicitacao.responsavel || 'N/A'}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(solicitacao.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Excluir solicitação"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListaSolicitacoes 