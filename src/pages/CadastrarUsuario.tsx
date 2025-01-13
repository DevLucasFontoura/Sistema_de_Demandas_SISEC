import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { doc, setDoc } from 'firebase/firestore'
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

      // Salva o usuário no Firestore com o UID como nome do documento e como um campo
      const userDocRef = doc(db, 'usuarios', uid)
      await setDoc(userDocRef, {
        uid, // Save the UID as a field in the document
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
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
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Cadastrar Usuário
        </h1>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome do usuário"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite o email do usuário"
                />
              </div>

              {/* Tipo de Usuário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as UsuarioForm['tipo'] }))}
                >
                  <option value="normal">Normal</option>
                  <option value="adm">Administrador</option>
                  <option value="equipe_ti">Equipe de TI</option>
                </select>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/lista-usuarios')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CadastrarUsuario 