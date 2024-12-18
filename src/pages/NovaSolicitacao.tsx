import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'

const firestore = getFirestore()

type TipoDemanda = 'desenvolvimento' | 'dados'
type Urgencia = 'baixa' | 'media' | 'alta'

interface FormData {
  titulo: string
  tipo: TipoDemanda
  urgencia: Urgencia
  prazo: string
  solicitante: string
  descricao: string
}

function generateRandomId(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString(); // Generates a 7-digit random number
}

function NovaSolicitacao() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    tipo: 'desenvolvimento',
    urgencia: 'media',
    prazo: new Date().toISOString().split('T')[0],
    solicitante: '',
    descricao: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const demandaId = generateRandomId()
    const novaSolicitacao = {
      id: demandaId,
      titulo: formData.titulo,
      descricao: formData.descricao,
      prazo: formData.prazo,
      solicitante: formData.solicitante,
      status: 'pendente',
      tipo: formData.tipo,
      urgencia: formData.urgencia,
      dataCriacao: new Date().toISOString(),
      userId: user?.uid
    }

    try {
      // Save to Firestore in the 'demandas' collection
      await setDoc(doc(firestore, 'demandas', demandaId), novaSolicitacao)
      
      if (user?.uid) {
        const userRef = doc(firestore, 'usuarios', user.uid)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
          await setDoc(userRef, { demandas: [] })
        }

        await updateDoc(userRef, {
          demandas: arrayUnion(demandaId)
        })
      }

      toast.success('Solicitação criada com sucesso!')
      navigate('/lista-solicitacoes')
    } catch (error) {
      toast.error('Erro ao criar solicitação')
      console.error('Erro ao salvar no Firestore:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Nova Solicitação</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
          />
        </div>

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
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.prazo}
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