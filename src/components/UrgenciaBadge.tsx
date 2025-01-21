import { getUrgenciaConfig } from '../config/constants'

interface UrgenciaBadgeProps {
  urgencia: string
}

export function UrgenciaBadge({ urgencia }: UrgenciaBadgeProps) {
  const config = getUrgenciaConfig(urgencia)

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor} shadow-sm`}>
      {config.label}
    </span>
  )
} 