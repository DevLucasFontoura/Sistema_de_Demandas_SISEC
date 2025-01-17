import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'

interface Demanda {
  id: string
  responsavel: string
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
  prazo: string
}

interface CardDemandasProps {
  responsavel: string
  demandas: Demanda[]
}

export function CardDemandas({ responsavel, demandas }: CardDemandasProps) {
  const formatarData = (data: string) => {
    if (!data) return 'Não definido'
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR')
  }

  const demandasPorStatus = {
    pendente: demandas.filter(d => d.status === 'pendente'),
    em_andamento: demandas.filter(d => d.status === 'em_andamento'),
    concluida: demandas.filter(d => d.status === 'concluida'),
    suspenso: demandas.filter(d => d.status === 'suspenso')
  }

  const renderDemandasSection = (status: keyof typeof demandasPorStatus, title: string) => {
    const demandasFiltradas = demandasPorStatus[status]
    if (demandasFiltradas.length === 0) return null

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {demandasFiltradas.length}
          </span>
        </div>
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {demandasFiltradas.map((demanda, index) => (
            <motion.div
              key={demanda.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <Link 
                to={`/detalhes-solicitacao/${demanda.id}`}
                className="block bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-blue-600 hover:text-blue-700">Nº {demanda.id}</span>
                      {demanda.titulo && (
                        <p className="text-sm text-gray-600 mt-1" title={demanda.titulo}>
                          <span className="font-medium">Título: </span>
                          {demanda.titulo.slice(0, 50)}
                          {demanda.titulo.length > 50 ? '...' : ''}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Prazo: {formatarData(demanda.prazo)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      <StatusBadge status={demanda.status} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-[1600px] w-full mx-auto"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{responsavel}</h2>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Total: {demandas.length}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {renderDemandasSection('pendente', 'Pendentes')}
          {renderDemandasSection('em_andamento', 'Em Andamento')}
          {renderDemandasSection('concluida', 'Concluídas')}
          {renderDemandasSection('suspenso', 'Suspensas')}
        </div>
      </div>
    </motion.div>
  )
}
