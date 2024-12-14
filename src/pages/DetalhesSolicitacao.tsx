import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Demanda } from '../services/demandas'
import { StatusBadge, UrgenciaBadge } from './ListaSolicitacoes'
import toast from 'react-hot-toast'
import { formatDate } from '../utils/date'

function DetalhesSolicitacao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [demanda, setDemanda] = useState<Demanda | null>(null)
  const [showAdiarModal, setShowAdiarModal] = useState(false)
  const [novoPrazo, setNovoPrazo] = useState('')
  const [justificativa, setJustificativa] = useState('')

  useEffect(() => {
    // Aqui você vai buscar os dados da demanda específica
    // Por enquanto, vamos usar dados mockados
    const demandaMock: Demanda = {
      id: '1',
      tipo: 'desenvolvimento',
      urgencia: 'alta',
      prazo: new Date('2024-02-01'),
      solicitante: 'João Silva',
      descricao: 'Desenvolvimento de nova funcionalidade',
      status: 'pendente',
      dataCriacao: new Date('2024-01-01'),
      adiamentos: [
        {
          novoPrazo: new Date('2024-02-15'),
          justificativa: 'Complexidade maior que o esperado',
          dataAdiamento: new Date('2024-01-20')
        }
      ]
    }
    setDemanda(demandaMock)
  }, [id])

  const handleAdiarDemanda = () => {
    if (!novoPrazo || !justificativa) {
      toast.error('Preencha todos os campos')
      return
    }

    // Aqui você implementará a lógica de salvar no Firebase
    const novoAdiamento = {
      novoPrazo: new Date(novoPrazo),
      justificativa,
      dataAdiamento: new Date()
    }

    setDemanda(prev => {
      if (!prev) return null
      return {
        ...prev,
        prazo: new Date(novoPrazo),
        adiamentos: [...(prev.adiamentos || []), novoAdiamento]
      }
    })

    setShowAdiarModal(false)
    setNovoPrazo('')
    setJustificativa('')
    toast.success('Prazo atualizado com sucesso!')
  }

  if (!demanda) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalhes da Solicitação</h1>
          <p className="text-sm text-gray-500 mt-1">
            Criada em {formatDate(demanda.dataCriacao)}
          </p>
        </div>
        <button
          onClick={() => navigate('/lista-solicitacoes')}
          className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna da Esquerda - Informações */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações da Demanda</h2>
            
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={demanda.status} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                <UrgenciaBadge urgencia={demanda.urgencia} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo da Demanda</label>
                <p className="text-gray-900">{demanda.tipo.charAt(0).toUpperCase() + demanda.tipo.slice(1)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante</label>
                <p className="text-gray-900">{demanda.solicitante}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega</label>
                <p className="text-gray-900">{formatDate(demanda.prazo)}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Demanda</label>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-gray-900">{demanda.descricao}</p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAdiarModal(true)}
                className="flex-1 py-2 px-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md transition-colors"
              >
                Adiar Demanda
              </button>
              <button
                onClick={() => {
                  // TODO: Implementar mudança de status
                  alert('Funcionalidade em desenvolvimento')
                }}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {demanda.status === 'pendente' ? 'Marcar como Atendida' : 'Marcar como Pendente'}
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da Direita - Histórico */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Adiamentos</h2>
            <div className="space-y-4">
              {demanda.adiamentos && demanda.adiamentos.length > 0 ? (
                demanda.adiamentos.map((adiamento, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Novo prazo: {formatDate(adiamento.novoPrazo)}</p>
                        <p className="text-sm text-gray-500">Adiado em: {formatDate(adiamento.dataAdiamento)}</p>
                      </div>
                      <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                        #{demanda.adiamentos!.length - index}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Justificativa:</span><br />
                        {adiamento.justificativa}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum adiamento registrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adiamento */}
      {showAdiarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Adiar Demanda</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo Prazo
                </label>
                <input
                  type="text"
                  placeholder="00/00/0000"
                  className="input w-full text-gray-500"
                  value={novoPrazo ? formatDate(novoPrazo) : ''}
                  onFocus={(e) => {
                    e.target.type = 'date'
                    e.target.showPicker()
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.type = 'text'
                    }
                  }}
                  onChange={(e) => setNovoPrazo(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificativa
                </label>
                <textarea
                  className="input w-full"
                  rows={4}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Explique o motivo do adiamento..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAdiarModal(false)}
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdiarDemanda}
                className="btn btn-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetalhesSolicitacao 