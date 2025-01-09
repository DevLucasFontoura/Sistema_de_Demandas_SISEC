interface UrgenciaBadgeProps {
  urgencia: string
}

export function UrgenciaBadge({ urgencia }: UrgenciaBadgeProps) {
  const styles = {
    baixa: 'bg-green-100 text-green-800 border border-green-200',
    media: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    alta: 'bg-red-100 text-red-800 border border-red-200'
  } as const

  const labels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta'
  } as const

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[urgencia]} shadow-sm`}>
      {labels[urgencia]}
    </span>
  )
} 