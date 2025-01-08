// src/components/solicitacao/ComentariosSolicitacao.tsx
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
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
  data: Date | string
  arquivos?: Arquivo[]
}

interface Adiamento {
  autor: string
  dataAdiamento: string
  justificativa: string
  novoPrazo: string
}

interface ComentariosSolicitacaoProps {
  comentarios?: Comentario[]
  adiamentos?: Adiamento[]
  onAddComentario: (texto: string, arquivos?: File[]) => void
  onDeleteComentario?: (id: string) => void
  onAdiarSolicitacao: (novoPrazo: string, justificativa: string) => Promise<void>
  className?: string
}

export function ComentariosSolicitacao({
  comentarios = [],
  adiamentos = [],
  onAddComentario,
  onDeleteComentario,
  onAdiarSolicitacao,
  className = ''
}: ComentariosSolicitacaoProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'ti'
  const [novoComentario, setNovoComentario] = useState('')

  const formatDate = (date: Date | string) => {
    let localDate: Date;
    
    if (typeof date === 'string') {
      // Se for string, converte para Date
      localDate = new Date(date + 'T00:00:00')
    } else {
      // Se já for Date, usa diretamente
      localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }
    
    const dia = localDate.getDate().toString().padStart(2, '0')
    const mes = (localDate.getMonth() + 1).toString().padStart(2, '0')
    const ano = localDate.getFullYear()
    return `${dia} / ${mes} / ${ano}`
  }

  const processText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  const getAllItems = () => {
    // Garante que comentarios e adiamentos sejam arrays, mesmo que vazios
    const comentariosArray = comentarios || [];
    const adiamentosArray = adiamentos || [];

    const comentariosFormatados = comentariosArray.map(c => ({
      ...c,
      tipo: 'comentario' as const,
      data: new Date(c.data)
    }));

    const adiamentosFormatados = adiamentosArray.map(a => ({
      id: a.dataAdiamento,
      autor: a.autor,
      data: new Date(a.dataAdiamento),
      texto: `Solicitou adiamento para ${formatDate(a.novoPrazo)}. Justificativa: ${a.justificativa}`,
      tipo: 'adiamento' as const
    }));

    return [...comentariosFormatados, ...adiamentosFormatados]
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  };

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

      {/* Lista de comentários e adiamentos */}
      <div className="space-y-4">
        {getAllItems().map((item) => (
          <div 
            key={item.id} 
            className={`border rounded-lg p-4 ${
              item.tipo === 'adiamento' ? 'bg-yellow-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-gray-800">{item.autor}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDate(item.data)}
                </span>
              </div>
              {item.tipo === 'comentario' && isAdmin && onDeleteComentario && (
                <button
                  onClick={() => onDeleteComentario(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <p 
              className="mt-2 text-gray-600 whitespace-pre-line"
              dangerouslySetInnerHTML={{ 
                __html: item.tipo === 'comentario' 
                  ? processText(item.texto) 
                  : item.texto 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}