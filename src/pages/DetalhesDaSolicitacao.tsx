// src/pages/DetalhesDaSolicitacao.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { DetalhesSolicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import type { Solicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import toast from 'react-hot-toast'

const firestore = getFirestore()

interface Solicitacao {
  id: string
  solicitante: string
  tipo: string
  urgencia: string
  status: string
  prazo: string
  descricao: string
  titulo: string
  // Add other fields as necessary
}

function DetalhesDaSolicitacaoPage() {
  const { id } = useParams<{ id: string }>()
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchSolicitacao = async () => {
      try {
        if (!id) {
          toast.error('ID da solicitação não fornecido.')
          return
        }

        const docRef = doc(firestore, 'demandas', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setSolicitacao({ id: docSnap.id, ...data } as Solicitacao)
        } else {
          toast.error('Solicitação não encontrada.')
        }
      } catch (error) {
        toast.error('Erro ao buscar solicitação.')
        console.error('Erro ao buscar solicitação:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSolicitacao()
  }, [id])

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
      {loading ? (
        <p>Carregando...</p>
      ) : solicitacao ? (
        <div>
          <DetalhesSolicitacao 
            solicitacao={{
              ...solicitacao,
              tipo: solicitacao.tipo.charAt(0).toUpperCase() + solicitacao.tipo.slice(1)
            }}
            onSave={handleSave}
            onComplete={handleComplete}
          />
        </div>
      ) : (
        <p>Solicitação não encontrada.</p>
      )}
    </div>
  )
}

export default DetalhesDaSolicitacaoPage