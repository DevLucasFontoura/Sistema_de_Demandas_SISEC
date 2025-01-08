import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { getAuth, updateUser, signInWithEmailAndPassword } from 'firebase/auth'
import { db } from '../services/firebaseConfig'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { httpsCallable, getFunctions } from 'firebase/functions'

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: 'normal' | 'adm' | 'equipe_ti'
  ativo?: boolean
}

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const auth = getAuth()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const usuariosCollection = collection(db, 'usuarios')
      const usuariosSnapshot = await getDocs(usuariosCollection)
      const usuariosList = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        ativo: doc.data().ativo !== false // Se não existir, considera como true
      })) as Usuario[]
      setUsuarios(usuariosList)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Email de redefinição de senha enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error)
      toast.error('Erro ao enviar email de redefinição de senha')
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus && !window.confirm('Tem certeza que deseja desativar este usuário?')) {
        return
      }

      // Referência ao documento do usuário no Firestore
      const userRef = doc(db, 'usuarios', userId)
      
      // Atualiza o status no Firestore
      await updateDoc(userRef, {
        ativo: !currentStatus
      })

      // Chama a Cloud Function para atualizar o status no Authentication
      const functions = getFunctions()
      const toggleUserStatus = httpsCallable(functions, 'toggleUserStatus')
      
      await toggleUserStatus({ 
        uid: userId, 
        disabled: currentStatus // se currentStatus é true, vamos desabilitar
      })
      
      // Atualiza a lista local
      setUsuarios(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, ativo: !currentStatus }
            : user
        )
      )
      
      toast.success(`Usuário ${currentStatus ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      toast.error('Erro ao alterar status do usuário')
    }
  }

  // Verifica se o usuário atual é admin
  const isAdmin = user?.role === 'adm'

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">Lista de Usuários</h1>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map(usuario => (
                  <tr 
                    key={usuario.id} 
                    className={`${!usuario.ativo ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{usuario.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${usuario.ativo 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}`}
                      >
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResetPassword(usuario.email)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          Resetar Senha
                        </button>
                        {/* Botão de desativar comentado temporariamente
                        {isAdmin && (
                          <button
                            onClick={() => handleToggleUserStatus(usuario.id, usuario.ativo)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors
                              ${usuario.ativo 
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}
                            `}
                          >
                            {usuario.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                        */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListaUsuarios 