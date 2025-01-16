import { ClipboardDocumentListIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Engine } from "tsparticles-engine"
import { useNavigate } from 'react-router-dom'
import { loadSlim } from "tsparticles-slim"
import Particles from "react-particles"
import toast from 'react-hot-toast'
import '../utils/Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
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
      await login(email, password)
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro ao fazer login. Verifique suas credenciais.')
      toast.error('Erro ao fazer login')
    }
  }

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const particlesConfig = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 1000
        }
      },
      color: {
        value: "#ffffff"
      },
      links: {
        enable: true,
        distance: 200,
        color: "#ffffff",
        opacity: 0.15,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: false,
        straight: false,
        outModes: {
          default: "bounce"
        },
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        onClick: {
          enable: true,
          mode: "push"
        }
      },
      modes: {
        grab: {
          distance: 180,
          links: {
            opacity: 0.3
          }
        }
      }
    },
    background: {
      color: "transparent"
    },
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    detectRetina: true
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500">
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        className="absolute inset-0"
      />

      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-cyan-400 opacity-20 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-300 opacity-20 blur-3xl"></div>
        
        {/* Grade decorativa */}
        <div className="absolute inset-0" 
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 h-screen flex flex-col lg:flex-row items-center justify-center relative z-10">
        {/* Lado Esquerdo - Informações */}
        <div className="lg:w-1/2 text-white lg:pr-16 mb-8 lg:mb-0">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 whitespace-nowrap">
              Controle de Demandas
            </h1>
            <h2 className="text-3xl font-semibold mb-8 text-blue-100">
              Equipe TI MDS
            </h2>
            <div className="space-y-6 backdrop-blur-sm bg-white/5 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-lg">Gerencie todas as solicitações em um único lugar</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-lg">Acompanhe o progresso em tempo real</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-lg">Colabore com sua equipe de forma eficiente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
              <p className="text-blue-100">Faça login para continuar</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
              
              {error && (
                <div className="text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-100 transition-all duration-150 shadow-lg hover:shadow-xl"
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