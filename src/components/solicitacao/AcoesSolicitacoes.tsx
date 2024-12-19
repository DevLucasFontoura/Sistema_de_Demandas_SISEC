// src/components/solicitacao/AcoesSolicitacao.tsx
import { useAuth } from '../../context/AuthContext'

interface AcoesSolicitacaoProps {
  status: string
  onEdit?: () => void
  onComplete?: () => void
}

export function AcoesSolicitacao({ 
  status, 
  onEdit, 
  onComplete 
}: AcoesSolicitacaoProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'equipe_ti'

  if (!isAdmin) return null

  return (
    <div className="mt-8 flex justify-end space-x-4">
      <button
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        onClick={onEdit}
      >
        Editar
      </button>
      {status !== 'concluida' && (
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          onClick={onComplete}
        >
          Marcar como Concluída
        </button>
      )}
    </div>
  )
}