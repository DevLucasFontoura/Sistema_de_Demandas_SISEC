import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, deleteField, arrayUnion } from 'firebase/firestore'
import { DetalhesSolicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import type { Solicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ComentariosSolicitacao } from '../components/solicitacao/ComentariosSolicitacao'

interface Comentario {
  id: string
  texto: string
  autor: string
  data: Date
  tipo?: 'comentario' | 'adiamento'
  novoPrazo?: string
  arquivos?: string[]
}

const firestore = getFirestore()

// interface Solicitacao {
//   id: string
//   solicitante: string
//   tipo: string
//   urgencia: string
//   status: string
//   prazo: string
//   descricao: string
//   titulo: string
//   responsavel?: string
// }

function DetalhesDaSolicitacaoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const isAdmin = user?.role === 'adm' || user?.role === 'ti'

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
        
        setSolicitacao({ 
          id: docSnap.id,
          titulo: data.titulo || '',
          descricao: data.descricao || '',
          tipo: data.tipo || '',
          status: data.status || 'pendente',
          dataCriacao: data.createdAt || null, // Mantém o timestamp original
          prazo: data.prazo || '',
          solicitante: data.solicitante || '',
          responsavel: data.responsavel || '',
          urgencia: data.urgencia || 'media',
          userId: data.userId || ''
        } as Solicitacao)
      } else {
        toast.error('Solicitação não encontrada.')
      }
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error)
      toast.error('Erro ao buscar solicitação.')
    }
  }

  const fetchComentarios = async () => {
    try {
      if (!id) return;
      
      const comentariosRef = collection(firestore, 'demandas', id, 'comentarios');
      const querySnapshot = await getDocs(comentariosRef);
      
      const comentariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        texto: doc.data().mensagem,
        autor: doc.data().autor,
        data: new Date(doc.data().dataCriacao),
        arquivos: doc.data().arquivos || []
      }));
      
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast.error('Erro ao carregar comentários.');
    }
  };

  const handleAddComentario = async (texto: string, arquivos?: File[]) => {
    try {
      if (!id || !user || !texto.trim()) {
        toast.error('Erro ao adicionar comentário.')
        return
      }

      // Busca os dados do usuário no Firestore
      const userDocRef = doc(firestore, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      const userData = userDoc.data()

      const docRef = doc(firestore, 'demandas', id)
      const comentarioId = Date.now().toString()
      
      // Usa o nome do documento do usuário
      const novoComentario = {
        autor: userData?.nome || 'Usuário', // Usa o nome do documento do usuário
        userId: user.uid,
        mensagem: texto,
        dataCriacao: new Date().toISOString(),
        arquivos: []
      }

      await updateDoc(docRef, {
        [`comentarios.${comentarioId}`]: novoComentario
      })

      toast.success('Comentário adicionado com sucesso!')
      await fetchSolicitacao()
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao adicionar comentário.')
    }
  }

  const handleDeleteComentario = async (comentarioId: string) => {
    try {
      if (!id) return;

      const docRef = doc(firestore, 'demandas', id);
      
      // Remove o comentário do map
      await updateDoc(docRef, {
        [`comentarios.${comentarioId}`]: deleteField()
      });

      toast.success('Comentário excluído com sucesso!');
      await fetchSolicitacao(); // Recarrega os comentários
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário.');
    }
  };

  const handleAdiarSolicitacao = async (novoPrazo: string, justificativa: string) => {
    try {
      if (!id || !user) {
        toast.error('Erro ao adicionar adiamento.')
        return
      }

      const userDocRef = doc(firestore, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      const userData = userDoc.data()

      const now = new Date().toISOString()
      const comentarioId = Date.now().toString()
      const comentarioAdiamento = {
        autor: userData?.nome || user.email,
        dataCriacao: now,
        mensagem: `Solicitou adiamento para ${formatarData(novoPrazo)}.\nJustificativa: ${justificativa}`,
        userId: user.uid,
        arquivos: []
      }

      // Atualiza a solicitação com o novo prazo e adiciona tanto no adiamento quanto nos comentários
      await updateDoc(doc(firestore, 'demandas', id), {
        prazo: novoPrazo,
        adiamentos: arrayUnion({
          novoPrazo,
          justificativa,
          dataAdiamento: now,
          autor: userData?.nome || user.email
        }),
        [`comentarios.${comentarioId}`]: comentarioAdiamento
      })

      // Atualiza o estado local
      setSolicitacao(prev => {
        if (!prev) return null
        return {
          ...prev,
          prazo: novoPrazo,
          // Mantém a estrutura original dos comentários e adiciona o novo
          comentarios: {
            ...prev.comentarios,
            [comentarioId]: {
              id: comentarioId,
              texto: comentarioAdiamento.mensagem,
              autor: comentarioAdiamento.autor,
              data: new Date(comentarioAdiamento.dataCriacao),
              tipo: 'adiamento',
              novoPrazo,
              arquivos: []
            }
          }
        }
      })

      toast.success('Adiamento solicitado com sucesso!')
    } catch (error) {
      console.error('Erro ao solicitar adiamento:', error)
      toast.error('Erro ao solicitar adiamento.')
    }
  }

  const formatarData = (data: string): string => {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  useEffect(() => {
    if (id) {
      fetchSolicitacao();
    }
  }, [id]);

  const handleSave = async (updatedSolicitacao: Solicitacao) => {
    try {
      if (!id) {
        toast.error('ID da solicitação não fornecido.')
        return
      }

      const { id: docId, ...updateData } = updatedSolicitacao
      const docRef = doc(firestore, 'demandas', id)
      await updateDoc(docRef, updateData)

      setSolicitacao(updatedSolicitacao)
      toast.success('Solicitação atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar solicitação.')
      console.error('Erro ao atualizar solicitação:', error)
    }
  }

  const handleComplete = async () => {
    if (solicitacao) {
      try {
        const docRef = doc(firestore, 'demandas', id)
        await updateDoc(docRef, { status: 'concluida' })
        
        await fetchSolicitacao()
        toast.success('Solicitação marcada como concluída!')
      } catch (error) {
        toast.error('Erro ao atualizar solicitação.')
        console.error('Erro ao atualizar solicitação:', error)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {solicitacao ? (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <DetalhesSolicitacao 
              solicitacao={solicitacao} 
              onSave={handleSave}
              onComplete={handleComplete}
            />
          </div>
          
          <ComentariosSolicitacao
            comentarios={comentarios}
            onAddComentario={handleAddComentario}
            onDeleteComentario={handleDeleteComentario}
            onAdiarSolicitacao={async (novoPrazo, justificativa) => {
              console.log('DetalhesDaSolicitacao: Chamando handleAdiarSolicitacao', {
                novoPrazo,
                justificativa
              })
              await handleAdiarSolicitacao(novoPrazo, justificativa)
            }}
            className="mt-6"
            isAdmin={isAdmin}
          />
        </div>
      ) : (
        <p>Solicitação não encontrada.</p>
      )}
    </div>
  )
}

export default DetalhesDaSolicitacaoPage