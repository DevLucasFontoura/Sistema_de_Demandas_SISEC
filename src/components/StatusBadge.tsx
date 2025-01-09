interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    em_andamento: 'bg-blue-100 text-blue-800 border border-blue-200',
    concluida: 'bg-green-100 text-green-800 border border-green-200',
    suspenso: 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  const labels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    suspenso: 'Suspenso'
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]} shadow-sm`}>
      {labels[status]}
    </span>
  )
} 