import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import '../utils/Login.css'
import { ClipboardDocumentListIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

function Login() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && !loading) {
      navigate('/painel-demandas')
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    try {
      await login(email, password)
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro ao fazer login. Verifique suas credenciais.')
      toast.error('Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900">
      <div className="container mx-auto px-4 h-screen flex flex-col lg:flex-row items-center justify-center">
        {/* Lado Esquerdo - Informações */}
        <div className="lg:w-1/2 text-white lg:pr-16 mb-8 lg:mb-0">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200 whitespace-nowrap">
              Controle de Demandas
            </h1>
            <h2 className="text-3xl font-semibold mb-8 text-purple-200">
              Equipe TI MDS
            </h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-purple-200" />
                </div>
                <p className="text-lg">Gerencie todas as solicitações em um único lugar</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-200" />
                </div>
                <p className="text-lg">Acompanhe o progresso em tempo real</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-purple-200" />
                </div>
                <p className="text-lg">Colabore com sua equipe de forma eficiente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
              <p className="text-purple-200">Faça login para continuar</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
              </div>
              
              {error && (
                <div className="text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-150"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login