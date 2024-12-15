// src/components/solicitacao/InfoSolicitacao.tsx
import { Solicitacao } from './DetalhesSolicitacao'

interface InfoSolicitacaoProps {
  solicitacao: Solicitacao
  isEditing: boolean
  onUpdate: (field: keyof Solicitacao, value: string) => void
}

export function InfoSolicitacao({ solicitacao, isEditing, onUpdate }: InfoSolicitacaoProps) {
  const formatStatus = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento'
      case 'pendente':
        return 'Pendente'
      case 'concluida':
        return 'Concluída'
      default:
        return status
    }
  }

  const renderField = (label: string, field: keyof Solicitacao, disabled = false) => {
    if (field === 'status' && isEditing) {
      return (
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <select
            value={solicitacao[field] as string}
            onChange={(e) => onUpdate(field, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>
      )
    }

    if (field === 'comentarios' || field === 'adiamentos') {
      return null
    }

    return (
      <div>
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        {isEditing && !disabled ? (
          <input
            type="text"
            value={solicitacao[field] as string}
            onChange={(e) => onUpdate(field, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            disabled={disabled}
          />
        ) : (
          <p className="mt-1 text-gray-800">
            {field === 'status' 
              ? formatStatus(solicitacao[field] as string)
              : typeof solicitacao[field] === 'string' 
                ? solicitacao[field] as string 
                : ''}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {renderField('Status', 'status')}
        {renderField('Descrição', 'descricao')}
        {renderField('Tipo', 'tipo')}
        {renderField('Solicitante', 'solicitante')}
      </div>

      <div className="space-y-4">
        {renderField('Data de Criação', 'dataCriacao', true)}
        {renderField('Prazo', 'prazo')}
        {renderField('Responsável', 'responsavel')}
      </div>
    </div>
  )
}