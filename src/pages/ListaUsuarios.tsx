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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Lista de Usuários
        </h1>

        {/* Card da Tabela */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando usuários...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {usuarios.map(usuario => (
                    <tr 
                      key={usuario.id} 
                      className={`${!usuario.ativo ? 'bg-gray-50' : ''} hover:bg-gray-50/50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm
                          ${usuario.ativo 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'}`}
                        >
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleResetPassword(usuario.email)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Resetar Senha
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleToggleUserStatus(usuario.id, usuario.ativo)}
                              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white transition-all duration-200 shadow-sm hover:shadow-md
                                ${usuario.ativo 
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'}`}
                            >
                              {usuario.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && usuarios.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhum usuário encontrado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListaUsuarios 