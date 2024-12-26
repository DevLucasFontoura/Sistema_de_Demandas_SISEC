// src/components/solicitacao/ComentariosSolicitacao.tsx
import { useState, useRef } from 'react'
import { PaperClipIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { AdiamentoSolicitacao } from './AdiamentoSolicitacao'

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
  arquivos?: Arquivo[]
}

interface ComentariosSolicitacaoProps {
  comentarios: Comentario[]
  onAddComentario: (texto: string, arquivos?: File[]) => void
  onDeleteComentario?: (id: string) => void
  onAdiarSolicitacao: (novoPrazo: string, justificativa: string) => Promise<void>
  className?: string
}

export function ComentariosSolicitacao({
  comentarios,
  onAddComentario,
  onDeleteComentario,
  onAdiarSolicitacao,
  className = ''
}: ComentariosSolicitacaoProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'ti'
  const [novoComentario, setNovoComentario] = useState('')

  const formatDate = (date: Date) => {
    const dia = date.getDate().toString().padStart(2, '0')
    const mes = (date.getMonth() + 1).toString().padStart(2, '0')
    const ano = date.getFullYear()
    return `${dia} / ${mes} / ${ano}`
  }

  const processText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  return (
    <div className={`border rounded-lg p-6 bg-white ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Comentários</h2>
        {isAdmin && (
          <AdiamentoSolicitacao onAdiar={onAdiarSolicitacao} />
        )}
      </div>

      {/* Área de novo comentário */}
      <div className="space-y-4 mb-6">
        <textarea
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          placeholder="Adicione um comentário..."
          className="w-full p-3 border rounded-lg resize-none"
          rows={4}
        />
        <button
          onClick={() => {
            if (novoComentario.trim()) {
              onAddComentario(novoComentario)
              setNovoComentario('')
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Adicionar Comentário
        </button>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-4">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-gray-800">{comentario.autor}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDate(comentario.data)}
                </span>
              </div>
              {isAdmin && onDeleteComentario && (
                <button
                  onClick={() => onDeleteComentario(comentario.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <p 
              className="mt-2 text-gray-600 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: processText(comentario.texto) }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}