import { ClockIcon, CheckCircleIcon, XCircleIcon, StopCircleIcon } from '@heroicons/react/24/outline'

interface StatusBadgeProps {
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    em_andamento: 'bg-blue-100 text-blue-800 border border-blue-200',
    concluida: 'bg-green-100 text-green-800 border border-green-200',
    suspenso: 'bg-red-100 text-red-800 border border-red-200'
  }

  const icons = {
    pendente: XCircleIcon,
    em_andamento: ClockIcon,
    concluida: CheckCircleIcon,
    suspenso: StopCircleIcon
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