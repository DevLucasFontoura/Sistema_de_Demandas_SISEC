import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/AppLayout'
import NovaSolicitacao from './pages/NovaSolicitacao'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ListaSolicitacoes from './pages/ListaSolicitacoes'
import DetalhesSolicitacao from './pages/DetalhesDaSolicitacao'
import CadastrarUsuario from './pages/CadastrarUsuario'
import ListaUsuarios from './pages/ListaUsuarios'
import PainelDemandas from './pages/PainelDemandas'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ProtectedRoute allowedUserTypes={['adm', 'equipe_ti', 'normal']}>
                <AppLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="nova-solicitacao" element={<NovaSolicitacao />} />
                    <Route path="lista-solicitacoes" element={<ListaSolicitacoes />} />
                    <Route path="painel-demandas" element={<PainelDemandas />} />
                    <Route path="detalhes-solicitacao/:id" element={<DetalhesSolicitacao />} />
                    <Route path="cadastrar-usuario" element={<CadastrarUsuario />} />
                    <Route path="lista-usuarios" element={<ListaUsuarios />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
