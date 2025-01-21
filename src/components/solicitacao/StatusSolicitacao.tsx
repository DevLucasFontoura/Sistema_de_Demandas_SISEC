// src/components/solicitacao/StatusSolicitacao.tsx
import { getStatusConfig } from '../../config/constants'

interface StatusSolicitacaoProps {
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
}

export function StatusSolicitacao({ status }: StatusSolicitacaoProps) {
  const config = getStatusConfig(status)

  return (
    <div className="flex items-center">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
        {config.label}
      </span>
    </div>
  )
}