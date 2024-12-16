import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, PlusCircleIcon, ClipboardDocumentListIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/nova-solicitacao', icon: PlusCircleIcon, label: 'Nova Solicitação' },
    { path: '/lista-solicitacoes', icon: ClipboardDocumentListIcon, label: 'Solicitações' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    navigate('/login')
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