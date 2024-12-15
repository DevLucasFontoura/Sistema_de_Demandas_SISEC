import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import NovaSolicitacao from './pages/NovaSolicitacao'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ListaSolicitacoes from './pages/ListaSolicitacoes'
import DetalhesSolicitacao from './pages/DetalhesDaSolicitacao'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true // Temporário, será implementado depois
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <AppLayout>{children}</AppLayout>
}

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/nova-solicitacao"
            element={
              <PrivateRoute>
                <NovaSolicitacao />
              </PrivateRoute>
            }
          />
          <Route
            path="/lista-solicitacoes"
            element={
              <PrivateRoute>
                <ListaSolicitacoes />
              </PrivateRoute>
            }
          />
          <Route
            path="/detalhes-solicitacao/:id"
            element={
              <PrivateRoute>
                <DetalhesSolicitacao />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
