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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{responsavel}</h2>
        
        <div className="space-y-4">
          {demandas.map(demanda => (
            <Link 
              key={demanda.id}
              to={`/detalhes-solicitacao/${demanda.id}`}
              className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-blue-600">#{demanda.id}</span>
                <StatusBadge status={demanda.status} />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Prazo: {formatarData(demanda.prazo)}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total de demandas: {demandas.length}
        </div>
      </div>
    </div>
  )
}
