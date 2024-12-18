import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addDoc, collection } from 'firebase/firestore'
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { db, auth } from '../services/firebaseConfig' // Certifique-se de que o caminho está correto

interface UsuarioForm {
  nome: string
  email: string
  tipo: 'normal' | 'adm' | 'equipe_ti'
}

function CadastrarUsuario() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<UsuarioForm>({
    nome: '',
    email: '',
    tipo: 'normal'
  })

  const criarUsuarioNoFirebase = async (usuario: UsuarioForm) => {
    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, usuario.email, 'senha-temporaria')
      const uid = userCredential.user.uid

      // Salva o usuário no Firestore com o UID
      const usuariosCollection = collection(db, 'usuarios')
      await addDoc(usuariosCollection, {
        uid,
        ...usuario,
        demandas: [] // Inicializa o array de demandas vazio
      })

      // Envia um email para o usuário definir sua senha
      await sendPasswordResetEmail(auth, usuario.email)

      toast.success('Usuário cadastrado com sucesso! Um email foi enviado para definir a senha.')
    } catch (error) {
      console.error('Erro ao criar usuário no Firebase:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await criarUsuarioNoFirebase(formData)
      navigate('/usuarios')
    } catch (error) {
      toast.error('Erro ao cadastrar usuário')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Cadastrar Usuário</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Usuário
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.tipo}
            onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as UsuarioForm['tipo'] }))}
          >
            <option value="normal">Normal</option>
            <option value="adm">Administrador</option>
            <option value="equipe_ti">Equipe de TI</option>
          </select>
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
            Cadastrar Usuário
          </button>
        </div>
      </form>
    </div>
  )
}

export default CadastrarUsuario 