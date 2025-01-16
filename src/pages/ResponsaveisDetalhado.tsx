import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { UserGroupIcon, ArrowLeftIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Demanda {
  id: string
  titulo: string
  status: string
  prazo?: Date
}

interface ResponsavelDetalhado {
  responsavel: string
  demandas: Demanda[]
}

function ResponsaveisDetalhado() {
  const navigate = useNavigate()
  const [responsaveisData, setResponsaveisData] = useState<ResponsavelDetalhado[]>([])
  const [expandedResponsaveis, setExpandedResponsaveis] = useState<Set<string>>(new Set())
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>({})
  const itemsPerPage = 6

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando busca de dados...')
        const firestore = getFirestore()
        const demandasRef = collection(firestore, 'demandas')
        const snapshot = await getDocs(demandasRef)
        
        console.log('Dados recebidos do Firestore:', snapshot.docs.length, 'documentos')
        
        const demandas = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            prazo: data.prazo && typeof data.prazo.toDate === 'function' 
              ? data.prazo.toDate() 
              : data.prazo
          }
        })

        console.log('Demandas processadas:', demandas)

        const responsaveisMap = new Map<string, ResponsavelDetalhado>()

        demandas.forEach((demanda: any) => {
          const resp = demanda.responsavel || 'Sem responsável'
          
          if (!responsaveisMap.has(resp)) {
            responsaveisMap.set(resp, {
              responsavel: resp,
              demandas: []
            })
          }

          const responsavelData = responsaveisMap.get(resp)!
          responsavelData.demandas.push(demanda)
        })

        const responsaveisArray = Array.from(responsaveisMap.values())
        console.log('Dados processados:', responsaveisArray)
        
        setExpandedResponsaveis(new Set(responsaveisArray.map(r => r.responsavel)))
        
        setResponsaveisData(responsaveisArray)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      }
    }

    fetchData()
  }, [])

  const toggleResponsavel = (responsavel: string) => {
    setExpandedResponsaveis(prev => {
      const newSet = new Set(prev)
      if (newSet.has(responsavel)) {
        newSet.delete(responsavel)
      } else {
        newSet.add(responsavel)
      }
      return newSet
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'concluida':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const formatStatus = (status: string) => {
    return status
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatarPrazo = (prazo: any) => {
    if (!prazo) return <span className="text-gray-400">Sem prazo</span>

    try {
      let data = prazo
      if (typeof prazo === 'string') {
        data = new Date(prazo)
      }
      
      const dia = String(data.getDate()).padStart(2, '0')
      const mes = String(data.getMonth() + 1).padStart(2, '0')
      const ano = data.getFullYear()
      const dataFormatada = `${dia} / ${mes} / ${ano}`
      
      return (
        <span className="text-sm text-gray-600">
          {dataFormatada}
        </span>
      )
    } catch (error) {
      return <span className="text-gray-400">Data inválida</span>
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        duration: 0.8
      }
    }
  }

  const handlePageChange = (responsavel: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [responsavel]: page
    }))
  }

  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text
    return text.substring(0, limit) + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Demandas por Responsável
            </h1>
          </div>
        </header>

        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {responsaveisData.map((responsavel) => {
            const currentPage = currentPages[responsavel.responsavel] || 1
            const totalPages = Math.ceil(responsavel.demandas.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const currentDemandas = responsavel.demandas.slice(startIndex, endIndex)

            return (
              <motion.div
                key={responsavel.responsavel}
                variants={itemVariants}
                className="bg-white rounded-lg shadow"
              >
                <button
                  onClick={() => toggleResponsavel(responsavel.responsavel)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-xl font-semibold text-gray-900">
                      {responsavel.responsavel}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({responsavel.demandas.length} demandas)
                    </span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedResponsaveis.has(responsavel.responsavel) ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                <div className={`overflow-hidden transition-all ${
                  expandedResponsaveis.has(responsavel.responsavel) ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                  <div className="p-4 border-t border-gray-100">
                    <table className="min-w-full table-fixed">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-32">Número</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Título</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-32">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-32">Prazo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDemandas.map((demanda) => (
                          <motion.tr
                            key={demanda.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 50,
                              damping: 15,
                              duration: 0.6,
                              delay: 0.2
                            }}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/detalhes-solicitacao/${demanda.id}`)}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              #{demanda.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium truncate">
                              {truncateText(demanda.titulo, 60)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(demanda.status)}`}>
                                {formatStatus(demanda.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {formatarPrazo(demanda.prazo)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(responsavel.responsavel, currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full ${
                            currentPage === 1 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => handlePageChange(responsavel.responsavel, index + 1)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === index + 1
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(responsavel.responsavel, currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-full ${
                            currentPage === totalPages 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

export default ResponsaveisDetalhado 