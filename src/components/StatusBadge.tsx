import { getStatusConfig } from '../config/constants'
import { ClockIcon, CheckCircleIcon, XCircleIcon, StopCircleIcon } from '@heroicons/react/24/outline'

interface StatusBadgeProps {
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
}

const icons = {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StopCircleIcon
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const Icon = icons[config.icon as keyof typeof icons]

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor} shadow-sm`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {config.label}
    </span>
  )
} 