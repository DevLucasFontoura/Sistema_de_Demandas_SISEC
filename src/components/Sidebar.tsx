import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, PlusCircleIcon, ClipboardDocumentListIcon, ArrowLeftOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = user?.role === 'adm' || user?.role === 'equipe_ti'

  // Menu items básicos para todos os usuários
  const baseMenuItems = [
    { path: '/lista-solicitacoes', icon: ClipboardDocumentListIcon, label: 'Solicitações' },
    { path: '/nova-solicitacao', icon: PlusCircleIcon, label: 'Nova Solicitação' },
    // { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  ]

  // Menu items apenas para administradores
  const adminMenuItems = [
    { path: '/cadastrar-usuario', icon: UserPlusIcon, label: 'Cadastrar Usuário' },
    { path: '/lista-usuarios', icon: UserPlusIcon, label: 'Lista de Usuários' },
  ]

  // Combina os menus baseado na role do usuário
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

  return (
    <div className="flex flex-col w-64 bg-gray-800 min-h-screen text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">Controle de Demandas</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 transition-colors ${
              isActive(item.path) ? 'bg-gray-700' : ''
            }`}
          >
            <item.icon className="w-6 h-6 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 w-full transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar 