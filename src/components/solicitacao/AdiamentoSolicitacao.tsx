// src/components/solicitacao/AdiamentoSolicitacao.tsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface AdiamentoProps {
  onAdiar: (novoPrazo: string, justificativa: string) => void
}

export function AdiamentoSolicitacao({ onAdiar }: AdiamentoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [novoPrazo, setNovoPrazo] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const { user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'equipe_ti'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (novoPrazo && justificativa) {
      onAdiar(novoPrazo, justificativa)
      setIsOpen(false)
      setNovoPrazo('')
      setJustificativa('')
    }
  }

  if (!isAdmin) return null

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          Solicitar Adiamento
        </button>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Solicitar Adiamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Novo Prazo
                </label>
                <input
                  type="date"
                  value={novoPrazo}
                  onChange={(e) => setNovoPrazo(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Justificativa
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Confirmar Adiamento
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}