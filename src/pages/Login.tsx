import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import '../utils/Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Bem-vindo ao sistema!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-black p-8">
      <div className="max-w-6xl w-full flex items-center justify-between">
        
        {/* Explicação do Sistema */}
        <div className="text-white mr-8">
          <h2 className="text-6xl font-extrabold mb-8 leading-tight">
            Controle de Demandas<br />Equipe TI MDS
          </h2>
          <ul className="space-y-4 text-xl">
            <li>Otimize a gestão de tarefas e melhore a eficiência da equipe.</li>
            <li>Monitore o progresso em tempo real e colabore de forma eficaz.</li>
            <li>Alcance seus objetivos com soluções integradas e intuitivas.</li>
          </ul>
        </div>

        {/* Formulário de Login */}
        <div className="relative animate-dot-border rounded-2xl">
          <div className="bg-black bg-opacity-70 p-10 rounded-2xl shadow-2xl max-w-md w-full">
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

              <button type="submit" className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md hover:from-purple-600 hover:to-indigo-600 transition-colors">
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