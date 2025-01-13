// src/components/solicitacao/StatusSolicitacao.tsx
import { ClockIcon, CheckCircleIcon, XCircleIcon, StopCircleIcon } from '@heroicons/react/24/outline'

interface StatusSolicitacaoProps {
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
}

export function StatusSolicitacao({ status }: StatusSolicitacaoProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pendente':
        return <XCircleIcon className="w-6 h-6 text-yellow-500" />
      case 'em_andamento':
        return <ClockIcon className="w-6 h-6 text-blue-500" />
      case 'concluida':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'suspenso':
        return <StopCircleIcon className="w-6 h-6 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluida':
        return 'Concluída'
      case 'suspenso':
        return 'Suspenso'
    }
  }

  return (
    <div className="flex items-center">
      {getStatusIcon()}
      <span className="ml-2 text-gray-700">{getStatusText()}</span>
    </div>
  )
}