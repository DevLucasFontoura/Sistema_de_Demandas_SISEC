// src/components/solicitacao/ComentariosSolicitacao.tsx
import { useState, useMemo } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { AdiamentoSolicitacao } from './AdiamentoSolicitacao'
import { toast } from 'react-hot-toast'

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
  const isAdminOrTI = user?.role === 'adm' || user?.role === 'equipe_ti'
  const isAdmin = user?.role === 'adm'
  const [novoComentario, setNovoComentario] = useState('')
  const [arquivos, setArquivos] = useState<File[]>([])

  console.log('ComentariosSolicitacao - Renderizando componente')
  console.log('ComentariosSolicitacao - comentarios:', comentarios)

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

  const todosOsComentarios = useMemo(() => {
    // Função para converter qualquer formato de data para Date
    const parseData = (data: any): Date => {
      if (!data) return new Date(0);

      // Se for timestamp do Firebase
      if (data?.seconds) {
        return new Date(data.seconds * 1000);
      }

      // Se for string ISO
      if (typeof data === 'string') {
        return new Date(data);
      }

      // Se já for Date
      if (data instanceof Date) {
        return data;
      }

      return new Date(0);
    };

    // Formatar comentários
    const comentariosFormatados = Object.entries(comentarios || {}).map(([id, comentario]) => ({
      ...comentario,
      id,
      tipo: 'comentario',
      data: parseData(comentario.dataCriacao || comentario.data)
    }));

    // Formatar adiamentos
    const adiamentosFormatados = (adiamentos || []).map((adiamento, index) => ({
      id: `adiamento-${index}`,
      texto: `Prazo adiado de ${adiamento.dataAntiga} para ${adiamento.dataNova}. Justificativa: ${adiamento.justificativa}`,
      autor: adiamento.solicitante,
      data: parseData(adiamento.data),
      tipo: 'adiamento'
    }));

    // Combinar e ordenar por data (mais recente primeiro)
    return [...comentariosFormatados, ...adiamentosFormatados]
      .sort((a, b) => {
        const dataA = a.data.getTime();
        const dataB = b.data.getTime();
        return dataB - dataA; // Ordem decrescente (mais recente primeiro)
      });
  }, [comentarios, adiamentos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ComentariosSolicitacao - Tentando submeter comentário')
    console.log('ComentariosSolicitacao - Texto:', novoComentario)
    console.log('ComentariosSolicitacao - Arquivos:', arquivos)

    if (!novoComentario.trim()) {
      console.log('ComentariosSolicitacao - Comentário vazio, retornando')
      return
    }

    try {
      await onAddComentario(novoComentario, arquivos)
      console.log('ComentariosSolicitacao - Comentário adicionado com sucesso')
      setNovoComentario('')
      setArquivos([])
    } catch (error) {
      console.error('ComentariosSolicitacao - Erro ao adicionar comentário:', error)
    }
  }

  return (
    <div className={`border rounded-lg p-6 bg-white ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Comentários</h2>
        {isAdminOrTI && (
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
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Adicionar Comentário
        </button>
      </div>

      {/* Lista de comentários e adiamentos */}
      <div className="space-y-4">
        {todosOsComentarios.map((item) => (
          <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-gray-800">{item.autor}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {item.data.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
                  ? processText(item.texto || item.mensagem) 
                  : item.texto 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}