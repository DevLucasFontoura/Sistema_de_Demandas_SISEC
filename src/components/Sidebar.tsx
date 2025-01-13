import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, PlusCircleIcon, ClipboardDocumentListIcon, ArrowLeftOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'equipe_ti'

  const baseMenuItems = [
    { path: '/lista-solicitacoes', icon: ClipboardDocumentListIcon, label: 'Solicitações' },
    { path: '/nova-solicitacao', icon: PlusCircleIcon, label: 'Nova Solicitação' },
  ]

  const adminMenuItems = [
    { path: '/cadastrar-usuario', icon: UserPlusIcon, label: 'Cadastrar Usuário' },
    { path: '/lista-usuarios', icon: UserPlusIcon, label: 'Lista de Usuários' },
  ]

  const menuItems = isAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao deslogar:', error)
    }
  }

  const getTipoUsuario = (tipo: string) => {
    switch(tipo) {
      case 'adm':
        return 'Perfil: Administrador'
      case 'equipe_ti':
        return 'Perfil: Equipe de TI'
      default:
        return 'Perfil: Usuário'
    }
  }

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <div className="p-[0.9rem] border-b border-gray-700/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Controle de Demandas
        </h1>
      </div>
      
      <div className="p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex flex-col">
          <div className="flex items-center space-x-4 mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-lg font-semibold">
                {user?.nome?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-white">
              {user?.nome || 'Usuário'}
            </span>
          </div>
          
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-400">
              {user?.email}
            </span>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-200 rounded-full inline-flex items-center w-fit">
              {getTipoUsuario(user?.role)}
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-200 group ${
              isActive(item.path) 
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-sm' 
                : ''
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${
              isActive(item.path) ? 'text-blue-400' : ''
            }`} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-gray-300 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white transition-all duration-200 group"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar 