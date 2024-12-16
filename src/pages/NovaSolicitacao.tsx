import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateUniqueId } from '../utils/generateId'
import { formatDate } from '../utils/date'

type TipoDemanda = 'desenvolvimento' | 'dados'
type Urgencia = 'baixa' | 'media' | 'alta'

interface FormData {
  tipo: TipoDemanda
  urgencia: Urgencia
  prazo: string
  solicitante: string
  descricao: string
  arquivos?: File[]
}

function NovaSolicitacao() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    tipo: 'desenvolvimento',
    urgencia: 'media',
    prazo: '',
    solicitante: '',
    descricao: '',
    arquivos: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const novaSolicitacao = {
      ...formData,
      id: generateUniqueId(),
      status: 'pendente',
      dataCriacao: new Date().toISOString()
    }

    try {
      // Aqui você implementaria a lógica para salvar no Firebase
      // await criarDemanda(novaSolicitacao)
      
      toast.success('Solicitação criada com sucesso!')
      navigate('/lista-solicitacoes')
    } catch (error) {
      toast.error('Erro ao criar solicitação')
      console.error(error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Nova Solicitação</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo da Demanda
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoDemanda }))}
            >
              <option value="desenvolvimento">Desenvolvimento</option>
              <option value="dados">Dados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgência
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.urgencia}
              onChange={(e) => setFormData(prev => ({ ...prev, urgencia: e.target.value as Urgencia }))}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prazo de Entrega
          </label>
          <input
            type="text"
            placeholder="00/00/0000"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.prazo ? formatDate(formData.prazo) : ''}
            onFocus={(e) => {
              e.target.type = 'date'
              e.target.showPicker()
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.type = 'text'
              }
            }}
            onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Solicitante
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.solicitante}
            onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Demanda
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anexar Arquivos
          </label>
          <div className="flex items-center">
            <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm cursor-pointer hover:bg-blue-600">
              <span>Escolher arquivos</span>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : []
                  setFormData(prev => ({ ...prev, arquivos: [...(prev.arquivos || []), ...files] }))
                }}
              />
            </label>
          </div>
          {formData.arquivos && formData.arquivos.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
              {formData.arquivos.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md shadow-sm"
          >
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm">
            Criar Solicitação
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovaSolicitacao 