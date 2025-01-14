import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFirestore, doc, getDoc, updateDoc, deleteField, arrayUnion, Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { StatusBadge } from '../components/StatusBadge'
import { UrgenciaBadge } from '../components/UrgenciaBadge'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { db } from '../services/firebaseConfig'
import { SelectResponsavel } from '../components/SelectResponsavel'

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

interface Solicitacao {
  id: string
  solicitante: string
  tipo: 'desenvolvimento' | 'dados' | 'suporte_tecnico' | 'infraestrutura_ti' | 'outros'
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
  const [solicitacao, setSolicitacao] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])
  const isAdminOrTI = user?.role === 'adm' || user?.role === 'equipe_ti'
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [novoComentario, setNovoComentario] = useState('')
  const [isAdiamentoModalOpen, setIsAdiamentoModalOpen] = useState(false)
  const [justificativaAdiamento, setJustificativaAdiamento] = useState('')
  const [novaData, setNovaData] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    solicitante: '',
    tipo: '',
    responsavel: '',
    urgencia: '',
    descricao: '',
    status: ''
  });

  // Ajustando a verificação para "Equipe de TI"
  const isEquipeTI = userProfile?.perfil === "Equipe de TI";

  // Função para buscar perfil do usuário com log para debug
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const fetchSolicitacao = async () => {
    if (!id) return;
    
    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      const solicitacaoSnap = await getDoc(solicitacaoRef);
      
      if (solicitacaoSnap.exists()) {
        const data = solicitacaoSnap.data();
        setSolicitacao({ 
          ...data,
          id: solicitacaoSnap.id // Garantindo que o ID está disponível
        });
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
      const solicitacaoRef = doc(db, 'demandas', id);
      const solicitacaoSnap = await getDoc(solicitacaoRef);
      
      if (solicitacaoSnap.exists()) {
        const data = solicitacaoSnap.data();
        if (data.comentarios) {
          // Convertendo o objeto de comentários em array
          const comentariosArray = Object.entries(data.comentarios).map(([key, value]: [string, any]) => ({
            id: key,
            ...value,
            // Garantindo que a data seja um objeto Date para comparação
            timestamp: new Date(value.dataCriacao).getTime()
          }));
          
          // Ordenando por timestamp (mais recentes primeiro)
          const comentariosOrdenados = comentariosArray.sort((a, b) => {
            return b.timestamp - a.timestamp;
          });
          
          setComentarios(comentariosOrdenados);
        } else {
          setComentarios([]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast.error('Erro ao carregar comentários');
    }
  };

  const handleAddComentario = async () => {
    if (!novoComentario.trim()) return;

    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      const timestamp = new Date().toISOString();
      
      // Get user's name from Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', user?.uid || ''));
      const userName = userDoc.exists() ? userDoc.data().nome : user?.email;
      
      await updateDoc(solicitacaoRef, {
        [`comentarios.${Date.now()}`]: {
          mensagem: novoComentario,
          autor: userName, // Use the user's name instead of email
          userId: user?.uid,
          dataCriacao: timestamp,
          arquivos: []
        }
      });

      setNovoComentario('');
      await fetchComentarios();
      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleDeleteComentario = async (comentarioId: string) => {
    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      await updateDoc(solicitacaoRef, {
        [`comentarios.${comentarioId}`]: deleteField()
      });
      
      await fetchComentarios();
      toast.success('Comentário removido com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao remover comentário');
    }
  };

  const handleAdiarSolicitacao = async () => {
    if (!id || !novaData || !justificativaAdiamento.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      
      // Busca o perfil do usuário para ter o nome correto
      const userDoc = await getDoc(doc(db, 'usuarios', user?.uid || ''));
      const userName = userDoc.exists() ? userDoc.data().nome : 'Usuário';
      
      // Atualiza apenas a data da solicitação e o histórico de adiamentos
      await updateDoc(solicitacaoRef, {
        prazo: novaData,
        adiamentos: arrayUnion({
          dataAntiga: solicitacao?.prazo,
          dataNova: novaData,
          justificativa: justificativaAdiamento,
          solicitante: userName,
          data: Timestamp.now()
        })
      });

      // Adiciona apenas o comentário de adiamento
      await updateDoc(solicitacaoRef, {
        [`comentarios.${Date.now()}`]: {
          mensagem: `Solicitação de Adiamento pelo usuário: ${userName}\nMotivo: ${justificativaAdiamento}`,
          autor: userName,
          dataCriacao: Timestamp.now(),
          userId: user?.uid,
          arquivos: []
        }
      });

      // Limpa os campos e fecha o modal
      setIsAdiamentoModalOpen(false);
      setJustificativaAdiamento('');
      setNovaData('');
      
      // Recarrega os dados
      await Promise.all([
        fetchSolicitacao(),
        fetchComentarios()
      ]);

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
      if (data && typeof data === 'object' && 'seconds' in data) {
        const date = new Date(data.seconds * 1000);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      // Se for uma string de data no formato YYYY-MM-DD
      if (typeof data === 'string') {
        if (data.includes('-')) {
          const [ano, mes, dia] = data.split('-');
          return `${dia}/${mes}/${ano}`;
        }
        
        // Se for uma string ISO
        const date = new Date(data);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatarDataCriacao = (data: any) => {
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
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatarDataComentario = (data: any) => {
    try {
      // Se for um Timestamp do Firestore
      if (data && typeof data === 'object' && 'seconds' in data) {
        const date = new Date(data.seconds * 1000);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      // Se for uma string ISO
      if (typeof data === 'string') {
        const date = new Date(data);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data do comentário:', error);
      return 'Data inválida';
    }
  };

  useEffect(() => {
    fetchSolicitacao();
    fetchComentarios();
  }, [id]);

  const handleEdit = () => {
    setEditForm({
      solicitante: solicitacao.solicitante,
      tipo: solicitacao.tipo,
      responsavel: solicitacao.responsavel || '',
      urgencia: solicitacao.urgencia,
      descricao: solicitacao.descricao,
      status: solicitacao.status
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      solicitante: '',
      tipo: '',
      responsavel: '',
      urgencia: '',
      descricao: '',
      status: ''
    });
  };

  const handleSave = async () => {
    if (!solicitacao?.id) return;

    try {
      const solicitacaoRef = doc(db, 'demandas', solicitacao.id);
      await updateDoc(solicitacaoRef, {
        solicitante: editForm.solicitante,
        tipo: editForm.tipo,
        responsavel: editForm.responsavel,
        urgencia: editForm.urgencia,
        descricao: editForm.descricao,
        status: editForm.status
      });

      // Atualiza o estado local
      setSolicitacao({
        ...solicitacao,
        ...editForm
      });

      setIsEditing(false);
      toast.success('Solicitação atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      toast.error('Erro ao atualizar solicitação');
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      
      // Busca o perfil do usuário para ter o nome correto
      const userDoc = await getDoc(doc(db, 'usuarios', user?.uid || ''));
      const userName = userDoc.exists() ? userDoc.data().nome : 'Usuário';
      
      // Atualiza o status da demanda
      await updateDoc(solicitacaoRef, {
        status: 'concluida',
        dataFinalizacao: Timestamp.now()
      });
      
      // Adiciona o comentário de conclusão com a mensagem correta
      await updateDoc(solicitacaoRef, {
        [`comentarios.${Date.now()}`]: {
          mensagem: `Demanda finalizada pelo usuário: ${userName}`,
          autor: userName,
          dataCriacao: Timestamp.now(),
          userId: user?.uid,
          arquivos: []
        }
      });

      // Feedback visual
      toast.success('Demanda concluída com sucesso!');
      
      // Recarrega os dados
      await Promise.all([
        fetchSolicitacao(),
        fetchComentarios()
      ]);
    } catch (error) {
      console.error('Erro ao concluir demanda:', error);
      toast.error('Erro ao concluir demanda. Tente novamente.');
    }
  };

  const handleReopen = async () => {
    if (!id) return;

    try {
      const solicitacaoRef = doc(db, 'demandas', id);
      
      // Busca o perfil do usuário para ter o nome correto
      const userDoc = await getDoc(doc(db, 'usuarios', user?.uid || ''));
      const userName = userDoc.exists() ? userDoc.data().nome : 'Usuário';
      
      // Atualiza o status da demanda
      await updateDoc(solicitacaoRef, {
        status: 'em_andamento'
      });
      
      // Adiciona o comentário usando o nome correto do usuário
      await updateDoc(solicitacaoRef, {
        [`comentarios.${Date.now()}`]: {
          mensagem: `Demanda reaberta pelo usuário: ${userName}`,
          autor: userName,
          dataCriacao: Timestamp.now(),
          userId: user?.uid,
          arquivos: []
        }
      });

      // Feedback visual
      toast.success('Demanda reaberta com sucesso!');
      
      // Recarrega os dados
      await Promise.all([
        fetchSolicitacao(),
        fetchComentarios()
      ]);
    } catch (error) {
      console.error('Erro ao reabrir demanda:', error);
      toast.error('Erro ao reabrir demanda. Tente novamente.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-500">
            Detalhes da Solicitação - Nº {solicitacao?.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie os detalhes desta solicitação
          </p>
        </div>
        <button
          onClick={() => navigate('/lista-solicitacoes')}
          className="flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
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
              </div>
              
              <div className="flex space-x-3">
                {solicitacao?.status === 'concluida' && isAdminOrTI && (
                  <button
                    onClick={handleReopen}
                    className="px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-500 hover:to-cyan-600 font-medium"
                  >
                    Reabrir Demanda
                  </button>
                )}
                {solicitacao?.status !== 'concluida' && isAdminOrTI && (
                  <>
                    <button
                      onClick={isEditing ? handleSave : handleEdit}
                      className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 font-medium"
                    >
                      {isEditing ? 'Salvar' : 'Editar'}
                    </button>
                    
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => setIsAdiamentoModalOpen(true)}
                          className="px-4 py-2 text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 font-medium"
                        >
                          Solicitar Adiamento
                        </button>
                        <button
                          onClick={handleComplete}
                          className="px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-500 hover:to-cyan-600 font-medium"
                        >
                          Marcar como Concluído
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo em grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Coluna da esquerda - Descrição e Comentários */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descrição */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Descrição</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap break-words">
                    {isEditing ? (
                      <textarea
                        value={editForm.descricao}
                        onChange={(e) => setEditForm(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{solicitacao.descricao}</p>
                    )}
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
              {solicitacao?.status !== 'concluida' && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Comentários</h3>
                  </div>
                  
                  {/* Formulário para novo comentário */}
                  <div className="mb-6">
                    <textarea
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleAddComentario}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Adicionar Comentário
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de comentários */}
              <div className="space-y-4 mt-4">
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{comentario.autor}</span>
                        <span className="text-sm text-gray-500">
                          {formatarDataComentario(comentario.dataCriacao)}
                        </span>
                      </div>
                      {isAdminOrTI && solicitacao?.status !== 'concluida' && (
                        <button
                          onClick={() => handleDeleteComentario(comentario.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comentario.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna da direita - Detalhes */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Detalhes</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="suspenso">Suspenso</option>
                      </select>
                    ) : (
                      <div className="mt-1">
                        <StatusBadge status={solicitacao.status} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgência</p>
                    {isEditing ? (
                      <select
                        value={editForm.urgencia}
                        onChange={(e) => setEditForm(prev => ({ ...prev, urgencia: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    ) : (
                      <UrgenciaBadge urgencia={solicitacao.urgencia} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    {isEditing ? (
                      <select
                        value={editForm.tipo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, tipo: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="desenvolvimento">Desenvolvimento</option>
                        <option value="dados">Dados</option>
                      </select>
                    ) : (
                      <p className="text-gray-700 font-medium">
                        {solicitacao.tipo === 'desenvolvimento' ? 'Desenvolvimento' : 'Dados'}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Criado em</p>
                    <p className="text-gray-700 font-medium">{formatarDataCriacao(solicitacao.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prazo</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={solicitacao.prazo}
                        onChange={(e) => handleUpdate('prazo', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700 font-medium">
                        {solicitacao.prazo ? formatarData(solicitacao.prazo) : 'Não definido'}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    {isEditing ? (
                      <SelectResponsavel
                        value={editForm.responsavel}
                        onChange={(value) => setEditForm(prev => ({ ...prev, responsavel: value }))}
                      />
                    ) : (
                      <p className="text-gray-700 font-medium">{solicitacao.responsavel || 'Não atribuído'}</p>
                    )}
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