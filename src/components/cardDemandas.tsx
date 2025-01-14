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
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        <div className="space-y-2">
          {demandasFiltradas.map(demanda => (
            <Link 
              key={demanda.id}
              to={`/detalhes-solicitacao/${demanda.id}`}
              className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-blue-600">#{demanda.id}</span>
                <StatusBadge status={demanda.status} />
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Prazo: {formatarData(demanda.prazo)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 col-span-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{responsavel}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {renderDemandasSection('pendente', 'Pendentes')}
          {renderDemandasSection('em_andamento', 'Em Andamento')}
          {renderDemandasSection('concluida', 'Concluídas')}
          {renderDemandasSection('suspenso', 'Suspensas')}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
          Total de demandas: {demandas.length}
        </div>
      </div>
    </div>
  )
}
