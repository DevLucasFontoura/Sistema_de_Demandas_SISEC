import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteField, arrayUnion } from 'firebase/firestore'
import { DetalhesSolicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import type { Solicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ComentariosSolicitacao } from '../components/solicitacao/ComentariosSolicitacao'

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
  responsavel?: string
}

function DetalhesDaSolicitacaoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
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
        setSolicitacao({ id: docSnap.id, ...data } as Solicitacao)
        
        // Processa os comentários
        const comentariosMap = data.comentarios || {}
        const comentariosArray = Object.entries(comentariosMap).map(([id, comentario]: [string, any]) => {
          if (comentario.tipo === 'adiamento' && comentario.novoPrazo) {
            // Formata as datas para o formato desejado
            const mensagemPartes = comentario.mensagem.split('Justificativa:')
            const justificativa = mensagemPartes[1]?.trim() || ''

            // Extrai as datas da mensagem original
            const regex = /de (\d{2}\/\d{2}\/\d{4}) para (\d{2}\/\d{2}\/\d{4})/
            const match = comentario.mensagem.match(regex)
            
            let texto = comentario.mensagem
            if (match) {
              const [_, dataAntiga, dataNova] = match
              texto = `Solicitação de adiamento de ${dataAntiga} para ${dataNova}.\nJustificativa: ${justificativa}`
            }

            return {
              id,
              texto,
              autor: comentario.autor,
              data: new Date(comentario.dataCriacao),
              tipo: comentario.tipo,
              novoPrazo: comentario.novoPrazo,
              arquivos: comentario.arquivos || []
            }
          }
          
          // Para comentários normais
          return {
            id,
            texto: comentario.mensagem,
            autor: comentario.autor,
            data: new Date(comentario.dataCriacao),
            tipo: comentario.tipo || 'comentario',
            novoPrazo: comentario.novoPrazo,
            arquivos: comentario.arquivos || []
          }
        }).sort((a, b) => b.data.getTime() - a.data.getTime())
        
        setComentarios(comentariosArray)
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

      // Função para formatar a data
      const formatarData = (data: string) => {
        const [ano, mes, dia] = data.split('-')
        return `${dia} / ${mes} / ${ano}`
      }

      const userDocRef = doc(firestore, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      const userData = userDoc.data()

      const now = new Date().toISOString()
      const comentarioAdiamento = {
        autor: userData?.nome || user.email,
        dataCriacao: now,
        mensagem: `Solicitou adiamento para ${formatarData(novoPrazo)}.\nJustificativa: ${justificativa}`,
        userId: user.uid,
        arquivos: []
      }

      // Gera um ID único para o comentário
      const comentarioId = Date.now().toString()

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
          comentarios: {
            ...prev.comentarios,
            [comentarioId]: comentarioAdiamento
          }
        }
      })

      toast.success('Adiamento solicitado com sucesso!')
    } catch (error) {
      console.error('Erro ao solicitar adiamento:', error)
      toast.error('Erro ao solicitar adiamento.')
    }
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
          />
        </div>
      ) : (
        <p>Solicitação não encontrada.</p>
      )}
    </div>
  )
}

export default DetalhesDaSolicitacaoPage