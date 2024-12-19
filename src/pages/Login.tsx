import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import '../utils/Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Login useEffect - user:', user, 'loading:', loading)
    if (user && !loading) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    try {
      console.log('Iniciando login...')
      await login(email, password)
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro ao fazer login. Verifique suas credenciais.')
      toast.error('Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-900 to-black p-8">
      <header className="text-center mb-1 mt-16">
        <h1 className="text-6xl font-extrabold text-white mb-4">
          Controle de Demandas
        </h1>
        <h2 className="text-4xl font-semibold text-purple-300">
          Equipe TI MDS
        </h2>
      </header>
      <div className="flex flex-1 justify-center items-center space-x-24">
        <div className="text-white text-2xl space-y-6 max-w-md">
          <p>Otimize a gestão de tarefas e melhore a eficiência da equipe.</p>
          <p>Monitore o progresso em tempo real e colabore de forma eficaz.</p>
          <p>Alcance seus objetivos com soluções integradas e intuitivas.</p>
        </div>
        <div className="relative animate-dot-border rounded-2xl max-w-2xl w-full">
          <div className="bg-black bg-opacity-70 p-16 rounded-2xl shadow-2xl w-full">
            <h2 className="text-center text-3xl font-bold text-white mb-8">
              Login
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <input
                    id="email"
                    type="email"
                    className="mt-1 w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <input
                    id="password"
                    type="password"
                    className="mt-1 w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <button 
                type="submit" 
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md hover:from-purple-600 hover:to-indigo-600 transition-colors"
              >
                Entrar
              </button>
              <div className="text-center mt-4">
                <a href="/forgot-password" className="text-purple-300 hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login