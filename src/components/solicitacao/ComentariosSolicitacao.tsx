// src/components/solicitacao/ComentariosSolicitacao.tsx
import { useState, useRef } from 'react'
import { PaperClipIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

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
}

export function ComentariosSolicitacao({ comentarios, onAddComentario }: ComentariosSolicitacaoProps) {
  const [novoComentario, setNovoComentario] = useState('')
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (novoComentario.trim() || arquivosSelecionados.length > 0) {
      onAddComentario(novoComentario, arquivosSelecionados)
      setNovoComentario('')
      setArquivosSelecionados([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setArquivosSelecionados(prev => [...prev, ...filesArray])
    }
  }

  const handleRemoveFile = (index: number) => {
    setArquivosSelecionados(prev => prev.filter((_, i) => i !== index))
  }

  const handleDownload = (arquivo: Arquivo) => {
    // Aqui você implementaria a lógica para download do arquivo
    window.open(arquivo.url, '_blank')
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Comentários</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          rows={3}
          placeholder="Adicione um comentário..."
        />

        {/* Área de arquivos selecionados */}
        {arquivosSelecionados.length > 0 && (
          <div className="mt-2 space-y-2">
            {arquivosSelecionados.map((arquivo, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <PaperClipIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">{arquivo.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <PaperClipIcon className="h-5 w-5 mr-2" />
            Anexar Arquivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Adicionar Comentário
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-800">{comentario.autor}</span>
              <span className="text-sm text-gray-500">
                {new Date(comentario.data).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{comentario.texto}</p>
            
            {/* Área de arquivos do comentário */}
            {comentario.arquivos && comentario.arquivos.length > 0 && (
              <div className="mt-3 space-y-2">
                {comentario.arquivos.map((arquivo) => (
                  <div key={arquivo.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center">
                      <PaperClipIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{arquivo.nome}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(arquivo)}
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                      Baixar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}