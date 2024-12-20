import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: JSX.Element
  allowedUserTypes: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedUserTypes }) => {
  const { userType, loading } = useAuth()

  // console.log('ProtectedRoute: userType:', userType)
  // console.log('ProtectedRoute: loading:', loading)

  if (loading) {
    return <p>Carregando...</p>
  }

  if (!userType || !allowedUserTypes.includes(userType)) {
    console.log('ProtectedRoute: Redirecionando para /login')
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute 