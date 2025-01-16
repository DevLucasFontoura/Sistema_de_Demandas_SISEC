import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore'
import { SelectResponsavel } from '../components/SelectResponsavel'

const firestore = getFirestore()

type TipoDemanda = 'desenvolvimento' | 'dados' | 'suporte' | 'infraestrutura' | 'outros'
type Urgencia = 'baixa' | 'media' | 'alta'

interface FormData {
  titulo: string
  tipo: TipoDemanda
  urgencia: Urgencia
  prazo: string
  solicitante: string
  descricao: string
  responsavel: string
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
    responsavel: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.titulo.length > 70) {
      toast.error('O título deve ter no máximo 70 caracteres')
      return
    }

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
      responsavel: formData.responsavel,
      createdAt: serverTimestamp(),
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
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Nova Solicitação
        </h1>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título <span className="text-xs text-gray-500">({formData.titulo.length}/70)</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={formData.titulo}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 70) {
                      setFormData(prev => ({ ...prev, titulo: value }))
                    }
                  }}
                  placeholder="Digite o título da solicitação"
                  maxLength={70}
                />
              </div>

              {/* Grid de 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo da Demanda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo da Demanda
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoDemanda }))}
                  >
                    <option value="desenvolvimento">Desenvolvimento</option>
                    <option value="dados">Dados</option>
                    <option value="suporte">Suporte</option>
                    <option value="infraestrutura">Infraestrutura</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                {/* Urgência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgência
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={formData.urgencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgencia: e.target.value as Urgencia }))}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Grid de 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prazo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo de Entrega
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={formData.prazo}
                    onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Solicitante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Solicitante
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={formData.solicitante}
                    onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
                    placeholder="Digite o nome do solicitante"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Demanda
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-h-[120px]"
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva detalhadamente a sua solicitação"
                />
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável
                </label>
                <SelectResponsavel
                  value={formData.responsavel}
                  onChange={(value) => setFormData(prev => ({ ...prev, responsavel: value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/lista-solicitacoes')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Criar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NovaSolicitacao 