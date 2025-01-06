// src/components/solicitacao/DetalhesSolicitacao.tsx
import { useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { StatusSolicitacao } from './StatusSolicitacao'
import { AcoesSolicitacao } from './AcoesSolicitacoes'
import { ComentariosSolicitacao } from './ComentariosSolicitacao'
import { AdiamentoSolicitacao } from './AdiamentoSolicitacao'
import { toast } from 'react-hot-toast'
import { formatDate } from '../../utils/date'

interface Arquivo {
  id: string
  nome: string
  url: string
  tipo: string
}

interface Comentario {
  id: string
  texto: string
  autor: string
  data: Date
  arquivos: Arquivo[]
}

export interface Solicitacao {
  id: string
  titulo: string
  descricao: string
  tipo: string
  status: 'pendente' | 'em_andamento' | 'concluida'
  dataCriacao: string
  prazo: string
  solicitante: string
  responsavel?: string
  comentarios?: Comentario[]
  adiamentos?: {
    novoPrazo: string
    justificativa: string
    dataAdiamento: Date
  }[]
}

interface DetalhesSolicitacaoProps {
  solicitacao: Solicitacao
  onSave: (solicitacao: Solicitacao) => void
  onComplete?: () => void
}

export function DetalhesSolicitacao({
  solicitacao: initialSolicitacao,
  onSave,
  onComplete
}: DetalhesSolicitacaoProps) {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [solicitacao, setSolicitacao] = useState(initialSolicitacao)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSolicitacao(initialSolicitacao)
  }

  const handleSave = () => {
    onSave(solicitacao)
    setIsEditing(false)
  }

  const handleUpdate = (field: keyof Solicitacao, value: string) => {
    setSolicitacao(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddComentario = async (texto: string, arquivos?: File[]) => {
    const novoComentario: Comentario = {
      id: Date.now().toString(),
      texto,
      autor: "Usuário Atual", // Isso deve vir do contexto de autenticação
      data: new Date(),
      arquivos: []
    }

    if (arquivos && arquivos.length > 0) {
      // Aqui você implementaria o upload dos arquivos para o storage
      const arquivosUpload = await Promise.all(
        arquivos.map(async (arquivo) => {
          // Implemente a lógica de upload
          // const url = await uploadArquivo(arquivo)
          return {
            id: Date.now().toString(),
            nome: arquivo.name,
            url: 'url_do_arquivo', // URL retornada pelo seu serviço de storage
            tipo: arquivo.type
          }
        })
      )
      novoComentario.arquivos = arquivosUpload
    }

    setSolicitacao(prev => ({
      ...prev,
      comentarios: [...(prev.comentarios || []), novoComentario]
    }))
  }

  const handleAdiarSolicitacao = (novoPrazo: string, justificativa: string) => {
    const novoAdiamento = {
      novoPrazo,
      justificativa,
      dataAdiamento: new Date()
    }

    setSolicitacao(prev => ({
      ...prev,
      prazo: novoPrazo,
      adiamentos: [...(prev.adiamentos || []), novoAdiamento]
    }))

    // Formata a data para DD / MM / YYYY
    const [ano, mes, dia] = novoPrazo.split('-')
    const dataPrazoFormatada = `${dia} / ${mes} / ${ano}`

    // Adiciona um comentário sobre o adiamento com o novo formato
    const comentarioAdiamento: Comentario = {
      id: Date.now().toString(),
      texto: `Solicitação de adiamento para ${dataPrazoFormatada}\nJustificativa: ${justificativa}`,
      autor: "Sistema",
      data: new Date(),
      arquivos: []
    }

    setSolicitacao(prev => ({
      ...prev,
      comentarios: [...(prev.comentarios || []), comentarioAdiamento]
    }))

    toast.success('Prazo atualizado com sucesso!')
  }

  const formatarData = (data: string) => {
    // Cria uma nova data usando a string da data e adiciona o horário padrão
    const date = new Date(data + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/lista-solicitacoes')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Voltar para Solicitações
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-900">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Demanda: {solicitacao.id}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              {isEditing ? (
                <select
                  value={solicitacao.status}
                  onChange={(e) => handleUpdate('status', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              ) : (
                <div className="mt-1">
                  <StatusSolicitacao status={solicitacao.status} />
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
              <p className="mt-1 text-gray-800">
                {formatDate(solicitacao.dataCriacao)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Prazo</h3>
              {isEditing ? (
                <input
                  type="date"
                  value={solicitacao.prazo}
                  onChange={(e) => handleUpdate('prazo', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">
                  {solicitacao.prazo ? formatarData(solicitacao.prazo) : 'Não definido'}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
              <p className="mt-1 text-gray-800">{solicitacao.solicitante}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Título</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={solicitacao.titulo}
                  onChange={(e) => handleUpdate('titulo', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{solicitacao.titulo}</p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Tipo</h3>
              {isEditing ? (
                <select
                  value={solicitacao.tipo}
                  onChange={(e) => handleUpdate('tipo', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="desenvolvimento">Desenvolvimento</option>
                  <option value="dados">Dados</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800">{solicitacao.tipo}</p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Responsável</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={solicitacao.responsavel || ''}
                  onChange={(e) => handleUpdate('responsavel', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{solicitacao.responsavel}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
              {isEditing ? (
                <textarea
                  value={solicitacao.descricao}
                  onChange={(e) => handleUpdate('descricao', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{solicitacao.descricao}</p>
              )}
            </div>

            {/* <div className="p-4 rounded-lg bg-[#f2f3f5] border border-gray-900">
              <h3 className="text-sm font-medium text-gray-500">Arquivos do Solicitante</h3>
            </div> */}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
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

      {/* <ComentariosSolicitacao
        comentarios={solicitacao.comentarios || []}
        onAddComentario={handleAddComentario}
        className="bg-white border border-gray-900 rounded-lg p-6"
      /> */}
    </div>
  )
}

// Quando eu editar quero q ao salvar ele subistitua os dados la no firebase.