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
    <div className="flex flex-col w-64 bg-gray-800 min-h-screen text-white">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Controle de Demandas</h1>
      </div>
      
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {user?.nome?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="ml-3 flex flex-col space-y-0.5">
            <span className="text-sm font-semibold text-white">
              {user?.nome || 'Usuário'}
            </span>
            <span className="text-xs text-gray-400">
              {user?.email}
            </span>
            <span className="text-xs text-gray-400">
              {getTipoUsuario(user?.role)}
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 transition-colors ${
              isActive(item.path) ? 'bg-gray-700' : ''
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 w-full transition-colors rounded"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar 