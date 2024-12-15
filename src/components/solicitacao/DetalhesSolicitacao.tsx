// src/components/solicitacao/DetalhesSolicitacao.tsx
import { useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { InfoSolicitacao } from './InfoSolicitacao'
import { StatusSolicitacao } from './StatusSolicitacao'
import { AcoesSolicitacao } from './AcoesSolicitacoes'

export interface Solicitacao {
  id: string
  titulo: string
  descricao: string
  tipo: string
  status: 'pendente' | 'em_andamento' | 'concluida'
  dataCriacao: string
  prazo: string
  solicitante: string
  responsavel?: string
}

interface DetalhesSolicitacaoProps {
  solicitacao: Solicitacao
  onSave: (updatedSolicitacao: Solicitacao) => void
  onComplete?: () => void
}

export function DetalhesSolicitacao({ 
  solicitacao: initialSolicitacao, 
  onSave,
  onComplete 
}: DetalhesSolicitacaoProps) {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [solicitacao, setSolicitacao] = useState(initialSolicitacao)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSolicitacao(initialSolicitacao)
  }

  const handleSave = () => {
    onSave(solicitacao)
    setIsEditing(false)
  }

  const handleUpdate = (field: keyof Solicitacao, value: string) => {
    setSolicitacao(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/lista-solicitacoes')}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Voltar para Solicitações
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{solicitacao.titulo}</h2>
            <p className="text-gray-600 mt-1">ID: {solicitacao.id}</p>
          </div>
          <StatusSolicitacao status={solicitacao.status} />
        </div>

        <InfoSolicitacao 
          solicitacao={solicitacao}
          isEditing={isEditing}
          onUpdate={handleUpdate}
        />
        
        <div className="mt-8 flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Salvar
              </button>
            </>
          ) : (
            <AcoesSolicitacao 
              status={solicitacao.status}
              onEdit={handleEdit}
              onComplete={onComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Quando eu editar quero q ao salvar ele subistitua os dados la no firebase.