// src/pages/DetalhesDaSolicitacao.tsx
import { useState } from 'react'
import { DetalhesSolicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import type { Solicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import toast from 'react-hot-toast'

function DetalhesDaSolicitacaoPage() {
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)

  const handleSave = (updatedSolicitacao: Solicitacao) => {
    setSolicitacao(updatedSolicitacao)
    toast.success('Solicitação atualizada com sucesso!')
    // Aqui você pode adicionar a lógica para salvar no backend
    // Por exemplo:
    // await updateSolicitacaoNoFirebase(updatedSolicitacao)
  }

  const handleComplete = () => {
    if (solicitacao) {
      setSolicitacao(prev => {
        if (!prev) return null;

        return {
          ...prev,
          status: 'concluida'
        };
      });
      toast.success('Solicitação marcada como concluída!');
      // Aqui você pode adicionar a lógica para atualizar no backend
    }
  }

  return (
    <div className="p-6">
      {solicitacao ? (
        <DetalhesSolicitacao 
          solicitacao={solicitacao}
          onSave={handleSave}
          onComplete={handleComplete}
        />
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  )
}

export default DetalhesDaSolicitacaoPage