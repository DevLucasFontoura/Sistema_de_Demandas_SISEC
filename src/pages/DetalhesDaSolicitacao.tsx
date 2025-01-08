import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getFirestore, doc, getDoc, updateDoc, deleteField, arrayUnion } from 'firebase/firestore'
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
      
      // Busca o documento da demanda
      const demandaRef = doc(firestore, 'demandas', id);
      const demandaSnap = await getDoc(demandaRef);
      
      if (demandaSnap.exists()) {
        const data = demandaSnap.data();
        const comentariosMap = data.comentarios || {};
        
        // Converte o map de comentários em um array
        const comentariosArray = Object.entries(comentariosMap).map(([key, value]: [string, any]) => ({
          id: key,
          texto: value.mensagem, // Note que no Firebase está como 'mensagem', não 'texto'
          autor: value.autor,
          data: value.dataCriacao,
          arquivos: value.arquivos || []
        }));
        
        // Ordena por data (mais recentes primeiro)
        const comentariosOrdenados = comentariosArray.sort((a, b) => {
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        });
        
        setComentarios(comentariosOrdenados);
      }
    } catch (error) {
      toast.error('Erro ao carregar comentários.');
    }
  };

  const handleAddComentario = async (texto: string) => {
    try {
      if (!id || !user || !texto.trim()) {
        toast.error('Erro ao adicionar comentário.')
        return
      }

      // Busca os dados do usuário
      const userDocRef = doc(firestore, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      const userData = userDoc.data()

      const timestamp = Date.now();
      const novoComentario = {
        mensagem: texto,
        autor: userData?.nome || user.displayName || 'Usuário', // Prioriza o nome do usuário do banco
        dataCriacao: new Date().toISOString(),
        userId: user.uid,
        arquivos: []
      }

      // Atualiza o documento adicionando o novo comentário ao map
      const demandaRef = doc(firestore, 'demandas', id);
      await updateDoc(demandaRef, {
        [`comentarios.${timestamp}`]: novoComentario
      });

      toast.success('Comentário adicionado com sucesso!')
      await fetchComentarios(); // Recarrega os comentários
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao adicionar comentário.')
    }
  }

  const handleDeleteComentario = async (comentarioId: string) => {
    try {
      if (!id) return;

      // Remove o comentário do map usando deleteField()
      const demandaRef = doc(firestore, 'demandas', id);
      await updateDoc(demandaRef, {
        [`comentarios.${comentarioId}`]: deleteField()
      });

      toast.success('Comentário excluído com sucesso!');
      await fetchComentarios(); // Recarrega os comentários
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário.');
    }
  };

  const handleAdiarSolicitacao = async (novoPrazo: string, justificativa: string) => {
    try {
      if (!id || !user) {
        toast.error('Erro ao solicitar adiamento.')
        return
      }

      // Busca os dados do usuário
      const userDocRef = doc(firestore, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      const userData = userDoc.data()

      const timestamp = Date.now();
      const novoAdiamento = {
        mensagem: `Solicitou adiamento para ${formatarData(novoPrazo)}.\nJustificativa: ${justificativa}`,
        autor: userData?.nome || user.displayName || 'Usuário',
        dataCriacao: new Date().toISOString(),
        userId: user.uid,
        arquivos: [],
        tipo: 'adiamento',
        novoPrazo,
        justificativa
      }

      // Atualiza o documento adicionando o novo adiamento como um comentário e atualiza o prazo
      const demandaRef = doc(firestore, 'demandas', id);
      await updateDoc(demandaRef, {
        [`comentarios.${timestamp}`]: novoAdiamento,
        prazo: novoPrazo // Atualiza o prazo da demanda
      });

      // Atualiza a solicitação local com o novo prazo
      setSolicitacao(prev => ({
        ...prev,
        prazo: novoPrazo
      }));

      toast.success('Adiamento solicitado com sucesso!')
      await fetchComentarios(); // Recarrega os comentários imediatamente
      await fetchSolicitacao(); // Recarrega a solicitação para atualizar o prazo
    } catch (error) {
      console.error('Erro ao solicitar adiamento:', error)
      toast.error('Erro ao solicitar adiamento.')
    }
  }

  const formatarData = (data: string): string => {
    const [ano, mes, dia] = data.split('-')
    return `${dia} / ${mes} / ${ano}`
  }

  useEffect(() => {
    if (id) {
      fetchSolicitacao();
      fetchComentarios(); // Carrega os comentários iniciais
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
            onAdiarSolicitacao={handleAdiarSolicitacao}
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