// src/pages/DetalhesDaSolicitacao.tsx
import { useState } from 'react'
import { DetalhesSolicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import type { Solicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import toast from 'react-hot-toast'

function DetalhesDaSolicitacaoPage() {
  const [solicitacao, setSolicitacao] = useState<Solicitacao>({
    id: "1",
    titulo: "Implementação de Nova Funcionalidade",
    descricao: "Desenvolver um novo módulo de relatórios",
    tipo: "Desenvolvimento",
    status: "em_andamento",
    dataCriacao: "2023-08-01",
    prazo: "2023-08-30",
    solicitante: "João Silva",
    responsavel: "Maria Santos"
  })

  const handleSave = (updatedSolicitacao: Solicitacao) => {
    setSolicitacao(updatedSolicitacao)
    toast.success('Solicitação atualizada com sucesso!')
    // Aqui você pode adicionar a lógica para salvar no backend
    // Por exemplo:
    // await updateSolicitacaoNoFirebase(updatedSolicitacao)
  }

  const handleComplete = () => {
    setSolicitacao(prev => ({
      ...prev,
      status: 'concluida'
    }))
    toast.success('Solicitação marcada como concluída!')
    // Aqui você pode adicionar a lógica para atualizar no backend
  }

  return (
    <div className="p-6">
      <DetalhesSolicitacao 
        solicitacao={solicitacao}
        onSave={handleSave}
        onComplete={handleComplete}
      />
    </div>
  )
}

export default DetalhesDaSolicitacaoPage