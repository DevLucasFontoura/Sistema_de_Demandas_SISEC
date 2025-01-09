import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFirestore, doc, getDoc, updateDoc, deleteField, arrayUnion, collection, Timestamp, query, where, orderBy, getDocs } from 'firebase/firestore'
import type { Solicitacao } from '../components/solicitacao/DetalhesSolicitacao'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { StatusBadge } from '../components/StatusBadge'
import { UrgenciaBadge } from '../components/UrgenciaBadge'
import { AcoesSolicitacao } from '../components/solicitacao/AcoesSolicitacoes'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { db } from '../services/firebaseConfig'

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
  const [solicitacao, setSolicitacao] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])
  const isAdmin = user?.role === 'adm' || user?.role === 'ti'
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [novoComentario, setNovoComentario] = useState('')
  const [isAdiamentoModalOpen, setIsAdiamentoModalOpen] = useState(false)
  const [justificativaAdiamento, setJustificativaAdiamento] = useState('')
  const [novaData, setNovaData] = useState('')

  const fetchSolicitacao = async () => {
    if (!id) return;
    
    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      const solicitacaoSnap = await getDoc(solicitacaoRef);
      
      if (solicitacaoSnap.exists()) {
        setSolicitacao({ id: solicitacaoSnap.id, ...solicitacaoSnap.data() });
      } else {
        toast.error('Solicitação não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      toast.error('Erro ao carregar solicitação');
    }
  };

  const fetchComentarios = async () => {
    if (!id) return;

    try {
      const comentariosRef = collection(db, 'comentarios');
      const q = query(comentariosRef, 
        where('solicitacaoId', '==', id),
        orderBy('data', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const comentariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const handleAddComentario = async () => {
    if (!novoComentario.trim()) return;
    
    try {
      // Implemente a lógica de adicionar comentário
      setNovoComentario('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleDeleteComentario = async (comentarioId: string) => {
    try {
      // Implemente a lógica de deletar comentário
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  const handleAdiarSolicitacao = async () => {
    if (!novaData || !justificativaAdiamento) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      // Update the solicitacao with new deadline
      const solicitacaoRef = doc(firestore, 'demandas', id);
      await updateDoc(solicitacaoRef, {
        prazo: novaData
      });

      setIsAdiamentoModalOpen(false);
      setJustificativaAdiamento('');
      setNovaData('');
      
      await fetchSolicitacao();
      toast.success('Solicitação adiada com sucesso!');
    } catch (error) {
      console.error('Erro ao adiar solicitação:', error);
      toast.error('Erro ao adiar solicitação. Tente novamente.');
    }
  };

  const formatarData = (data: any) => {
    if (!data) return 'Não definido';
    
    try {
      // Se for um Timestamp do Firestore
      if (data?.seconds) {
        const date = new Date(data.seconds * 1000);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }
      
      // Se for uma data normal
      if (data instanceof Date) {
        const dia = data.getDate().toString().padStart(2, '0');
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }
      
      // Se for uma string no formato YYYY-MM-DD
      if (typeof data === 'string') {
        const [ano, mes, dia] = data.split('-');
        if (ano && mes && dia) {
          return `${dia}/${mes}/${ano}`;
        }
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  useEffect(() => {
    fetchSolicitacao();
    fetchComentarios();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Aqui você implementa a lógica de salvar as alterações
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
    }
  };

  const onComplete = async () => {
    try {
      // Aqui você implementa a lógica de completar a solicitação
      console.log('Solicitação completada');
    } catch (error) {
      console.error('Erro ao completar solicitação:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Detalhes da Solicitação
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie os detalhes desta solicitação
          </p>
        </div>
        <button
          onClick={() => navigate('/lista-solicitacoes')}
          className="flex items-center px-4 py-2 rounded-lg text-gray-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white transition-all duration-200 group"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Voltar
        </button>
      </div>

      {solicitacao ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Cabeçalho da solicitação */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {solicitacao.titulo}
                </h2>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={solicitacao.status} />
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    Criado em {formatarData(solicitacao.dataCriacao)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-gray-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg transition-all duration-200"
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

          {/* Conteúdo em grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Coluna da esquerda - Descrição e Comentários */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descrição */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Descrição</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap break-words">
                    {solicitacao.descricao}
                  </div>
                  {solicitacao.link && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Link:</p>
                      <a 
                        href={solicitacao.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {solicitacao.link}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Comentários */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Comentários</h3>
                  <button 
                    onClick={() => setIsAdiamentoModalOpen(true)}
                    className="text-sm font-medium text-yellow-600 hover:text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                  >
                    Solicitar Adiamento
                  </button>
                </div>

                {/* Formulário para novo comentário */}
                <div className="mb-6">
                  <textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAddComentario}
                      disabled={!novoComentario.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                    >
                      Adicionar Comentário
                    </button>
                  </div>
                </div>

                {/* Lista de comentários existentes */}
                <div className="space-y-4">
                  {comentarios.map((comentario) => (
                    <div key={comentario.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{comentario.autor}</span>
                          <span className="text-sm text-gray-500">{formatarData(comentario.data)}</span>
                        </div>
                        {user?.email === comentario.autorEmail && (
                          <button
                            onClick={() => handleDeleteComentario(comentario.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comentario.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna da direita - Detalhes */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Detalhes</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Solicitante</p>
                    <p className="text-gray-700 font-medium">{solicitacao.solicitante}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="text-gray-700 font-medium">
                      {solicitacao.tipo === 'desenvolvimento' ? 'Desenvolvimento' : 'Dados'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    <p className="text-gray-700 font-medium">{solicitacao.responsavel || 'Não atribuído'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prazo</p>
                    <p className="text-gray-700 font-medium">{formatarData(solicitacao.prazo)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgência</p>
                    <div className="mt-1">
                      <UrgenciaBadge urgencia={solicitacao.urgencia} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando detalhes da solicitação...</p>
        </div>
      )}

      {/* Modal de Adiamento */}
      <Transition appear show={isAdiamentoModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-10" 
          onClose={() => setIsAdiamentoModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Solicitar Adiamento
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Data
                      </label>
                      <input
                        type="date"
                        value={novaData}
                        onChange={(e) => setNovaData(e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Justificativa
                      </label>
                      <textarea
                        value={justificativaAdiamento}
                        onChange={(e) => setJustificativaAdiamento(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Digite a justificativa para o adiamento..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsAdiamentoModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-600/20 hover:to-pink-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                      onClick={handleAdiarSolicitacao}
                      disabled={!justificativaAdiamento.trim() || !novaData}
                    >
                      Solicitar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default DetalhesDaSolicitacaoPage