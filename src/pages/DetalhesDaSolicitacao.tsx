import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore'
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

  const fetchSolicitacao = async () => {
    try {
      if (!id) {
        toast.error('ID da solicitação não fornecido.')
        return
      }

      console.log('Buscando solicitação e comentários...')
      const docRef = doc(firestore, 'demandas', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setSolicitacao({ id: docSnap.id, ...data } as Solicitacao)
        
        const comentariosMap = data.comentarios || {}
        const comentariosArray = Object.entries(comentariosMap).map(([id, comentario]: [string, any]) => ({
          id,
          texto: comentario.mensagem,
          autor: comentario.autor,
          data: new Date(comentario.dataCriacao),
          arquivos: comentario.arquivos || []
        })).sort((a, b) => b.data.getTime() - a.data.getTime())
        
        console.log('Comentários carregados:', comentariosArray)
        setComentarios(comentariosArray)
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

      const docRef = doc(firestore, 'demandas', id)
      await updateDoc(docRef, updatedSolicitacao)

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

  const isUserAdminOrIT = user?.role === 'admin' || user?.role === 'ti'
  console.log('User role:', user?.role)

  return (
    <div className="p-6">
      {loading ? (
        <p>Carregando...</p>
      ) : solicitacao ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">{solicitacao.titulo}</h1>
          <DetalhesSolicitacao 
            solicitacao={{
              ...solicitacao,
              tipo: solicitacao.tipo.charAt(0).toUpperCase() + solicitacao.tipo.slice(1)
            }}
            onSave={handleSave}
            onComplete={handleComplete}
          />
          {isUserAdminOrIT && (
            <div className="flex space-x-4 mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded">Editar</button>
              <button onClick={handleComplete} className="px-4 py-2 bg-blue-500 text-white rounded">
                Marcar como Concluída
              </button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded">
                Solicitar Adiamento
              </button>
            </div>
          )}
          
          <ComentariosSolicitacao
            comentarios={comentarios}
            onAddComentario={handleAddComentario}
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